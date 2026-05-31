import swaggerAutogen from "swagger-autogen";
import env from "./env.configs";

const doc = {
  info: {
    version: "1.0.0",
    title: "Task Management & E-Commerce API",
    description:
      "Comprehensive API documentation for Task Management and E-Commerce System with advanced search, filter, and sort capabilities",
  },
  servers: [
    {
      url: env.BASE_URL,
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Tasks",
      description: "Task management endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints (superadmin only)",
    },
    {
      name: "Products",
      description:
        "Product management endpoints with advanced search and filtering",
    },
    {
      name: "Orders",
      description: "Order management endpoints with search and filtering",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["username", "password", "name"],
        properties: {
          username: {
            type: "string",
            example: "johndoe",
          },
          password: {
            type: "string",
            example: "password123",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            example: "johndoe",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "price", "stock"],
        properties: {
          name: {
            type: "string",
            example: "Wireless Headphones",
          },
          description: {
            type: "string",
            example: "High-quality wireless headphones with noise cancellation",
          },
          price: {
            type: "number",
            example: 1299000,
          },
          stock: {
            type: "integer",
            example: 50,
          },
          image: {
            type: "string",
            example: "https://example.com/image.jpg",
          },
          category: {
            type: "string",
            example: "Electronics",
          },
          status: {
            type: "integer",
            example: 1,
            enum: [0, 1, 2],
            description: "0: deleted, 1: active, 2: inactive",
          },
        },
      },
      UpdateProductRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Updated Product Name",
          },
          description: {
            type: "string",
            example: "Updated product description",
          },
          price: {
            type: "number",
            example: 1199000,
          },
          stock: {
            type: "integer",
            example: 30,
          },
          image: {
            type: "string",
            example: "https://example.com/new-image.jpg",
          },
          category: {
            type: "string",
            example: "Electronics",
          },
          status: {
            type: "integer",
            example: 1,
            enum: [0, 1, 2],
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          code: {
            type: "string",
            example: "PRD0001",
          },
          name: {
            type: "string",
            example: "Wireless Headphones",
          },
          description: {
            type: "string",
            example: "High-quality wireless headphones",
          },
          price: {
            type: "number",
            example: 1299000,
          },
          stock: {
            type: "integer",
            example: 50,
          },
          image: {
            type: "string",
            example: "https://example.com/image.jpg",
          },
          category: {
            type: "string",
            example: "Electronics",
          },
          status: {
            type: "integer",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          deletedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_id: {
                  type: "integer",
                  example: 1,
                },
                quantity: {
                  type: "integer",
                  example: 2,
                },
              },
            },
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
          },
          user_id: {
            type: "integer",
            example: 1,
          },
          totalAmount: {
            type: "number",
            example: 2598000,
          },
          status: {
            type: "string",
            enum: ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"],
            example: "PENDING",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          cancelledAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          orderItems: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                },
                code: {
                  type: "string",
                  example: "ITM0001",
                },
                product_id: {
                  type: "integer",
                },
                quantity: {
                  type: "integer",
                },
                price: {
                  type: "number",
                },
              },
            },
          },
        },
      },
      PaginationMetadata: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
          },
          limit: {
            type: "integer",
            example: 10,
          },
          totalData: {
            type: "integer",
            example: 50,
          },
          totalPages: {
            type: "integer",
            example: 5,
          },
        },
      },
    },
  },
};

const outputFile = "./src/configs/swagger.output.json";
const endpointsFiles = ["./src/api/v1/v1.routes.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
  () => {
    console.log("✅ Swagger documentation generated successfully!");
  },
);
