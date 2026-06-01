import { Request, Response, NextFunction } from "express";
import { QueueService } from "@utils/queue.service";
import redisClient from "@configs/redis.config";
import { env } from "@configs/env.configs";
import logger from "@configs/logger.configs";

export interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
}

/**
 * Rate limiter middleware with Redis and queueing support
 * Instead of rejecting requests, enqueues them and returns 202 Accepted
 */
export const MRateLimitWithQueue = (config: RateLimitConfig = {}) => {
  const windowMs = config.windowMs || env.RATE_LIMIT.WINDOW_MS;
  const maxRequests = config.maxRequests || env.RATE_LIMIT.MAX_REQUESTS;
  const RATE_LIMIT_PREFIX = "ratelimit:";

  const getRateLimitKey = (identifier: string): string => {
    return `${RATE_LIMIT_PREFIX}${identifier}`;
  };

  const checkRateLimit = async (
    identifier: string,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> => {
    const key = getRateLimitKey(identifier);
    const now = Date.now();

    try {
      // Use atomic INCR operation
      const current = await redisClient.incr(key);

      if (current === 1) {
        // First request in this window, set expiration
        await redisClient.pexpire(key, windowMs);
      }

      // Get TTL to calculate reset time
      const ttl = await redisClient.pttl(key);
      const resetTime = now + ttl;

      if (current > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - current),
        resetTime,
      };
    } catch (error) {
      logger.error(error, "Rate limit check error:");
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use user ID if authenticated, otherwise use IP address
      const identifier = (req as any).user?.id || req.ip || "anonymous";

      logger.info(`Rate limit check for identifier: ${identifier}`);

      const rateLimitResult = await checkRateLimit(identifier);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        rateLimitResult.remaining.toString(),
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(rateLimitResult.resetTime).toISOString(),
      );

      if (!rateLimitResult.allowed) {
        // Queue the request instead of returning error
        const requestData = {
          method: req.method,
          url: req.originalUrl,
          path: req.path,
          headers: req.headers as Record<string, string>,
          body: req.body,
          query: req.query,
          params: req.params,
          user: (req as any).user,
          identifier,
        };

        const queueInfo = await QueueService.enqueue(requestData);

        logger.info(
          `Request queued: ${queueInfo.queueToken}, Position: ${queueInfo.position}`,
        );

        // Return 202 Accepted with queue information
        return res.status(202).json({
          status: "queued",
          message: "Request rate limit exceeded. Your request has been queued.",
          queueToken: queueInfo.queueToken,
          position: queueInfo.position,
          total: queueInfo.total,
          estimatedWait: queueInfo.estimatedWait,
          checkStatusUrl: `/api/v1/queue/status/${queueInfo.queueToken}`,
        });
      }

      // Request allowed, continue to next middleware
      next();
    } catch (error) {
      logger.error(error, "Rate limiter middleware error:");
      // On error, allow the request (fail open)
      next();
    }
  };
};
