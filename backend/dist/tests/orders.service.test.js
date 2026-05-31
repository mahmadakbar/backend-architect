"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_service_1 = require("@api/v1/orders/orders.service");
const prisma_clients_1 = require("@prisma/prisma.clients");
// Mock Prisma
jest.mock("@prisma/prisma.clients");
describe("Orders Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const mockUser = {
        id: 1,
        username: "testuser",
        password: "encrypted_password",
        name: "Test User",
        role_id: 3,
        role: {
            id: 3,
            name: "user",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockAdmin = {
        id: 2,
        username: "adminuser",
        password: "encrypted_password",
        name: "Admin User",
        role_id: 2,
        role: {
            id: 2,
            name: "admin",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockSuperadmin = {
        id: 3,
        username: "superadmin",
        password: "encrypted_password",
        name: "Super Admin",
        role_id: 1,
        role: {
            id: 1,
            name: "superadmin",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockProduct = {
        id: 1,
        code: "PRD0001",
        name: "Test Product",
        description: "Test Description",
        price: { mul: jest.fn().mockReturnValue(90000) },
        stock: 50,
        status: 1, // Active
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };
    const mockOrder = {
        id: 1,
        code: "ORD0001",
        user_id: 1,
        totalAmount: 90000,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
        orderItems: [
            {
                id: 1,
                code: "ITM0001",
                order_id: 1,
                product_id: 1,
                quantity: 1,
                price: 90000,
                createdAt: new Date(),
                product: mockProduct,
            },
        ],
    };
    describe("SCreateOrder", () => {
        it("should successfully create an order for regular user", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(mockProduct);
            prisma_clients_1.prisma.$transaction.mockImplementation(async (callback) => {
                return await callback({
                    order: {
                        create: jest.fn().mockResolvedValue({ id: 1, code: "ORD0001" }),
                        findUnique: jest.fn().mockResolvedValue(mockOrder),
                    },
                    orderItem: {
                        create: jest.fn().mockResolvedValue({ id: 1, code: "ITM0001" }),
                    },
                    product: {
                        update: jest.fn().mockResolvedValue(mockProduct),
                    },
                });
            });
            // Act
            const result = await (0, orders_service_1.SCreateOrder)(1, {
                items: [{ product_id: 1, quantity: 1 }],
            });
            // Assert
            expect(prisma_clients_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { role: true },
            });
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
        it("should throw error if admin tries to create order", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockAdmin);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(2, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("Only regular users can place orders. Admins and superadmins cannot create orders.");
        });
        it("should throw error if superadmin tries to create order", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockSuperadmin);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(3, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("Only regular users can place orders. Admins and superadmins cannot create orders.");
        });
        it("should throw error if user not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(999, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("User with ID 999 not found");
        });
        it("should throw error if product not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 999, quantity: 1 }] })).rejects.toThrow("Product with ID 999 not found or not available");
        });
        it("should throw error if product is inactive (status 2)", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // findFirst with status: 1 returns null for inactive products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("Product with ID 1 not found or not available");
            // Verify the query checks for active status
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    deletedAt: null,
                    status: 1,
                },
            });
        });
        it("should throw error if product is deleted (status 0)", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // findFirst with status: 1 returns null for deleted products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("Product with ID 1 not found or not available");
        });
        it("should throw error if insufficient stock", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue({
                ...mockProduct,
                stock: 5,
            });
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 1, quantity: 10 }] })).rejects.toThrow("Insufficient stock");
        });
        it("should throw error if stock is zero", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue({
                ...mockProduct,
                stock: 0,
            });
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow('Insufficient stock for product "Test Product". Available: 0, Requested: 1');
        });
        it("should throw error if product is soft deleted", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 1, quantity: 1 }] })).rejects.toThrow("Product with ID 1 not found");
        });
        it("should not find deleted products (deletedAt not null)", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // findFirst with deletedAt: null and status: 1 will return null for deleted products
            prisma_clients_1.prisma.product.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCreateOrder)(1, { items: [{ product_id: 999, quantity: 1 }] })).rejects.toThrow("Product with ID 999 not found or not available");
            // Verify that findFirst was called with deletedAt: null and status: 1 filters
            expect(prisma_clients_1.prisma.product.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 999,
                    deletedAt: null,
                    status: 1,
                },
            });
        });
    });
    describe("SGetOrderById", () => {
        it("should successfully retrieve order for user", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findFirst.mockResolvedValue({
                ...mockOrder,
                user: {
                    id: 1,
                    username: "testuser",
                    name: "Test User",
                },
            });
            // Act
            const result = await (0, orders_service_1.SGetOrderById)(1, 1, "user");
            // Assert
            expect(result).toBeDefined();
            expect(prisma_clients_1.prisma.order.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1, user_id: 1 },
            }));
        });
        it("should allow admin to view any order", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findFirst.mockResolvedValue({
                ...mockOrder,
                user: {
                    id: 2,
                    username: "otheruser",
                    name: "Other User",
                },
            });
            // Act
            const result = await (0, orders_service_1.SGetOrderById)(1, 1, "admin");
            // Assert
            expect(result).toBeDefined();
            expect(prisma_clients_1.prisma.order.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1 },
            }));
        });
        it("should throw error if order not found", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findFirst.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SGetOrderById)(999, 1, "user")).rejects.toThrow("Order with ID 999 not found");
        });
    });
    describe("SGetOrderHistory", () => {
        it("should retrieve order history for user", async () => {
            // Arrange
            const mockOrders = [
                {
                    ...mockOrder,
                    user: {
                        id: 1,
                        username: "testuser",
                        name: "Test User",
                    },
                },
            ];
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue(mockOrders);
            // Act
            const result = await (0, orders_service_1.SGetOrderHistory)(1, "user", {
                page: 1,
                limit: 10,
            });
            // Assert
            expect(result.orders).toEqual(mockOrders);
            expect(result.metadata).toEqual({
                page: 1,
                limit: 10,
                totalData: 1,
                totalPages: 1,
            });
        });
        it("should allow admin to see all orders", async () => {
            // Arrange
            const mockOrders = [
                {
                    ...mockOrder,
                    user: {
                        id: 1,
                        username: "testuser",
                        name: "Test User",
                    },
                },
            ];
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue(mockOrders);
            // Act
            const result = await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                page: 1,
                limit: 10,
            });
            // Assert
            expect(result.orders).toEqual(mockOrders);
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {},
            }));
        });
        it("should filter by status", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "user", {
                page: 1,
                limit: 10,
                status: "PENDING",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: "PENDING",
                }),
            }));
        });
    });
    describe("SCancelOrder", () => {
        it("should allow admin to cancel order", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findUnique.mockResolvedValue(mockOrder);
            prisma_clients_1.prisma.$transaction.mockImplementation(async (callback) => {
                return await callback({
                    order: {
                        update: jest.fn().mockResolvedValue({
                            ...mockOrder,
                            status: "CANCELLED",
                            cancelledAt: new Date(),
                        }),
                    },
                    product: {
                        update: jest.fn().mockResolvedValue(mockProduct),
                    },
                });
            });
            // Act
            const result = await (0, orders_service_1.SCancelOrder)(1, 2, "admin");
            // Assert
            expect(result.status).toBe("CANCELLED");
        });
        it("should allow superadmin to cancel order", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findUnique.mockResolvedValue(mockOrder);
            prisma_clients_1.prisma.$transaction.mockImplementation(async (callback) => {
                return await callback({
                    order: {
                        update: jest.fn().mockResolvedValue({
                            ...mockOrder,
                            status: "CANCELLED",
                            cancelledAt: new Date(),
                        }),
                    },
                    product: {
                        update: jest.fn().mockResolvedValue(mockProduct),
                    },
                });
            });
            // Act
            const result = await (0, orders_service_1.SCancelOrder)(1, 3, "superadmin");
            // Assert
            expect(result.status).toBe("CANCELLED");
            expect(result.cancelledAt).toBeDefined();
        });
        it("should throw error if user tries to cancel order", async () => {
            // Act & Assert
            await expect((0, orders_service_1.SCancelOrder)(1, 1, "user")).rejects.toThrow("Only admin or superadmin can cancel orders");
        });
        it("should throw error if order not found", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, orders_service_1.SCancelOrder)(999, 1, "admin")).rejects.toThrow("Order with ID 999 not found");
        });
        it("should throw error if order already cancelled", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findUnique.mockResolvedValue({
                ...mockOrder,
                status: "CANCELLED",
            });
            // Act & Assert
            await expect((0, orders_service_1.SCancelOrder)(1, 1, "admin")).rejects.toThrow("Order is already cancelled");
        });
        it("should throw error if order is completed", async () => {
            // Arrange
            prisma_clients_1.prisma.order.findUnique.mockResolvedValue({
                ...mockOrder,
                status: "COMPLETED",
            });
            // Act & Assert
            await expect((0, orders_service_1.SCancelOrder)(1, 1, "admin")).rejects.toThrow("Cannot cancel a completed order");
        });
    });
    describe("Advanced Search, Filter, and Sort for Orders", () => {
        it("should search orders by code", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                search: "ORD0001",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ code: expect.any(Object) }),
                    ]),
                }),
            }));
        });
        it("should search orders by user name", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                search: "Test User",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.any(Array),
                }),
            }));
        });
        it("should filter orders by date range", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                startDate: "2024-01-01",
                endDate: "2024-12-31",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    createdAt: expect.any(Object),
                }),
            }));
        });
        it("should sort orders by totalAmount ascending", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                sortBy: "totalAmount",
                sortOrder: "asc",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { totalAmount: "asc" },
            }));
        });
        it("should sort orders by code descending", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                sortBy: "code",
                sortOrder: "desc",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { code: "desc" },
            }));
        });
        it("should sort orders by status", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                sortBy: "status",
                sortOrder: "asc",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: { status: "asc" },
            }));
        });
        it("should combine search, filter, and sort", async () => {
            // Arrange
            prisma_clients_1.prisma.order.count.mockResolvedValue(1);
            prisma_clients_1.prisma.order.findMany.mockResolvedValue([mockOrder]);
            // Act
            await (0, orders_service_1.SGetOrderHistory)(1, "admin", {
                search: "ORD",
                status: "PENDING",
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                sortBy: "totalAmount",
                sortOrder: "desc",
            });
            // Assert
            expect(prisma_clients_1.prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.any(Array),
                    status: "PENDING",
                    createdAt: expect.any(Object),
                }),
                orderBy: { totalAmount: "desc" },
            }));
        });
    });
});
//# sourceMappingURL=orders.service.test.js.map