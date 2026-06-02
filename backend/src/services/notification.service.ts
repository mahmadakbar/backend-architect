import { prisma } from "@prisma/prisma.clients";
import logger from "@configs/logger.configs";
import { NotificationJobData } from "../jobs/types/job.types";

/**
 * Notification Service for sending notifications to users
 */
export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(data: NotificationJobData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data ? JSON.stringify(data.data) : null,
          isRead: false,
        },
      });

      logger.info(
        `Notification created for user ${data.userId}: ${data.title}`,
      );

      // Here you could add additional channels:
      // - Send push notification
      // - Send SMS
      // - Send email notification
      // - Emit Socket.IO event for real-time notification

      if (data.channels) {
        await this.sendToChannels(data);
      }
    } catch (error) {
      logger.error(error, "Failed to create notification");
      throw error;
    }
  }

  /**
   * Send notification through multiple channels
   */
  private static async sendToChannels(
    data: NotificationJobData,
  ): Promise<void> {
    const channels = data.channels || [];

    for (const channel of channels) {
      try {
        switch (channel) {
          case "email":
            // Email notification would be sent via EmailService
            logger.info(`Email notification sent to user ${data.userId}`);
            break;
          case "push":
            // Push notification (FCM, APNS, etc.)
            logger.info(`Push notification sent to user ${data.userId}`);
            break;
          case "sms":
            // SMS notification (Twilio, AWS SNS, etc.)
            logger.info(`SMS notification sent to user ${data.userId}`);
            break;
        }
      } catch (error) {
        logger.error(error, `Failed to send ${channel} notification`);
        // Continue with other channels even if one fails
      }
    }
  }

  /**
   * Create order notification
   */
  static async notifyOrderCreated(
    userId: number,
    orderCode: string,
    totalAmount: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: "order",
      title: "Order Placed Successfully",
      message: `Your order ${orderCode} has been placed successfully. Total: $${Number(totalAmount).toFixed(2)}`,
      data: {
        orderCode,
        totalAmount: Number(totalAmount),
        action: "view_order",
      },
    });
  }

  /**
   * Create order status change notification
   */
  static async notifyOrderStatusChanged(
    userId: number,
    orderCode: string,
    status: string,
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      PENDING: "Your order is pending confirmation",
      PROCESSING: "Your order is being processed",
      SHIPPED: "Your order has been shipped",
      DELIVERED: "Your order has been delivered",
      CANCELLED: "Your order has been cancelled",
    };

    await this.createNotification({
      userId,
      type: "order",
      title: "Order Status Updated",
      message: `${orderCode}: ${statusMessages[status] || `Status changed to ${status}`}`,
      data: {
        orderCode,
        status,
        action: "view_order",
      },
    });
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications: notifications.map((notif) => ({
        ...notif,
        data: notif.data ? JSON.parse(notif.data) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
