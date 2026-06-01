export const orderSchemas = {
  CreateOrderRequest: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["product_id", "quantity"],
          properties: {
            product_id: {
              type: "integer",
              example: 1,
              description: "Product ID",
            },
            quantity: {
              type: "integer",
              example: 2,
              minimum: 1,
              description: "Quantity to order",
            },
          },
        },
        description: "Array of order items (required)",
      },
    },
  },
  Order: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      code: {
        type: "string",
        example: "ORD0001",
        description: "Unique order code",
      },
      user_id: {
        type: "integer",
        example: 1,
      },
      totalAmount: {
        type: "number",
        format: "decimal",
        example: 2598000,
        description: "Total amount in Indonesian Rupiah (IDR)",
      },
      status: {
        type: "string",
        enum: ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"],
        example: "PENDING",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-05-31T10:00:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-05-31T10:00:00Z",
        nullable: true,
      },
      cancelledAt: {
        type: "string",
        format: "date-time",
        example: null,
        nullable: true,
      },
      orderItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            code: {
              type: "string",
              example: "ITM0001",
              description: "Unique order item code",
            },
            product_id: {
              type: "integer",
              example: 1,
            },
            quantity: {
              type: "integer",
              example: 2,
            },
            price: {
              type: "number",
              format: "decimal",
              example: 1299000,
              description: "Price in IDR at time of order",
            },
            product: {
              $ref: "#/components/schemas/Product",
            },
          },
        },
      },
      user: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          username: {
            type: "string",
            example: "superadmin",
          },
          name: {
            type: "string",
            example: "Super Administrator",
          },
        },
      },
    },
  },
};

export const orderPaths = {
  "/api/v1/orders": {
    post: {
      tags: ["Orders"],
      summary: "Create a new order",
      description: "Create a new order (User only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateOrderRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Order created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Order created successfully",
                  },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        "400": {
          description: "Bad request - Invalid product or insufficient stock",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/orders/history": {
    get: {
      tags: ["Orders"],
      summary: "Get order history with advanced search and filtering",
      description:
        "Get order history for current user with search, filter, and sort. Admin/Superadmin can see all orders",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Items per page",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"],
          },
          description: "Filter by order status",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by order code, user name, or username",
        },
        {
          name: "startDate",
          in: "query",
          schema: { type: "string", format: "date-time" },
          description: "Filter by creation date (start)",
        },
        {
          name: "endDate",
          in: "query",
          schema: { type: "string", format: "date-time" },
          description: "Filter by creation date (end)",
        },
        {
          name: "sortBy",
          in: "query",
          schema: {
            type: "string",
            enum: ["date", "status", "totalAmount", "code"],
          },
          description: "Sort by field",
        },
        {
          name: "sortOrder",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          description: "Sort order",
        },
      ],
      responses: {
        "200": {
          description: "Order history retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Order history retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Order" },
                  },
                  metadata: { $ref: "#/components/schemas/PaginationMetadata" },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/orders/{orderId}": {
    get: {
      tags: ["Orders"],
      summary: "Get order details",
      description: "Get detailed information about a specific order",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Order ID",
        },
      ],
      responses: {
        "200": {
          description: "Order retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Order retrieved successfully",
                  },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "403": {
          description: "Forbidden - Cannot access other user's orders",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "404": {
          description: "Order not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/orders/{orderId}/cancel": {
    post: {
      tags: ["Orders"],
      summary: "Cancel an order",
      description: "Cancel an order (Admin/Superadmin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Order ID",
        },
      ],
      responses: {
        "200": {
          description: "Order cancelled successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Order cancelled successfully",
                  },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        "400": {
          description: "Bad request - Order cannot be cancelled",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "403": {
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "404": {
          description: "Order not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
