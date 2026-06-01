import { securityHeaderParameters } from "./common.swagger";

export const taskSchemas = {
  CreateTaskRequest: {
    type: "object",
    required: ["title", "description"],
    properties: {
      title: {
        type: "string",
        example: "Complete project documentation",
        minLength: 3,
        maxLength: 100,
        description: "Task title (3-100 characters, required)",
      },
      description: {
        type: "string",
        example: "Write comprehensive documentation for the API",
        minLength: 3,
        maxLength: 255,
        description: "Task description (3-255 characters, required)",
      },
      status: {
        type: "boolean",
        example: false,
        nullable: true,
        description: "Task status (boolean, optional)",
      },
      deadline: {
        type: "string",
        format: "date-time",
        example: "2026-12-31T23:59:59Z",
        nullable: true,
        description: "Task deadline (ISO date string, optional)",
      },
    },
  },
  UpdateTaskRequest: {
    type: "object",
    properties: {
      title: {
        type: "string",
        example: "Updated task title",
        nullable: true,
        description: "Task title (optional)",
      },
      description: {
        type: "string",
        example: "Updated task description",
        nullable: true,
        description: "Task description (optional)",
      },
      status: {
        type: "boolean",
        example: true,
        nullable: true,
        description: "Task status (optional)",
      },
      deadline: {
        type: "string",
        format: "date-time",
        example: "2026-12-31T23:59:59Z",
        nullable: true,
        description: "Task deadline (optional)",
      },
    },
  },
  Task: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      title: {
        type: "string",
        example: "Complete project documentation",
      },
      description: {
        type: "string",
        example: "Write comprehensive documentation for the API",
      },
      status: {
        type: "boolean",
        example: false,
      },
      deadline: {
        type: "string",
        format: "date-time",
        example: "2026-12-31T23:59:59Z",
        nullable: true,
      },
      userId: {
        type: "integer",
        example: 1,
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
      },
    },
  },
};

export const taskPaths = {
  "/api/v1/tasks": {
    post: {
      tags: ["Tasks"],
      summary: "Create a new task",
      description:
        "Create a new task for the authenticated user. **Requires security headers**",
      security: [{ bearerAuth: [] }],
      parameters: securityHeaderParameters,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateTaskRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Task created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Task created successfully",
                  },
                  data: { $ref: "#/components/schemas/Task" },
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
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    get: {
      tags: ["Tasks"],
      summary: "Get all tasks",
      description:
        "Retrieve all tasks for the authenticated user. **Requires security headers**",
      security: [{ bearerAuth: [] }],
      parameters: securityHeaderParameters,
      responses: {
        "200": {
          description: "Tasks retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Tasks retrieved successfully",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Task" },
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
  "/api/v1/tasks/update/{taskId}": {
    post: {
      tags: ["Tasks"],
      summary: "Update an existing task",
      description:
        "Update task details by task ID. **Requires security headers**",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Task ID",
          example: 1,
        },
        ...securityHeaderParameters,
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateTaskRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Task updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Task updated successfully",
                  },
                  data: { $ref: "#/components/schemas/Task" },
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
        "404": {
          description: "Task not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/tasks/{taskId}": {
    delete: {
      tags: ["Tasks"],
      summary: "Delete a task",
      description: "Delete a task by task ID. **Requires security headers**",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Task ID to delete",
          example: 1,
        },
        ...securityHeaderParameters,
      ],
      responses: {
        "200": {
          description: "Task deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Task deleted successfully",
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
        "404": {
          description: "Task not found",
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
