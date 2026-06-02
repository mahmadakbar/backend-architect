import { Worker, Job } from "bullmq";
import { bullmqConnection, QUEUE_NAMES } from "@configs/bullmq.config";
import logger from "@configs/logger.configs";
import { EmailService } from "@services/email.service";
import { ActivityLogService } from "@services/activityLog.service";
import { NotificationService } from "@services/notification.service";
import { IdempotencyService } from "@services/idempotency.service";
import { QueueManager } from "../queue.manager";
import {
  EmailJobData,
  ActivityLogJobData,
  NotificationJobData,
  OrderProcessingJobData,
  JobResult,
} from "../types/job.types";

/**
 * Email Job Processor
 */
export class EmailJobProcessor {
  private static worker: Worker;

  static start(): void {
    this.worker = new Worker(
      QUEUE_NAMES.EMAIL,
      async (job: Job<EmailJobData>) => {
        logger.info(`Processing email job: ${job.id}`);

        try {
          // Check idempotency
          if (job.data.idempotencyKey) {
            const isProcessed = await IdempotencyService.isProcessed(
              job.data.idempotencyKey,
            );
            if (isProcessed) {
              logger.info(`Email already sent: ${job.data.idempotencyKey}`);
              return await IdempotencyService.getProcessedResult(
                job.data.idempotencyKey,
              );
            }
          }

          // Process based on template
          switch (job.data.template) {
            case "invoice":
              await EmailService.sendInvoice(job.data);
              break;
            case "order-confirmation":
              await EmailService.sendOrderConfirmation(job.data);
              break;
            case "status-update":
              await EmailService.sendStatusUpdate(job.data);
              break;
            default:
              throw new Error(`Unknown email template: ${job.data.template}`);
          }

          const result: JobResult = {
            success: true,
            message: `Email sent successfully to ${job.data.to}`,
            timestamp: new Date(),
            data: { jobId: job.id },
          };

          // Mark as processed
          if (job.data.idempotencyKey) {
            await IdempotencyService.markAsProcessed(
              job.data.idempotencyKey,
              result,
            );
          }

          return result;
        } catch (error: any) {
          logger.error(error, `Email job failed: ${job.id}`);

          // On final failure, move to dead letter queue
          if (job.attemptsMade >= (job.opts.attempts || 3)) {
            logger.error(`Email job moved to dead letter: ${job.id}`);
          }

          throw error;
        }
      },
      {
        connection: bullmqConnection,
        concurrency: 5, // Process 5 emails concurrently
      },
    );

    this.worker.on("completed", (job) => {
      logger.info(`✅ Email job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`❌ Email job failed: ${job?.id} - ${err.message}`);
    });

    logger.info("✅ Email job processor started");
  }

  static async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      logger.info("Email job processor stopped");
    }
  }
}

/**
 * Activity Log Job Processor
 */
export class ActivityLogJobProcessor {
  private static worker: Worker;

  static start(): void {
    this.worker = new Worker(
      QUEUE_NAMES.ACTIVITY_LOG,
      async (job: Job<ActivityLogJobData>) => {
        logger.info(`Processing activity log job: ${job.id}`);

        try {
          // Check idempotency
          if (job.data.idempotencyKey) {
            const isProcessed = await IdempotencyService.isProcessed(
              job.data.idempotencyKey,
            );
            if (isProcessed) {
              logger.info(
                `Activity already logged: ${job.data.idempotencyKey}`,
              );
              return await IdempotencyService.getProcessedResult(
                job.data.idempotencyKey,
              );
            }
          }

          await ActivityLogService.logActivity(job.data);

          const result: JobResult = {
            success: true,
            message: `Activity logged: ${job.data.action}`,
            timestamp: new Date(),
            data: { jobId: job.id },
          };

          // Mark as processed
          if (job.data.idempotencyKey) {
            await IdempotencyService.markAsProcessed(
              job.data.idempotencyKey,
              result,
            );
          }

          return result;
        } catch (error: any) {
          logger.error(error, `Activity log job failed: ${job.id}`);

          // On final failure
          if (job.attemptsMade >= (job.opts.attempts || 3)) {
            logger.error(`Activity log job moved to dead letter: ${job.id}`);
          }

          throw error;
        }
      },
      {
        connection: bullmqConnection,
        concurrency: 10, // Higher concurrency for logging
      },
    );

    this.worker.on("completed", (job) => {
      logger.info(`✅ Activity log job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`❌ Activity log job failed: ${job?.id} - ${err.message}`);
    });

    logger.info("✅ Activity log job processor started");
  }

  static async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      logger.info("Activity log job processor stopped");
    }
  }
}

/**
 * Notification Job Processor
 */
export class NotificationJobProcessor {
  private static worker: Worker;

  static start(): void {
    this.worker = new Worker(
      QUEUE_NAMES.NOTIFICATION,
      async (job: Job<NotificationJobData>) => {
        logger.info(`Processing notification job: ${job.id}`);

        try {
          // Check idempotency
          if (job.data.idempotencyKey) {
            const isProcessed = await IdempotencyService.isProcessed(
              job.data.idempotencyKey,
            );
            if (isProcessed) {
              logger.info(
                `Notification already sent: ${job.data.idempotencyKey}`,
              );
              return await IdempotencyService.getProcessedResult(
                job.data.idempotencyKey,
              );
            }
          }

          await NotificationService.createNotification(job.data);

          const result: JobResult = {
            success: true,
            message: `Notification sent to user ${job.data.userId}`,
            timestamp: new Date(),
            data: { jobId: job.id },
          };

          // Mark as processed
          if (job.data.idempotencyKey) {
            await IdempotencyService.markAsProcessed(
              job.data.idempotencyKey,
              result,
            );
          }

          return result;
        } catch (error: any) {
          logger.error(error, `Notification job failed: ${job.id}`);

          // On final failure
          if (job.attemptsMade >= (job.opts.attempts || 3)) {
            logger.error(`Notification job moved to dead letter: ${job.id}`);
          }

          throw error;
        }
      },
      {
        connection: bullmqConnection,
        concurrency: 10,
      },
    );

    this.worker.on("completed", (job) => {
      logger.info(`✅ Notification job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`❌ Notification job failed: ${job?.id} - ${err.message}`);
    });

    logger.info("✅ Notification job processor started");
  }

  static async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      logger.info("Notification job processor stopped");
    }
  }
}

/**
 * Order Processing Job Processor - Orchestrates all order-related jobs
 */
export class OrderProcessingJobProcessor {
  private static worker: Worker;

  static start(): void {
    this.worker = new Worker(
      QUEUE_NAMES.ORDER_PROCESSING,
      async (job: Job<OrderProcessingJobData>) => {
        logger.info(
          `Processing order job: ${job.id} - Order: ${job.data.orderCode}`,
        );

        try {
          // Check idempotency
          const isProcessed = await IdempotencyService.isProcessed(
            job.data.idempotencyKey,
          );
          if (isProcessed) {
            logger.info(`Order already processed: ${job.data.idempotencyKey}`);
            return await IdempotencyService.getProcessedResult(
              job.data.idempotencyKey,
            );
          }

          const {
            orderId,
            orderCode,
            userId,
            totalAmount,
            userEmail,
            userName,
            items,
            status,
          } = job.data;

          // Step 1: Send order confirmation email
          await job.updateProgress(20);
          const confirmationKey = IdempotencyService.generateEmailKey(
            userId,
            "order-confirmation",
            orderId,
          );
          await QueueManager.addEmailJob(
            {
              to: userEmail,
              subject: `Order Confirmation - ${orderCode}`,
              template: "order-confirmation",
              data: {
                orderId,
                orderCode,
                userName,
                totalAmount,
                items,
                status: status || "PENDING",
              },
              userId,
              idempotencyKey: confirmationKey,
            },
            3, // Highest priority for confirmation
          );

          // Step 2: Send invoice email
          await job.updateProgress(40);
          const emailKey = IdempotencyService.generateEmailKey(
            userId,
            "invoice",
            orderId,
          );
          await QueueManager.addEmailJob(
            {
              to: userEmail,
              subject: `Invoice for Order ${orderCode}`,
              template: "invoice",
              data: {
                orderId,
                orderCode,
                userName,
                totalAmount,
                items,
                status: status || "PENDING",
              },
              userId,
              idempotencyKey: emailKey,
            },
            2, // Higher priority
          );

          // Step 3: Save activity log
          await job.updateProgress(60);
          const activityKey = IdempotencyService.generateActivityLogKey(
            userId,
            "ORDER_CREATED",
            orderId,
          );
          await QueueManager.addActivityLogJob({
            userId,
            action: "ORDER_CREATED",
            resource: "order",
            resourceId: orderId,
            details: {
              orderCode,
              totalAmount: Number(totalAmount),
            },
            idempotencyKey: activityKey,
          });

          // Step 4: Send notification
          await job.updateProgress(90);
          const notificationKey = IdempotencyService.generateNotificationKey(
            userId,
            "order",
            orderId,
          );
          await QueueManager.addNotificationJob({
            userId,
            type: "order",
            title: "Order Placed Successfully",
            message: `Your order ${orderCode} has been placed successfully. Total: $${Number(totalAmount).toFixed(2)}`,
            data: {
              orderCode,
              totalAmount: Number(totalAmount),
            },
            idempotencyKey: notificationKey,
          });

          await job.updateProgress(100);

          const result: JobResult = {
            success: true,
            message: `Order ${orderCode} processed successfully`,
            timestamp: new Date(),
            data: {
              jobId: job.id,
              orderId,
              orderCode,
            },
          };

          // Mark as processed
          await IdempotencyService.markAsProcessed(
            job.data.idempotencyKey,
            result,
          );

          logger.info(`✅ Order processed successfully: ${orderCode}`);
          return result;
        } catch (error: any) {
          logger.error(error, `Order processing job failed: ${job.id}`);

          // On final failure
          if (job.attemptsMade >= (job.opts.attempts || 3)) {
            logger.error(
              `Order processing job moved to dead letter: ${job.id}`,
            );

            // TODO: Send alert to admins about failed order processing
          }

          throw error;
        }
      },
      {
        connection: bullmqConnection,
        concurrency: 3, // Lower concurrency for complex operations
      },
    );

    this.worker.on("completed", (job) => {
      logger.info(`✅ Order processing job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(
        `❌ Order processing job failed: ${job?.id} - ${err.message}`,
      );
    });

    logger.info("✅ Order processing job processor started");
  }

  static async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      logger.info("Order processing job processor stopped");
    }
  }
}

/**
 * Start all job processors
 */
export function startAllProcessors(): void {
  EmailJobProcessor.start();
  ActivityLogJobProcessor.start();
  NotificationJobProcessor.start();
  OrderProcessingJobProcessor.start();

  logger.info("🚀 All job processors started successfully");
}

/**
 * Stop all job processors gracefully
 */
export async function stopAllProcessors(): Promise<void> {
  await Promise.all([
    EmailJobProcessor.stop(),
    ActivityLogJobProcessor.stop(),
    NotificationJobProcessor.stop(),
    OrderProcessingJobProcessor.stop(),
  ]);

  logger.info("✅ All job processors stopped successfully");
}
