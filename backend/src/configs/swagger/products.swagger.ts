export const productSchemas = {
  CreateProductRequest: {
    type: "object",
    required: ["name", "price", "stock"],
    properties: {
      name: {
        type: "string",
        example: "Wireless Headphones",
        minLength: 3,
        maxLength: 255,
        description: "Product name (3-255 characters, required)",
      },
      description: {
        type: "string",
        example: "High-quality wireless headphones with noise cancellation",
        nullable: true,
        description: "Product description (optional)",
      },
      price: {
        type: "number",
        format: "decimal",
        example: 1299000,
        description: "Product price in IDR (required)",
      },
      stock: {
        type: "integer",
        example: 50,
        minimum: 0,
        description: "Product stock quantity (required)",
      },
      image: {
        type: "string",
        format: "uri",
        example: "https://example.com/image.jpg",
        nullable: true,
        description: "Product image URL (optional)",
      },
      category: {
        type: "string",
        example: "Electronics",
        maxLength: 100,
        nullable: true,
        description: "Product category (optional)",
      },
      status: {
        type: "integer",
        example: 1,
        enum: [0, 1, 2],
        description:
          "Product status (0: deleted, 1: active, 2: inactive, optional, default: 1)",
      },
    },
  },
  UpdateProductRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "Updated Product Name",
        nullable: true,
        description: "Product name (optional)",
      },
      description: {
        type: "string",
        example: "Updated product description",
        nullable: true,
        description: "Product description (optional)",
      },
      price: {
        type: "number",
        format: "decimal",
        example: 1199000,
        nullable: true,
        description: "Product price in IDR (optional)",
      },
      stock: {
        type: "integer",
        example: 30,
        nullable: true,
        description: "Product stock quantity (optional)",
      },
      image: {
        type: "string",
        format: "uri",
        example: "https://example.com/new-image.jpg",
        nullable: true,
        description: "Product image URL (optional)",
      },
      category: {
        type: "string",
        example: "Electronics",
        nullable: true,
        description: "Product category (optional)",
      },
      status: {
        type: "integer",
        example: 1,
        enum: [0, 1, 2],
        nullable: true,
        description:
          "Product status (0: deleted, 1: active, 2: inactive, optional)",
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
        description: "Unique product code",
      },
      name: {
        type: "string",
        example: "Wireless Headphones",
      },
      description: {
        type: "string",
        example: "High-quality wireless headphones with noise cancellation",
        nullable: true,
      },
      price: {
        type: "number",
        format: "decimal",
        example: 1299000,
        description: "Price in Indonesian Rupiah (IDR)",
      },
      stock: {
        type: "integer",
        example: 50,
      },
      image: {
        type: "string",
        example: "https://example.com/image.jpg",
        nullable: true,
      },
      category: {
        type: "string",
        example: "Electronics",
        nullable: true,
      },
      status: {
        type: "integer",
        example: 1,
        enum: [0, 1, 2],
        description: "Product status (0: deleted, 1: active, 2: inactive)",
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
      deletedAt: {
        type: "string",
        format: "date-time",
        example: null,
        nullable: true,
      },
    },
  },
};

export const productPaths = {
  "/api/v1/products": {
    get: {
      tags: ["Products"],
      summary: "Get all products with pagination and advanced filtering",
      description:
        "Retrieve all products with search, filter, and sort options",
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
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by product code, name, description, or category",
        },
        {
          name: "category",
          in: "query",
          schema: { type: "string" },
          description: "Filter by category (exact match)",
        },
        {
          name: "status",
          in: "query",
          schema: { type: "integer", enum: [0, 1, 2] },
          description: "Filter by status (0: deleted, 1: active, 2: inactive)",
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
            enum: ["date", "status", "category", "name", "price", "code"],
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
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Products retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Product" },
                  },
                  metadata: { $ref: "#/components/schemas/PaginationMetadata" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Products"],
      summary: "Create a new product",
      description: "Create a new product (Admin/Superadmin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateProductRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product created successfully",
                  },
                  data: { $ref: "#/components/schemas/Product" },
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
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/products/{productId}": {
    get: {
      tags: ["Products"],
      summary: "Get product by ID",
      description: "Retrieve a single product by its ID",
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Product ID",
        },
      ],
      responses: {
        "200": {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product retrieved successfully",
                  },
                  data: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
        "404": {
          description: "Product not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    put: {
      tags: ["Products"],
      summary: "Update a product",
      description: "Update product details (Admin/Superadmin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Product ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateProductRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Product" },
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
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "404": {
          description: "Product not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Delete a product",
      description: "Soft delete a product (Admin/Superadmin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Product ID",
        },
      ],
      responses: {
        "200": {
          description: "Product deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product deleted successfully",
                  },
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
          description: "Forbidden - Admin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "404": {
          description: "Product not found",
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
