import { Queue, QueueEvents } from "bullmq";
import {
  bullmqConnection,
  defaultJobOptions,
  QUEUE_NAMES,
} from "@configs/bullmq.config";
import logger from "@configs/logger.configs";
import {
  EmailJobData,
  ActivityLogJobData,
  NotificationJobData,
  OrderProcessingJobData,
} from "./types/job.types";
import { IdempotencyService } from "@services/idempotency.service";

/**
 * Queue Manager - Centralized queue management
 */
export class QueueManager {
  private static queues: Map<string, Queue> = new Map();
  private static queueEvents: Map<string, QueueEvents> = new Map();

  /**
   * Initialize all queues
   */
  static async initialize(): Promise<void> {
    try {
      // Create queues
      this.createQueue(QUEUE_NAMES.EMAIL);
      this.createQueue(QUEUE_NAMES.ACTIVITY_LOG);
      this.createQueue(QUEUE_NAMES.NOTIFICATION);
      this.createQueue(QUEUE_NAMES.ORDER_PROCESSING);

      // Setup event listeners
      this.setupEventListeners();

      logger.info("✅ All job queues initialized successfully");
    } catch (error) {
      logger.error(error, "Failed to initialize queues");
      throw error;
    }
  }

  /**
   * Create a queue
   */
  private static createQueue(queueName: string): Queue {
    const queue = new Queue(queueName, {
      connection: bullmqConnection,
      defaultJobOptions,
    });

    this.queues.set(queueName, queue);
    logger.info(`Queue created: ${queueName}`);
    return queue;
  }

  /**
   * Get a queue by name
   */
  static getQueue(queueName: string): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    return queue;
  }

  /**
   * Setup event listeners for all queues
   */
  private static setupEventListeners(): void {
    for (const [queueName, queue] of this.queues) {
      const queueEvents = new QueueEvents(queueName, {
        connection: bullmqConnection,
      });

      // Job completed
      queueEvents.on("completed", ({ jobId }) => {
        logger.info(`Job completed: ${queueName}:${jobId}`);
      });

      // Job failed
      queueEvents.on("failed", ({ jobId, failedReason }) => {
        logger.error(`Job failed: ${queueName}:${jobId} - ${failedReason}`);
      });

      // Job retried
      queueEvents.on("retries-exhausted", ({ jobId }) => {
        logger.error(
          `Job exhausted retries: ${queueName}:${jobId} - Moving to dead letter queue`,
        );
      });

      this.queueEvents.set(queueName, queueEvents);
    }
  }

  /**
   * Add email job to queue
   */
  static async addEmailJob(
    data: EmailJobData,
    priority?: number,
  ): Promise<string> {
    // Check idempotency
    if (data.idempotencyKey) {
      const isProcessed = await IdempotencyService.isProcessed(
        data.idempotencyKey,
      );
      if (isProcessed) {
        logger.info(`Email job already processed: ${data.idempotencyKey}`);
        const result = await IdempotencyService.getProcessedResult(
          data.idempotencyKey,
        );
        return result?.jobId || "already-processed";
      }
    }

    const queue = this.getQueue(QUEUE_NAMES.EMAIL);
    const job = await queue.add("send-email", data, {
      priority,
      jobId: data.idempotencyKey?.replace(/:/g, "_"), // Replace colons for BullMQ compatibility
    });

    logger.info(`Email job added to queue: ${job.id}`);
    return job.id!;
  }

  /**
   * Add activity log job to queue
   */
  static async addActivityLogJob(
    data: ActivityLogJobData,
    priority?: number,
  ): Promise<string> {
    // Generate idempotency key if not provided
    if (!data.idempotencyKey) {
      data.idempotencyKey = IdempotencyService.generateActivityLogKey(
        data.userId,
        data.action,
        data.resourceId,
      );
    }

    const queue = this.getQueue(QUEUE_NAMES.ACTIVITY_LOG);
    const job = await queue.add("log-activity", data, {
      priority,
      jobId: data.idempotencyKey?.replace(/:/g, "_"),
    });

    logger.info(`Activity log job added to queue: ${job.id}`);
    return job.id!;
  }

  /**
   * Add notification job to queue
   */
  static async addNotificationJob(
    data: NotificationJobData,
    priority?: number,
  ): Promise<string> {
    // Check idempotency
    if (data.idempotencyKey) {
      const isProcessed = await IdempotencyService.isProcessed(
        data.idempotencyKey,
      );
      if (isProcessed) {
        logger.info(
          `Notification job already processed: ${data.idempotencyKey}`,
        );
        const result = await IdempotencyService.getProcessedResult(
          data.idempotencyKey,
        );
        return result?.jobId || "already-processed";
      }
    }

    const queue = this.getQueue(QUEUE_NAMES.NOTIFICATION);
    const job = await queue.add("send-notification", data, {
      priority,
      jobId: data.idempotencyKey?.replace(/:/g, "_"),
    });

    logger.info(`Notification job added to queue: ${job.id}`);
    return job.id!;
  }

  /**
   * Add order processing job to queue
   */
  static async addOrderProcessingJob(
    data: OrderProcessingJobData,
    priority: number = 1,
  ): Promise<string> {
    // Order processing MUST have idempotency key
    if (!data.idempotencyKey) {
      throw new Error("Order processing requires idempotency key");
    }

    // Check if already processed
    const isProcessed = await IdempotencyService.isProcessed(
      data.idempotencyKey,
    );
    if (isProcessed) {
      logger.info(`Order already processed: ${data.idempotencyKey}`);
      const result = await IdempotencyService.getProcessedResult(
        data.idempotencyKey,
      );
      return result?.jobId || "already-processed";
    }

    const queue = this.getQueue(QUEUE_NAMES.ORDER_PROCESSING);
    const job = await queue.add("process-order", data, {
      priority,
      jobId: data.idempotencyKey.replace(/:/g, "_"), // Replace colons for BullMQ compatibility
    });

    logger.info(`Order processing job added to queue: ${job.id}`);
    return job.id!;
  }

  /**
   * Get job status
   */
  static async getJobStatus(queueName: string, jobId: string): Promise<any> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }

  /**
   * Get queue metrics
   */
  static async getQueueMetrics(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get all failed jobs for inspection
   */
  static async getFailedJobs(
    queueName: string,
    start = 0,
    end = 10,
  ): Promise<any[]> {
    const queue = this.getQueue(queueName);
    const failedJobs = await queue.getFailed(start, end);

    return failedJobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    }));
  }

  /**
   * Retry a failed job
   */
  static async retryJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    await job.retry();
    logger.info(`Job retried: ${queueName}:${jobId}`);
  }

  /**
   * Clean completed jobs
   */
  static async cleanCompleted(
    queueName: string,
    grace: number = 24 * 3600 * 1000,
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 1000, "completed");
    logger.info(`Cleaned completed jobs in ${queueName}`);
  }

  /**
   * Shutdown all queues gracefully
   */
  static async shutdown(): Promise<void> {
    logger.info("Shutting down queues...");

    for (const [queueName, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue closed: ${queueName}`);
    }

    for (const [queueName, queueEvents] of this.queueEvents) {
      await queueEvents.close();
      logger.info(`Queue events closed: ${queueName}`);
    }

    this.queues.clear();
    this.queueEvents.clear();

    logger.info("✅ All queues shut down gracefully");
  }
}
