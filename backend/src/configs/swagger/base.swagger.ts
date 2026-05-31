import env from "../env.configs";

export const swaggerBase = {
  openapi: "3.0.0",
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
      PaginationMetadata: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
            description: "Current page number",
          },
          limit: {
            type: "integer",
            example: 10,
            description: "Items per page",
          },
          totalData: {
            type: "integer",
            example: 50,
            description: "Total number of items",
          },
          totalPages: {
            type: "integer",
            example: 5,
            description: "Total number of pages",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
          data: {
            type: "object",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Error message",
          },
          error: {
            type: "string",
            example: "Detailed error information",
          },
        },
      },
    },
  },
};
