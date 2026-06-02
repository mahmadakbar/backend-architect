import redisClient from "@configs/redis.config";
import logger from "@configs/logger.configs";

/**
 * Idempotency Service to prevent duplicate job execution
 * Uses Redis to track processed jobs
 */
export class IdempotencyService {
  private static readonly PREFIX = "idempotency:";
  private static readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours

  /**
   * Check if a job with this idempotency key has already been processed
   */
  static async isProcessed(idempotencyKey: string): Promise<boolean> {
    try {
      const key = `${this.PREFIX}${idempotencyKey}`;
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(error, "Error checking idempotency");
      return false;
    }
  }

  /**
   * Mark a job as processed
   */
  static async markAsProcessed(
    idempotencyKey: string,
    result: any,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const key = `${this.PREFIX}${idempotencyKey}`;
      const value = JSON.stringify({
        result,
        processedAt: new Date().toISOString(),
      });
      await redisClient.setex(key, ttl, value);
      logger.info(`Marked job as processed: ${idempotencyKey}`);
    } catch (error) {
      logger.error(error, "Error marking job as processed");
      throw error;
    }
  }

  /**
   * Get the result of a previously processed job
   */
  static async getProcessedResult(idempotencyKey: string): Promise<any | null> {
    try {
      const key = `${this.PREFIX}${idempotencyKey}`;
      const data = await redisClient.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed.result;
    } catch (error) {
      logger.error(error, "Error getting processed result");
      return null;
    }
  }

  /**
   * Generate idempotency key for order processing
   */
  static generateOrderKey(orderId: number, action: string = "process"): string {
    return `order:${orderId}:${action}`;
  }

  /**
   * Generate idempotency key for email
   */
  static generateEmailKey(
    userId: number,
    type: string,
    resourceId: number,
  ): string {
    return `email:${userId}:${type}:${resourceId}`;
  }

  /**
   * Generate idempotency key for notification
   */
  static generateNotificationKey(
    userId: number,
    type: string,
    resourceId: number,
  ): string {
    return `notification:${userId}:${type}:${resourceId}`;
  }

  /**
   * Generate idempotency key for activity log
   */
  static generateActivityLogKey(
    userId: number,
    action: string,
    resourceId: number,
  ): string {
    return `activity:${userId}:${action}:${resourceId}:${Date.now()}`;
  }
}
