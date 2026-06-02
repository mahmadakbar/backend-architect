import { Router } from "express";
import { MAuthToken, MCheckRole } from "@middlewares";
import {
  CGetQueueMetrics,
  CGetFailedJobs,
  CRetryJob,
  CGetJobStatus,
  CCleanCompletedJobs,
} from "./jobs.controller";

const router = Router();

// All routes require authentication and admin/superadmin role
router.use(MAuthToken);
router.use(MCheckRole(["admin", "superadmin"]));

/**
 * GET /api/v1/jobs/metrics
 * Get metrics for all queues
 */
router.get("/metrics", CGetQueueMetrics);
// #swagger.tags = ['Jobs']
// #swagger.summary = 'Get queue metrics'
// #swagger.description = 'Get metrics for all job queues (admin only)'
// #swagger.security = [{ "bearerAuth": [] }]

/**
 * GET /api/v1/jobs/:queueName/failed
 * Get failed jobs from a specific queue
 */
router.get("/:queueName/failed", CGetFailedJobs);
// #swagger.tags = ['Jobs']
// #swagger.summary = 'Get failed jobs'
// #swagger.description = 'Get failed jobs from a specific queue (admin only)'
// #swagger.security = [{ "bearerAuth": [] }]

/**
 * POST /api/v1/jobs/:queueName/:jobId/retry
 * Retry a failed job
 */
router.post("/:queueName/:jobId/retry", CRetryJob);
// #swagger.tags = ['Jobs']
// #swagger.summary = 'Retry failed job'
// #swagger.description = 'Retry a failed job (admin only)'
// #swagger.security = [{ "bearerAuth": [] }]

/**
 * GET /api/v1/jobs/:queueName/:jobId/status
 * Get job status
 */
router.get("/:queueName/:jobId/status", CGetJobStatus);
// #swagger.tags = ['Jobs']
// #swagger.summary = 'Get job status'
// #swagger.description = 'Get the status of a specific job (admin only)'
// #swagger.security = [{ "bearerAuth": [] }]

/**
 * DELETE /api/v1/jobs/:queueName/completed
 * Clean completed jobs from a queue
 */
router.delete("/:queueName/completed", CCleanCompletedJobs);
// #swagger.tags = ['Jobs']
// #swagger.summary = 'Clean completed jobs'
// #swagger.description = 'Remove completed jobs from a queue (admin only)'
// #swagger.security = [{ "bearerAuth": [] }]

export default router;
