import {
  SCreateOrder,
  SGetOrderById,
  SGetOrderHistory,
  SCancelOrder,
  SUpdateOrderStatus,
} from "@api/v1/orders/orders.service";
import { prisma } from "@prisma/prisma.clients";

// Mock Prisma
jest.mock("@prisma/prisma.clients");

// Mock QueueManager
jest.mock("@jobs/queue.manager", () => ({
  QueueManager: {
    addOrderProcessingJob: jest.fn(() => Promise.resolve()),
    addEmailJob: jest.fn(() => Promise.resolve()),
  },
}));

// Mock IdempotencyService
jest.mock("@services/idempotency.service", () => ({
  IdempotencyService: {
    generateOrderKey: jest.fn(
      (orderId, action) => `order_${orderId}_${action}`,
    ),
    generateEmailKey: jest.fn(
      (userId, type, resourceId) => `email_${userId}_${type}_${resourceId}`,
    ),
  },
}));

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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
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
        },
      );

      // Act
      const result = await SCreateOrder(1, {
        items: [{ product_id: 1, quantity: 1 }],
      });

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { role: true },
      });
      expect(prisma.product.findFirst).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw error if admin tries to create order", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      // Act & Assert
      await expect(
        SCreateOrder(2, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow(
        "Only regular users can place orders. Admins and superadmins cannot create orders.",
      );
    });

    it("should throw error if superadmin tries to create order", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockSuperadmin);

      // Act & Assert
      await expect(
        SCreateOrder(3, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow(
        "Only regular users can place orders. Admins and superadmins cannot create orders.",
      );
    });

    it("should throw error if user not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(999, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow("User with ID 999 not found");
    });

    it("should throw error if product not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 999, quantity: 1 }] }),
      ).rejects.toThrow("Product with ID 999 not found or not available");
    });

    it("should throw error if product is inactive (status 2)", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      // findFirst with status: 1 returns null for inactive products
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow("Product with ID 1 not found or not available");

      // Verify the query checks for active status
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
          status: 1,
        },
      });
    });

    it("should throw error if product is deleted (status 0)", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      // findFirst with status: 1 returns null for deleted products
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow("Product with ID 1 not found or not available");
    });

    it("should throw error if insufficient stock", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 5,
      });

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 1, quantity: 10 }] }),
      ).rejects.toThrow("Insufficient stock");
    });

    it("should throw error if stock is zero", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 0,
      });

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow(
        'Insufficient stock for product "Test Product". Available: 0, Requested: 1',
      );
    });

    it("should throw error if product is soft deleted", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow("Product with ID 1 not found");
    });

    it("should not find deleted products (deletedAt not null)", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      // findFirst with deletedAt: null and status: 1 will return null for deleted products
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateOrder(1, { items: [{ product_id: 999, quantity: 1 }] }),
      ).rejects.toThrow("Product with ID 999 not found or not available");

      // Verify that findFirst was called with deletedAt: null and status: 1 filters
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
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
      (prisma.order.findFirst as jest.Mock).mockResolvedValue({
        ...mockOrder,
        user: {
          id: 1,
          username: "testuser",
          name: "Test User",
        },
      });

      // Act
      const result = await SGetOrderById(1, 1, "user");

      // Assert
      expect(result).toBeDefined();
      expect(prisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, user_id: 1 },
        }),
      );
    });

    it("should allow admin to view any order", async () => {
      // Arrange
      (prisma.order.findFirst as jest.Mock).mockResolvedValue({
        ...mockOrder,
        user: {
          id: 2,
          username: "otheruser",
          name: "Other User",
        },
      });

      // Act
      const result = await SGetOrderById(1, 1, "admin");

      // Assert
      expect(result).toBeDefined();
      expect(prisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        }),
      );
    });

    it("should throw error if order not found", async () => {
      // Arrange
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SGetOrderById(999, 1, "user")).rejects.toThrow(
        "Order with ID 999 not found",
      );
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
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      // Act
      const result = await SGetOrderHistory(1, "user", {
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
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      // Act
      const result = await SGetOrderHistory(1, "admin", {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.orders).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it("should filter by status", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "user", {
        page: 1,
        limit: 10,
        status: "PENDING",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PENDING",
          }),
        }),
      );
    });
  });

  describe("SCancelOrder", () => {
    it("should allow admin to cancel order", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
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
        },
      );

      // Act
      const result = await SCancelOrder(1, 2, "admin");

      // Assert
      expect(result.status).toBe("CANCELLED");
    });

    it("should allow superadmin to cancel order", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
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
        },
      );

      // Act
      const result = await SCancelOrder(1, 3, "superadmin");

      // Assert
      expect(result.status).toBe("CANCELLED");
      expect(result.cancelledAt).toBeDefined();
    });

    it("should throw error if user tries to cancel order", async () => {
      // Act & Assert
      await expect(SCancelOrder(1, 1, "user")).rejects.toThrow(
        "Only admin or superadmin can cancel orders",
      );
    });

    it("should throw error if order not found", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SCancelOrder(999, 1, "admin")).rejects.toThrow(
        "Order with ID 999 not found",
      );
    });

    it("should throw error if order already cancelled", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CANCELLED",
      });

      // Act & Assert
      await expect(SCancelOrder(1, 1, "admin")).rejects.toThrow(
        "Order is already cancelled",
      );
    });

    it("should throw error if order is completed", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
      });

      // Act & Assert
      await expect(SCancelOrder(1, 1, "admin")).rejects.toThrow(
        "Cannot cancel a completed order",
      );
    });
  });

  describe("Advanced Search, Filter, and Sort for Orders", () => {
    it("should search orders by code", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        search: "ORD0001",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ code: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });

    it("should search orders by user name", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        search: "Test User",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it("should filter orders by date range", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );
    });

    it("should sort orders by totalAmount ascending", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        sortBy: "totalAmount",
        sortOrder: "asc",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { totalAmount: "asc" },
        }),
      );
    });

    it("should sort orders by code descending", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        sortBy: "code",
        sortOrder: "desc",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: "desc" },
        }),
      );
    });

    it("should sort orders by status", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      const result = await SGetOrderHistory(1, "admin", {
        sortBy: "status",
        sortOrder: "asc",
      });

      // Assert
      expect(result.orders).toEqual([mockOrder]);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { status: "asc" },
        }),
      );
    });

    it("should use default sort when sortBy is invalid", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      const result = await SGetOrderHistory(1, "admin", {
        sortBy: "invalidField" as any,
        sortOrder: "asc",
      });

      // Assert
      expect(result.orders).toEqual([mockOrder]);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should handle database errors in order history retrieval", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockRejectedValue(
        new Error("Database connection error"),
      );

      // Act & Assert
      await expect(
        SGetOrderHistory(1, "admin", { page: 1, limit: 10 }),
      ).rejects.toThrow("Database connection error");
    });

    it("should combine search, filter, and sort", async () => {
      // Arrange
      (prisma.order.count as jest.Mock).mockResolvedValue(1);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);

      // Act
      await SGetOrderHistory(1, "admin", {
        search: "ORD",
        status: "PENDING",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        sortBy: "totalAmount",
        sortOrder: "desc",
      });

      // Assert
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            status: "PENDING",
            createdAt: expect.any(Object),
          }),
          orderBy: { totalAmount: "desc" },
        }),
      );
    });
  });
  describe("SUpdateOrderStatus", () => {
    it("should allow admin to update order status", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
        user: {
          id: 1,
          username: "testuser",
          name: "Test User",
        },
      });

      // Act
      const result = await SUpdateOrderStatus(1, "PROCESSING", 2, "admin");

      // Assert
      expect(result.status).toBe("PROCESSING");
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: {
            status: "PROCESSING",
          },
        }),
      );
    });

    it("should allow superadmin to update order status", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
        user: {
          id: 1,
          username: "testuser",
          name: "Test User",
        },
      });

      // Act
      const result = await SUpdateOrderStatus(1, "COMPLETED", 3, "superadmin");

      // Assert
      expect(result.status).toBe("COMPLETED");
      expect(prisma.order.update).toHaveBeenCalled();
    });

    it("should throw error if regular user tries to update order status", async () => {
      // Act & Assert
      await expect(
        SUpdateOrderStatus(1, "PROCESSING", 1, "user"),
      ).rejects.toThrow("Only admin or superadmin can update order status");
    });

    it("should throw error if order not found", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SUpdateOrderStatus(999, "PROCESSING", 2, "admin"),
      ).rejects.toThrow("Order with ID 999 not found");
    });

    it("should throw error if status is invalid", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(
        SUpdateOrderStatus(1, "INVALID_STATUS", 2, "admin"),
      ).rejects.toThrow("Invalid status: INVALID_STATUS");
    });

    it("should throw error if order is already completed", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
      });

      // Act & Assert
      await expect(
        SUpdateOrderStatus(1, "CANCELLED", 2, "admin"),
      ).rejects.toThrow("Cannot update status of completed order");
    });

    it("should throw error if order is already cancelled", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CANCELLED",
      });

      // Act & Assert
      await expect(
        SUpdateOrderStatus(1, "PROCESSING", 2, "admin"),
      ).rejects.toThrow("Cannot update status of cancelled order");
    });

    it("should allow updating from PENDING to PROCESSING", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
        user: {
          id: 1,
          username: "testuser",
          name: "Test User",
        },
      });

      // Act
      const result = await SUpdateOrderStatus(1, "PROCESSING", 2, "admin");

      // Assert
      expect(result.status).toBe("PROCESSING");
    });

    it("should allow updating from PROCESSING to COMPLETED", async () => {
      // Arrange
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "PROCESSING",
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "COMPLETED",
        user: {
          id: 1,
          username: "testuser",
          name: "Test User",
        },
      });

      // Act
      const result = await SUpdateOrderStatus(1, "COMPLETED", 2, "admin");

      // Assert
      expect(result.status).toBe("COMPLETED");
    });
  });
});
