import { Router, Request, Response } from "express";
import { QueueService } from "@utils/queue.service";

const router = Router();

/**
 * Get queue status by token
 * GET /api/v1/queue/status/:token
 */
router.get("/status/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const status = await QueueService.getStatus(token);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Queue token not found or expired",
      });
    }

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error("Queue status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get queue status",
      error: error.message,
    });
  }
});

/**
 * Get current queue depth
 * GET /api/v1/queue/depth
 */
router.get("/depth", async (req: Request, res: Response) => {
  try {
    const depth = await QueueService.getQueueDepth();

    return res.status(200).json({
      success: true,
      data: {
        depth,
      },
    });
  } catch (error: any) {
    console.error("Queue depth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get queue depth",
      error: error.message,
    });
  }
});

export default router;
