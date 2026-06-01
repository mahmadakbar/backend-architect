import Redis from "ioredis";
import { EnvConfig } from "./env.configs";
import { logger } from "./logger.configs";

class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!this.instance) {
      const redisUrl = EnvConfig.REDIS_URL || "redis://localhost:6379";

      this.instance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError(err: Error) {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      this.instance.on("connect", () => {
        logger.info("Redis client connected");
      });

      this.instance.on("error", (err: Error) => {
        logger.error("Redis client error:", err);
      });

      this.instance.on("close", () => {
        logger.warn("Redis connection closed");
      });
    }

    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      this.instance = null;
      logger.info("Redis client disconnected");
    }
  }
}

export const redisClient = RedisClient.getInstance();
export { RedisClient };
