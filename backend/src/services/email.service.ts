import nodemailer, { Transporter } from "nodemailer";
import { env } from "@configs/env.configs";
import logger from "@configs/logger.configs";
import { EmailJobData } from "../jobs/types/job.types";

/**
 * Email Service for sending emails
 */
export class EmailService {
  private static transporter: Transporter;

  /**
   * Initialize email transporter
   */
  static initialize() {
    // Configure with SMTP settings (Gmail SSL on port 465)
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || "smtp.gmail.com",
      port: env.SMTP_PORT || 465,
      secure: env.SMTP_SECURE || true, // true for SSL (port 465)
      auth: {
        user: env.SMTP_USER || "your-email@gmail.com",
        pass: env.SMTP_PASS || "your-app-password",
      },
    });

    logger.info(
      "✅ Email service initialized with " + (env.SMTP_SECURE ? "SSL" : "TLS"),
    );
  }

  /**
   * Send invoice email
   */
  static async sendInvoice(data: EmailJobData): Promise<void> {
    const { to, data: orderData } = data;

    const htmlContent = this.generateInvoiceHTML(orderData);

    // TODO: Temporarily hardcoded for testing - will be dynamic based on user.email from DB
    const recipientEmail = "alanmy.maulana@gmail.com";

    const mailOptions = {
      from: env.SMTP_FROM || '"E-Commerce" <noreply@ecommerce.com>',
      to: recipientEmail, // Hardcoded for testing
      subject: `Invoice for Order ${orderData.orderCode}`,
      html: htmlContent,
    };

    try {
      // In development, log instead of sending
      if (env.NODE_ENV === "development") {
        logger.info(
          `[EMAIL] Would send invoice to ${to} for order ${orderData.orderCode}`,
        );
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Invoice email sent: ${info.messageId}`);
    } catch (error) {
      logger.error(error, "Failed to send invoice email");
      throw error;
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(data: EmailJobData): Promise<void> {
    const { to, data: orderData } = data;

    const htmlContent = this.generateOrderConfirmationHTML(orderData);

    // TODO: Temporarily hardcoded for testing - will be dynamic based on user.email from DB
    const recipientEmail = "alanmy.maulana@gmail.com";

    const mailOptions = {
      from: env.SMTP_FROM || '"E-Commerce" <noreply@ecommerce.com>',
      to: recipientEmail, // Hardcoded for testing
      subject: `Order Confirmation - ${orderData.orderCode}`,
      html: htmlContent,
    };

    try {
      if (env.NODE_ENV === "development") {
        logger.info(
          `[EMAIL] Would send order confirmation to ${to} for order ${orderData.orderCode}`,
        );
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Order confirmation email sent: ${info.messageId}`);
    } catch (error) {
      logger.error(error, "Failed to send order confirmation email");
      throw error;
    }
  }

  /**
   * Send order status update email
   */
  static async sendStatusUpdate(data: EmailJobData): Promise<void> {
    const { to, data: orderData } = data;

    const htmlContent = this.generateStatusUpdateHTML(orderData);

    // TODO: Temporarily hardcoded for testing - will be dynamic based on user.email from DB
    const recipientEmail = "alanmy.maulana@gmail.com";

    const statusInfo = this.getStatusInfo(orderData.status || "PENDING");

    const mailOptions = {
      from: env.SMTP_FROM || '"E-Commerce" <noreply@ecommerce.com>',
      to: recipientEmail, // Hardcoded for testing
      subject: `Order ${orderData.orderCode} - Status Updated to ${statusInfo.label}`,
      html: htmlContent,
    };

    try {
      if (env.NODE_ENV === "development") {
        logger.info(
          `[EMAIL] Would send status update to ${to} for order ${orderData.orderCode} - ${orderData.status}`,
        );
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Status update email sent: ${info.messageId}`);
    } catch (error) {
      logger.error(error, "Failed to send status update email");
      throw error;
    }
  }

  /**
   * Get status display information (color, label, emoji)
   */
  private static getStatusInfo(status: string): {
    color: string;
    label: string;
    emoji: string;
  } {
    const statusMap: Record<
      string,
      { color: string; label: string; emoji: string }
    > = {
      PENDING: { color: "#f39c12", label: "Pending", emoji: "⏳" },
      PROCESSING: { color: "#3498db", label: "Processing", emoji: "📦" },
      COMPLETED: { color: "#27ae60", label: "Completed", emoji: "✅" },
      CANCELLED: { color: "#e74c3c", label: "Cancelled", emoji: "❌" },
    };

    return (
      statusMap[status] || { color: "#95a5a6", label: status, emoji: "📋" }
    );
  }

  /**
   * Format number to IDR currency (e.g., Rp 1.049.000)
   */
  private static formatIDR(amount: number): string {
    return `Rp ${amount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  }

  /**
   * Generate invoice HTML template
   */
  private static generateInvoiceHTML(orderData: any): string {
    const itemsHTML = orderData.items
      ?.map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || "Product"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${this.formatIDR(Number(item.price))}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${this.formatIDR(Number(item.price) * item.quantity)}</td>
        </tr>
      `,
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Invoice</h1>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Code:</strong> ${orderData.orderCode}</p>
            <p><strong>Customer:</strong> ${orderData.userName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: ${this.getStatusInfo(orderData.status || "PENDING").color}; font-weight: bold;">${this.getStatusInfo(orderData.status || "PENDING").emoji} ${this.getStatusInfo(orderData.status || "PENDING").label}</span></p>
          </div>

          <h2 style="color: #2c3e50; margin-top: 30px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #3498db; color: white;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            <h2 style="color: #2c3e50; margin: 0;">Total Amount: <span style="color: #27ae60;">${this.formatIDR(Number(orderData.totalAmount))}</span></h2>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-left: 4px solid #27ae60; border-radius: 5px;">
            <p style="margin: 0;"><strong>Thank you for your order!</strong></p>
            <p style="margin: 10px 0 0 0;">Your order is being processed and will be shipped soon.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order confirmation HTML template
   */
  private static generateOrderConfirmationHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #27ae60;">Order Confirmed! 🎉</h1>
          
          <p>Dear ${orderData.userName},</p>
          
          <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
            <p><strong>Order Code:</strong> ${orderData.orderCode}</p>
            <p><strong>Total Amount:</strong> ${this.formatIDR(Number(orderData.totalAmount))}</p>
            <p><strong>Status:</strong> <span style="color: ${this.getStatusInfo(orderData.status || "PENDING").color}; font-weight: bold;">${this.getStatusInfo(orderData.status || "PENDING").emoji} ${this.getStatusInfo(orderData.status || "PENDING").label}</span></p>
          </div>

          <p>You will receive another email with your invoice and tracking information once your order is shipped.</p>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${env.BASE_URL}/orders/${orderData.orderCode}" 
               style="display: inline-block; padding: 12px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Order
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px;">
            <p>Questions? Contact us at support@ecommerce.com</p>
            <p>&copy; ${new Date().getFullYear()} E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate status update HTML template
   */
  private static generateStatusUpdateHTML(orderData: any): string {
    const statusInfo = this.getStatusInfo(orderData.status);

    let statusMessage = "";
    let statusDescription = "";

    switch (orderData.status) {
      case "PROCESSING":
        statusMessage = "Your order is now being processed!";
        statusDescription =
          "We've started preparing your order and it will be ready for shipment soon.";
        break;
      case "COMPLETED":
        statusMessage = "Your order has been completed!";
        statusDescription =
          "Your order has been successfully delivered. Thank you for shopping with us!";
        break;
      case "CANCELLED":
        statusMessage = "Your order has been cancelled.";
        statusDescription =
          "Your order has been cancelled. If you have any questions, please contact our support team.";
        break;
      default:
        statusMessage = `Your order status has been updated to ${statusInfo.label}.`;
        statusDescription =
          "We'll keep you informed about any further updates.";
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${statusInfo.color};">Order Status Update ${statusInfo.emoji}</h1>
          
          <p>Dear ${orderData.userName},</p>
          
          <p>${statusMessage}</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
            <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
            <p><strong>Order Code:</strong> ${orderData.orderCode}</p>
            <p><strong>Total Amount:</strong> ${this.formatIDR(Number(orderData.totalAmount))}</p>
            <p><strong>New Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold; font-size: 18px;">${statusInfo.emoji} ${statusInfo.label.toUpperCase()}</span></p>
          </div>

          <p>${statusDescription}</p>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${env.BASE_URL}/orders/${orderData.orderCode}" 
               style="display: inline-block; padding: 12px 30px; background: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Order Details
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px;">
            <p>Questions? Contact us at support@ecommerce.com</p>
            <p>&copy; ${new Date().getFullYear()} E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
