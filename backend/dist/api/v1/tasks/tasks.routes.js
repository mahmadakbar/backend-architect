"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _middlewares_1 = require("@middlewares");
const express_1 = require("express");
const tasks_validation_1 = require("./tasks.validation");
const tasks_controller_1 = require("./tasks.controller");
const validator_util_1 = __importDefault(require("@utils/validator.util"));
const router = (0, express_1.Router)();
router.use(_middlewares_1.MAuthToken);
router.post("/", validator_util_1.default.body(tasks_validation_1.VCreateTask), tasks_controller_1.CCreateTask);
// #swagger.tags = ['Tasks']
// #swagger.summary = 'Create a new task'
// #swagger.description = 'Create a new task for the authenticated user'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/CreateTaskRequest" }
    }
  }
} */
/* #swagger.responses[201] = {
  description: 'Task created successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Task created successfully' },
          data: { $ref: '#/definitions/Task' }
        }
      }
    }
  }
} */
router.post("/update/:taskId", validator_util_1.default.body(tasks_validation_1.VUpdateTask), tasks_controller_1.CUpdateTask);
// #swagger.tags = ['Tasks']
// #swagger.summary = 'Update an existing task'
// #swagger.description = 'Update task details by task ID'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['taskId'] = {
  in: 'path',
  description: 'Task ID',
  required: true,
  type: 'integer',
  example: 1
} */
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/UpdateTaskRequest" }
    }
  }
} */
/* #swagger.responses[200] = {
  description: 'Task updated successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Task updated successfully' },
          data: { $ref: '#/definitions/Task' }
        }
      }
    }
  }
} */
router.delete("/:taskId", tasks_controller_1.CDeleteTask);
// #swagger.tags = ['Tasks']
// #swagger.summary = 'Delete a task'
// #swagger.description = 'Delete a task by task ID'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['taskId'] = {
  in: 'path',
  description: 'Task ID to delete',
  required: true,
  type: 'integer',
  example: 1
} */
/* #swagger.responses[200] = {
  description: 'Task deleted successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Task deleted successfully' },
          data: { type: 'object' }
        }
      }
    }
  }
} */
router.get("/", tasks_controller_1.CGetAllTasks);
// #swagger.tags = ['Tasks']
// #swagger.summary = 'Get all tasks'
// #swagger.description = 'Retrieve all tasks for the authenticated user'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.responses[200] = {
  description: 'Tasks retrieved successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Tasks retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/definitions/Task' }
          }
        }
      }
    }
  }
} */
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map