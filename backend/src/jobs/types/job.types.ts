/**
 * Job data interfaces for different job types
 */

export interface EmailJobData {
  to: string;
  subject: string;
  template: "invoice" | "welcome" | "order-confirmation" | "status-update";
  data: {
    orderId?: number;
    orderCode?: string;
    userName?: string;
    totalAmount?: number;
    status?: string;
    items?: any[];
    [key: string]: any;
  };
  userId?: number;
  idempotencyKey?: string; // Unique key to prevent duplicate sends
}

export interface ActivityLogJobData {
  userId: number;
  action: string;
  resource: string;
  resourceId: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  idempotencyKey?: string;
}

export interface NotificationJobData {
  userId: number;
  type: "order" | "payment" | "shipping" | "general";
  title: string;
  message: string;
  data?: any;
  channels?: ("email" | "push" | "sms")[];
  idempotencyKey?: string;
}

export interface OrderProcessingJobData {
  orderId: number;
  orderCode: string;
  userId: number;
  totalAmount: number;
  userEmail: string;
  userName: string;
  items: any[];
  status?: string;
  idempotencyKey: string; // Required for order processing
}

/**
 * Job result types
 */
export interface JobResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
}
