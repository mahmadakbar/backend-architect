import Redis from "ioredis";
import { env } from "./env.configs";
import logger from "./logger.configs";

const redisClient = new Redis(env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err: Error) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redisClient.on("error", (err) => {
  logger.error(err, "Redis Client Error:");
});

redisClient.on("connect", () => {
  logger.info("✅ Redis connected successfully");
});

redisClient.on("close", () => {
  logger.warn("Redis connection closed");
});

export default redisClient;
