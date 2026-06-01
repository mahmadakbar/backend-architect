import { QueueService } from "@utils/queue.service";
import logger from "@configs/logger.configs";
import { app } from "../app";

/**
 * Background worker to process queued requests
 * This should run continuously
 */
export class QueueWorker {
  private static isRunning = false;
  private static processingInterval: NodeJS.Timeout | null = null;

  static async start(intervalMs: number = 1000) {
    if (this.isRunning) {
      logger.info("Queue worker is already running");
      return;
    }

    this.isRunning = true;
    logger.info("✅ Queue worker started");

    this.processingInterval = setInterval(async () => {
      try {
        await this.processNextRequest();
      } catch (error) {
        logger.error("Queue worker error:", error);
      }
    }, intervalMs);
  }

  static stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isRunning = false;
    logger.info("Queue worker stopped");
  }

  private static async processNextRequest() {
    const queueDepth = await QueueService.getQueueDepth();
    if (queueDepth === 0) return;

    await QueueService.processQueue(async (data) => {
      logger.info(`Processing queued request: ${data.method} ${data.path}`);

      try {
        // For now, we'll simulate processing the request
        // In a real implementation, you would:
        // 1. Create a mock request/response object
        // 2. Execute the route handler
        // 3. Return the result

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Return a success response (you would replace this with actual route handling)
        return {
          success: true,
          message: `Request processed: ${data.method} ${data.path}`,
          data: data,
        };
      } catch (error: any) {
        logger.error(`Error processing queued request: ${error.message}`);
        throw error;
      }
    });
  }
}
