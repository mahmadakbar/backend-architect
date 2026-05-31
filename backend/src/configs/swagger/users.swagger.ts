export const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      username: {
        type: "string",
        example: "johndoe",
      },
      name: {
        type: "string",
        example: "John Doe",
      },
      role_id: {
        type: "integer",
        example: 3,
        description: "Role ID (1: superadmin, 2: admin, 3: user)",
      },
      role: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 3,
          },
          name: {
            type: "string",
            example: "user",
          },
        },
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
    },
  },
  Role: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      name: {
        type: "string",
        example: "superadmin",
        enum: ["superadmin", "admin", "user"],
      },
    },
  },
  ChangeUserRoleRequest: {
    type: "object",
    required: ["roleId"],
    properties: {
      roleId: {
        type: "integer",
        example: 1,
        description: "New role ID (1: superadmin, 2: admin, 3: user)",
      },
    },
  },
};

export const userPaths = {
  "/api/v1/users/roles": {
    get: {
      tags: ["Users"],
      summary: "Get all available roles",
      description: "Retrieve all available roles in the system",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Roles retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Roles retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Role" },
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
      },
    },
  },
  "/api/v1/users": {
    get: {
      tags: ["Users"],
      summary: "Get all users",
      description: "Retrieve all users with their roles (superadmin only)",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Users retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Users retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
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
          description: "Forbidden - Superadmin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/{userId}/role": {
    put: {
      tags: ["Users"],
      summary: "Change user role",
      description: "Update a user's role (superadmin only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "User ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ChangeUserRoleRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Role changed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "User role updated successfully",
                  },
                  data: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        "400": {
          description: "Bad Request - Invalid role ID or user ID",
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
          description: "Forbidden - Superadmin access required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "404": {
          description: "User or role not found",
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
