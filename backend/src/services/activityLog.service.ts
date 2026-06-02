import { prisma } from "@prisma/prisma.clients";
import logger from "@configs/logger.configs";
import { ActivityLogJobData } from "../jobs/types/job.types";

/**
 * Activity Log Service for tracking user actions
 */
export class ActivityLogService {
  /**
   * Create an activity log entry
   */
  static async logActivity(data: ActivityLogJobData): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      logger.info(
        `Activity logged: ${data.action} on ${data.resource}:${data.resourceId} by user ${data.userId}`,
      );
    } catch (error) {
      logger.error(error, "Failed to log activity");
      throw error;
    }
  }

  /**
   * Log order creation activity
   */
  static async logOrderCreated(
    userId: number,
    orderId: number,
    orderCode: string,
    totalAmount: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logActivity({
      userId,
      action: "ORDER_CREATED",
      resource: "order",
      resourceId: orderId,
      details: {
        orderCode,
        totalAmount: Number(totalAmount),
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log order status change activity
   */
  static async logOrderStatusChanged(
    userId: number,
    orderId: number,
    orderCode: string,
    oldStatus: string,
    newStatus: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logActivity({
      userId,
      action: "ORDER_STATUS_CHANGED",
      resource: "order",
      resourceId: orderId,
      details: {
        orderCode,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get user activity logs with pagination
   */
  static async getUserActivityLogs(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({
        where: { userId },
      }),
    ]);

    return {
      logs: logs.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
