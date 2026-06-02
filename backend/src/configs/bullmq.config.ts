import { ConnectionOptions } from "bullmq";
import { env } from "./env.configs";

/**
 * BullMQ Redis connection configuration
 */
export const bullmqConnection: ConnectionOptions = {
  host: env.REDIS_HOST || "localhost",
  port: env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

/**
 * Default job options with retry mechanism
 */
export const defaultJobOptions = {
  attempts: 3, // Retry up to 3 times
  backoff: {
    type: "exponential" as const,
    delay: 2000, // Start with 2 seconds, then 4s, 8s
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: false, // Keep failed jobs for inspection
};

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  EMAIL: "email-queue",
  ACTIVITY_LOG: "activity-log-queue",
  NOTIFICATION: "notification-queue",
  ORDER_PROCESSING: "order-processing-queue",
} as const;
