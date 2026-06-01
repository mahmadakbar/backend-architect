import { prisma } from "@prisma/prisma.clients";
import { Prisma } from "@prisma/generated/prisma";
import {
  generateOrderCode,
  generateOrderItemCode,
} from "@utils/codeGenerator.util";
import logger from "@configs/logger.configs";
import { withSpan, addSpanEvent, setSpanAttribute } from "@utils/tracing.util";

export interface IOrderItem {
  product_id: number;
  quantity: number;
}

export interface ICreateOrder {
  items: IOrderItem[];
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string; // Search by code, user name
  startDate?: string; // Filter by creation date range
  endDate?: string;
  sortBy?: "date" | "status" | "totalAmount" | "code"; // Sort options
  sortOrder?: "asc" | "desc"; // Sort order
}

export const SCreateOrder = async (
  userId: number,
  orderData: ICreateOrder,
): Promise<any> => {
  try {
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Only regular users (role_id: 3) can place orders
    if (user.role_id !== 3) {
      throw new Error(
        "Only regular users can place orders. Admins and superadmins cannot create orders.",
      );
    }

    // Validate all products and calculate total
    let totalAmount = new Prisma.Decimal(0);
    const orderItemsData: {
      product_id: number;
      quantity: number;
      price: Prisma.Decimal;
    }[] = [];

    for (const item of orderData.items) {
      const product = await prisma.product.findFirst({
        where: {
          id: item.product_id,
          deletedAt: null,
          status: 1, // Only active products can be ordered
        },
      });

      if (!product) {
        throw new Error(
          `Product with ID ${item.product_id} not found or not available`,
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }

      const itemTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Generate unique order code
      const orderCode = await generateOrderCode();

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          code: orderCode,
          user_id: userId,
          totalAmount: totalAmount,
          status: "PENDING",
        },
      });

      // Create order items with unique codes
      for (const itemData of orderItemsData) {
        const itemCode = await generateOrderItemCode();
        await tx.orderItem.create({
          data: {
            code: itemCode,
            order_id: newOrder.id,
            product_id: itemData.product_id,
            quantity: itemData.quantity,
            price: itemData.price,
          },
        });
      }

      // Update product stock
      for (const item of orderData.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Fetch the complete order with items
      const completeOrder = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return completeOrder;
    });

    return order;
  } catch (error: any) {
    logger.error(error, "Order creation error");
    throw error;
  }
};

export const SGetOrderById = async (
  orderId: number,
  userId: number,
  userRole: string,
): Promise<any> => {
  try {
    const whereClause: any = {
      id: orderId,
    };

    // If user is not admin/superadmin, they can only see their own orders
    if (userRole !== "admin" && userRole !== "superadmin") {
      whereClause.user_id = userId;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    return order;
  } catch (error: any) {
    logger.error(error, "Order retrieval error");
    throw error;
  }
};

export const SGetOrderHistory = async (
  userId: number,
  userRole: string,
  params: IPaginationParams,
): Promise<{
  orders: any[];
  metadata: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}> => {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // If user is not admin/superadmin, they can only see their own orders
    if (userRole !== "admin" && userRole !== "superadmin") {
      whereClause.user_id = userId;
    }

    // Advanced search by code or user name
    if (params.search) {
      whereClause.OR = [
        { code: { contains: params.search, mode: "insensitive" } },
        {
          user: {
            name: { contains: params.search, mode: "insensitive" },
          },
        },
        {
          user: {
            username: { contains: params.search, mode: "insensitive" },
          },
        },
      ];
    }

    // Filter by status if provided
    if (params.status) {
      whereClause.status = params.status;
    }

    // Filter by date range
    if (params.startDate || params.endDate) {
      whereClause.createdAt = {};
      if (params.startDate) {
        whereClause.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        whereClause.createdAt.lte = new Date(params.endDate);
      }
    }

    // Build orderBy clause for sorting
    let orderBy: any = { createdAt: "desc" }; // Default sort

    if (params.sortBy) {
      const sortOrder = params.sortOrder || "asc";
      switch (params.sortBy) {
        case "date":
          orderBy = { createdAt: sortOrder };
          break;
        case "status":
          orderBy = { status: sortOrder };
          break;
        case "totalAmount":
          orderBy = { totalAmount: sortOrder };
          break;
        case "code":
          orderBy = { code: sortOrder };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }
    }

    // Get total count
    const totalData = await prisma.order.count({
      where: whereClause,
    });

    // Get orders with pagination and sorting
    const orders = await prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalData / limit);

    return {
      orders,
      metadata: {
        page,
        limit,
        totalData,
        totalPages,
      },
    };
  } catch (error: any) {
    logger.error(error, "Order history retrieval error");
    throw error;
  }
};

export const SCancelOrder = async (
  orderId: number,
  userId: number,
  userRole: string,
): Promise<any> => {
  try {
    // Only admin/superadmin can cancel orders
    if (userRole !== "admin" && userRole !== "superadmin") {
      throw new Error("Only admin or superadmin can cancel orders");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status === "CANCELLED") {
      throw new Error("Order is already cancelled");
    }

    if (order.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed order");
    }

    // Cancel order and restore stock in a transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Restore product stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    return cancelledOrder;
  } catch (error: any) {
    logger.error(error, "Order cancellation error");
    throw error;
  }
};
