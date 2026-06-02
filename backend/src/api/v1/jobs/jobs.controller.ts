import { Request, Response, NextFunction } from "express";
import { QueueManager } from "@jobs/queue.manager";
import { QUEUE_NAMES } from "@configs/bullmq.config";
import logger from "@configs/logger.configs";

/**
 * Get metrics for all queues
 */
export const CGetQueueMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await Promise.all([
      QueueManager.getQueueMetrics(QUEUE_NAMES.EMAIL),
      QueueManager.getQueueMetrics(QUEUE_NAMES.ACTIVITY_LOG),
      QueueManager.getQueueMetrics(QUEUE_NAMES.NOTIFICATION),
      QueueManager.getQueueMetrics(QUEUE_NAMES.ORDER_PROCESSING),
    ]);

    res.status(200).json({
      success: true,
      message: "Queue metrics retrieved successfully",
      data: {
        queues: metrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(error, "Failed to get queue metrics");
    next(error);
  }
};

/**
 * Get failed jobs from a specific queue
 */
export const CGetFailedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { queueName } = req.params;
    const start = parseInt(req.query.start as string) || 0;
    const end = parseInt(req.query.end as string) || 10;

    const failedJobs = await QueueManager.getFailedJobs(queueName, start, end);

    res.status(200).json({
      success: true,
      message: "Failed jobs retrieved successfully",
      data: {
        queueName,
        jobs: failedJobs,
        start,
        end,
        count: failedJobs.length,
      },
    });
  } catch (error) {
    logger.error(error, "Failed to get failed jobs");
    next(error);
  }
};

/**
 * Retry a failed job
 */
export const CRetryJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { queueName, jobId } = req.params;

    await QueueManager.retryJob(queueName, jobId);

    res.status(200).json({
      success: true,
      message: "Job retry initiated successfully",
      data: {
        queueName,
        jobId,
      },
    });
  } catch (error) {
    logger.error(error, "Failed to retry job");
    next(error);
  }
};

/**
 * Get job status
 */
export const CGetJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { queueName, jobId } = req.params;

    const jobStatus = await QueueManager.getJobStatus(queueName, jobId);

    if (!jobStatus) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job status retrieved successfully",
      data: jobStatus,
    });
  } catch (error) {
    logger.error(error, "Failed to get job status");
    next(error);
  }
};

/**
 * Clean completed jobs from a queue
 */
export const CCleanCompletedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { queueName } = req.params;
    const grace = parseInt(req.query.grace as string) || 24 * 3600 * 1000; // 24 hours default

    await QueueManager.cleanCompleted(queueName, grace);

    res.status(200).json({
      success: true,
      message: `Completed jobs cleaned from ${queueName}`,
      data: {
        queueName,
        grace,
      },
    });
  } catch (error) {
    logger.error(error, "Failed to clean completed jobs");
    next(error);
  }
};
