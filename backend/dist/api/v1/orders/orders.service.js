"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCancelOrder = exports.SGetOrderHistory = exports.SGetOrderById = exports.SCreateOrder = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
const prisma_1 = require("@prisma/generated/prisma");
const codeGenerator_util_1 = require("@utils/codeGenerator.util");
const SCreateOrder = async (userId, orderData) => {
    try {
        // Validate user exists
        const user = await prisma_clients_1.prisma.user.findUnique({
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
            throw new Error("Only regular users can place orders. Admins and superadmins cannot create orders.");
        }
        // Validate all products and calculate total
        let totalAmount = new prisma_1.Prisma.Decimal(0);
        const orderItemsData = [];
        for (const item of orderData.items) {
            const product = await prisma_clients_1.prisma.product.findFirst({
                where: {
                    id: item.product_id,
                    deletedAt: null,
                    status: 1, // Only active products can be ordered
                },
            });
            if (!product) {
                throw new Error(`Product with ID ${item.product_id} not found or not available`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
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
        const order = await prisma_clients_1.prisma.$transaction(async (tx) => {
            // Generate unique order code
            const orderCode = await (0, codeGenerator_util_1.generateOrderCode)();
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
                const itemCode = await (0, codeGenerator_util_1.generateOrderItemCode)();
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
    }
    catch (error) {
        console.error("Order creation error:", error);
        throw error;
    }
};
exports.SCreateOrder = SCreateOrder;
const SGetOrderById = async (orderId, userId, userRole) => {
    try {
        const whereClause = {
            id: orderId,
        };
        // If user is not admin/superadmin, they can only see their own orders
        if (userRole !== "admin" && userRole !== "superadmin") {
            whereClause.user_id = userId;
        }
        const order = await prisma_clients_1.prisma.order.findFirst({
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
    }
    catch (error) {
        console.error("Order retrieval error:", error);
        throw error;
    }
};
exports.SGetOrderById = SGetOrderById;
const SGetOrderHistory = async (userId, userRole, params) => {
    try {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const whereClause = {};
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
        let orderBy = { createdAt: "desc" }; // Default sort
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
        const totalData = await prisma_clients_1.prisma.order.count({
            where: whereClause,
        });
        // Get orders with pagination and sorting
        const orders = await prisma_clients_1.prisma.order.findMany({
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
    }
    catch (error) {
        console.error("Order history retrieval error:", error);
        throw error;
    }
};
exports.SGetOrderHistory = SGetOrderHistory;
const SCancelOrder = async (orderId, userId, userRole) => {
    try {
        // Only admin/superadmin can cancel orders
        if (userRole !== "admin" && userRole !== "superadmin") {
            throw new Error("Only admin or superadmin can cancel orders");
        }
        const order = await prisma_clients_1.prisma.order.findUnique({
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
        const cancelledOrder = await prisma_clients_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        console.error("Order cancellation error:", error);
        throw error;
    }
};
exports.SCancelOrder = SCancelOrder;
//# sourceMappingURL=orders.service.js.map