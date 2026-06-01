import env from "../env.configs";

export const swaggerBase = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Task Management & E-Commerce API",
    description:
      "Comprehensive API documentation for Task Management and E-Commerce System with advanced search, filter, and sort capabilities.\n\n" +
      "## Security Requirements\n\n" +
      "**IMPORTANT**: All API v1 endpoints require the following security headers for every request:\n\n" +
      "1. **apikey**: Your API key for authentication\n" +
      "2. **x-content-type-options**: `nosniff` - Prevents MIME type sniffing\n" +
      "3. **x-xss-protection**: `1; mode=block` - Enables XSS protection\n" +
      "4. **strict-transport-security**: `max-age=31536000; includeSubDomains; preload` - Enforces HTTPS\n" +
      "5. **x-frame-options**: `SAMEORIGIN` - Prevents clickjacking attacks\n\n" +
      "**Example curl command:**\n```bash\n" +
      "curl -X 'POST' \\\\\n" +
      "  'http://localhost:3131/api/v1/auth/login' \\\\\n" +
      "  -H 'apikey: sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA' \\\\\n" +
      "  -H 'x-content-type-options: nosniff' \\\\\n" +
      "  -H 'x-xss-protection: 1; mode=block' \\\\\n" +
      "  -H 'strict-transport-security: max-age=31536000; includeSubDomains; preload' \\\\\n" +
      "  -H 'x-frame-options: SAMEORIGIN' \\\\\n" +
      "  -H 'Content-Type: application/json' \\\\\n" +
      '  -d \'{"username": "superadmin", "password": "SuperAdmin@123"}\'\n' +
      "```",
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
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "apikey",
        description:
          "API Key for request authentication (use: sk_live_9K8mN3pQ7rT2vX5wY1zC4bF6hJ8nL0sA)",
      },
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
