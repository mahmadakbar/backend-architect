import { MAuthToken } from "@middlewares";
import { Router } from "express";
import { VCreateTask, VUpdateTask } from "./tasks.validation";
import {
  CCreateTask,
  CDeleteTask,
  CGetAllTasks,
  CUpdateTask,
} from "./tasks.controller";
import validator from "@utils/validator.util";

const router = Router();
router.use(MAuthToken);

router.post("/", validator.body(VCreateTask), CCreateTask);
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

router.post("/update/:taskId", validator.body(VUpdateTask), CUpdateTask);
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

router.delete("/:taskId", CDeleteTask);
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

router.get("/", CGetAllTasks);
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

export default router;
