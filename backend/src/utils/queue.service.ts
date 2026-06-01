import { v4 as uuidv4 } from "uuid";
import redisClient from "@configs/redis.config";
import logger from "@configs/logger.configs";

// Dynamic import to avoid circular dependency
let io: any = null;
const getIO = () => {
  if (!io) {
    io = require("../app").io;
  }
  return io;
};

export interface QueueStatus {
  status: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED";
  position?: number;
  total?: number;
  estimatedWait?: number; // in seconds
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export class QueueService {
  private static readonly QUEUE_PREFIX = "queue:";
  private static readonly REQUEST_QUEUE = "request_queue";
  private static readonly QUEUE_TTL = 600; // 10 minutes

  /**
   * Enqueue a request and return queue token
   */
  static async enqueue(requestData: any): Promise<{
    queueToken: string;
    position: number;
    total: number;
    estimatedWait: number;
  }> {
    const queueToken = uuidv4();
    const timestamp = Date.now();

    // Add to queue list
    await redisClient.rpush(this.REQUEST_QUEUE, queueToken);

    // Get position and total
    const queueList = await redisClient.lrange(this.REQUEST_QUEUE, 0, -1);
    const position = queueList.indexOf(queueToken) + 1;
    const total = queueList.length;

    // Store request data and status
    const queueStatus: QueueStatus = {
      status: "WAITING",
      position,
      total,
      estimatedWait: position * 2, // 2 seconds per request (adjustable)
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await redisClient.setex(
      `${this.QUEUE_PREFIX}${queueToken}`,
      this.QUEUE_TTL,
      JSON.stringify(queueStatus),
    );

    // Store request data
    await redisClient.setex(
      `${this.QUEUE_PREFIX}${queueToken}:data`,
      this.QUEUE_TTL,
      JSON.stringify(requestData),
    );

    return {
      queueToken,
      position,
      total,
      estimatedWait: queueStatus.estimatedWait!,
    };
  }

  /**
   * Get queue status by token
   */
  static async getStatus(queueToken: string): Promise<QueueStatus | null> {
    const data = await redisClient.get(`${this.QUEUE_PREFIX}${queueToken}`);
    if (!data) return null;

    const status: QueueStatus = JSON.parse(data);

    // Update position if still waiting
    if (status.status === "WAITING") {
      const queueList = await redisClient.lrange(this.REQUEST_QUEUE, 0, -1);
      const currentPosition = queueList.indexOf(queueToken) + 1;
      if (currentPosition > 0) {
        status.position = currentPosition;
        status.total = queueList.length;
        status.estimatedWait = currentPosition * 2;
        status.updatedAt = Date.now();

        // Update in Redis
        await redisClient.setex(
          `${this.QUEUE_PREFIX}${queueToken}`,
          this.QUEUE_TTL,
          JSON.stringify(status),
        );
      }
    }

    return status;
  }

  /**
   * Dequeue next request for processing
   */
  static async dequeue(): Promise<{ queueToken: string; data: any } | null> {
    const queueToken = await redisClient.lpop(this.REQUEST_QUEUE);
    if (!queueToken) return null;

    const requestData = await redisClient.get(
      `${this.QUEUE_PREFIX}${queueToken}:data`,
    );
    if (!requestData) return null;

    // Update status to PROCESSING
    const status: QueueStatus = {
      status: "PROCESSING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await redisClient.setex(
      `${this.QUEUE_PREFIX}${queueToken}`,
      this.QUEUE_TTL,
      JSON.stringify(status),
    );

    return {
      queueToken,
      data: JSON.parse(requestData),
    };
  }

  /**
   * Mark request as completed with result
   */
  static async complete(queueToken: string, result: any): Promise<void> {
    const status: QueueStatus = {
      status: "COMPLETED",
      result,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await redisClient.setex(
      `${this.QUEUE_PREFIX}${queueToken}`,
      this.QUEUE_TTL,
      JSON.stringify(status),
    );

    // Emit Socket.IO event
    try {
      const socketIO = getIO();
      socketIO.to(`queue:${queueToken}`).emit("queue-update", {
        queueToken,
        status: "COMPLETED",
        result,
      });
      logger.info(`Emitted completion event for queue token: ${queueToken}`);
    } catch (error) {
      logger.error(error, "Error emitting Socket.IO event:");
    }
  }

  /**
   * Mark request as failed with error
   */
  static async fail(queueToken: string, error: string): Promise<void> {
    const status: QueueStatus = {
      status: "FAILED",
      error,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await redisClient.setex(
      `${this.QUEUE_PREFIX}${queueToken}`,
      this.QUEUE_TTL,
      JSON.stringify(status),
    );

    // Emit Socket.IO event
    try {
      const socketIO = getIO();
      socketIO.to(`queue:${queueToken}`).emit("queue-update", {
        queueToken,
        status: "FAILED",
        error,
      });
      logger.info(`Emitted failure event for queue token: ${queueToken}`);
    } catch (error) {
      logger.error(error, "Error emitting Socket.IO event:");
    }
  }

  /**
   * Get current queue depth
   */
  static async getQueueDepth(): Promise<number> {
    return await redisClient.llen(this.REQUEST_QUEUE);
  }

  /**
   * Process queued requests (background worker)
   */
  static async processQueue(
    processFn: (data: any) => Promise<any>,
  ): Promise<void> {
    const item = await this.dequeue();
    if (!item) return;

    try {
      const result = await processFn(item.data);
      await this.complete(item.queueToken, result);
    } catch (error: any) {
      await this.fail(item.queueToken, error.message);
    }
  }
}
