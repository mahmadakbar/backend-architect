import { MAuthToken, MIsAdminOrAbove } from "@middlewares";
import { Router } from "express";
import {
  VCreateOrder,
  VOrderPagination,
  VUpdateOrderStatus,
} from "./orders.validation";
import {
  CCreateOrder,
  CGetOrderById,
  CGetOrderHistory,
  CCancelOrder,
  CUpdateOrderStatus,
} from "./orders.controller";
import validator from "@utils/validator.util";

const router = Router();

// Note: MApiKey and MRateLimitWithQueue middlewares are applied at v1.routes.ts level
// All order routes require authentication
router.use(MAuthToken);

// Create order route
router.post("/", validator.body(VCreateOrder), CCreateOrder);
// #swagger.tags = ['Orders']
// #swagger.summary = 'Create a new order'
// #swagger.description = 'Create a new order (User only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/CreateOrderRequest" }
    }
  }
} */
/* #swagger.responses[201] = {
  description: 'Order created successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Order created successfully' },
          data: { $ref: '#/definitions/Order' }
        }
      }
    }
  }
} */

router.get("/history", validator.query(VOrderPagination), CGetOrderHistory);
// #swagger.tags = ['Orders']
// #swagger.summary = 'Get order history with advanced search and filtering'
// #swagger.description = 'Get order history for current user with search, filter, and sort. Admin/Superadmin can see all orders'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['page'] = {
  in: 'query',
  description: 'Page number',
  required: false,
  type: 'integer',
  default: 1
} */
/* #swagger.parameters['limit'] = {
  in: 'query',
  description: 'Number of items per page',
  required: false,
  type: 'integer',
  default: 10
} */
/* #swagger.parameters['status'] = {
  in: 'query',
  description: 'Filter by order status',
  required: false,
  type: 'string',
  enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']
} */
/* #swagger.parameters['search'] = {
  in: 'query',
  description: 'Search by order code, user name, or username',
  required: false,
  type: 'string'
} */
/* #swagger.parameters['startDate'] = {
  in: 'query',
  description: 'Filter by creation date (start date in ISO format)',
  required: false,
  type: 'string',
  format: 'date-time'
} */
/* #swagger.parameters['endDate'] = {
  in: 'query',
  description: 'Filter by creation date (end date in ISO format)',
  required: false,
  type: 'string',
  format: 'date-time'
} */
/* #swagger.parameters['sortBy'] = {
  in: 'query',
  description: 'Sort by field',
  required: false,
  type: 'string',
  enum: ['date', 'status', 'totalAmount', 'code']
} */
/* #swagger.parameters['sortOrder'] = {
  in: 'query',
  description: 'Sort order',
  required: false,
  type: 'string',
  enum: ['asc', 'desc'],
  default: 'asc'
} */
/* #swagger.responses[200] = {
  description: 'Order history retrieved successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Order history retrieved successfully' },
          data: { type: 'array', items: { $ref: '#/definitions/Order' } },
          metadata: { $ref: '#/definitions/PaginationMetadata' }
        }
      }
    }
  }
} */

router.get("/:orderId", CGetOrderById);
// #swagger.tags = ['Orders']
// #swagger.summary = 'Get order details'
// #swagger.description = 'Get detailed information about a specific order'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['orderId'] = {
  in: 'path',
  description: 'Order ID',
  required: true,
  type: 'integer'
} */
/* #swagger.responses[200] = {
  description: 'Order retrieved successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Order retrieved successfully' },
          data: { $ref: '#/definitions/Order' }
        }
      }
    }
  }
} */

router.post("/:orderId/cancel", MIsAdminOrAbove, CCancelOrder);
// #swagger.tags = ['Orders']
// #swagger.summary = 'Cancel an order'
// #swagger.description = 'Cancel an order (Admin/Superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['orderId'] = {
  in: 'path',
  description: 'Order ID',
  required: true,
  type: 'integer'
} */
/* #swagger.responses[200] = {
  description: 'Order cancelled successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Order cancelled successfully' },
          data: { $ref: '#/definitions/Order' }
        }
      }
    }
  }
} */

router.patch(
  "/:orderId/status",
  MIsAdminOrAbove,
  validator.body(VUpdateOrderStatus),
  CUpdateOrderStatus,
);
// #swagger.tags = ['Orders']
// #swagger.summary = 'Update order status'
// #swagger.description = 'Update the status of an order (Admin/Superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['orderId'] = {
  in: 'path',
  description: 'Order ID',
  required: true,
  type: 'integer'
} */
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
            description: 'New order status'
          }
        },
        required: ['status']
      }
    }
  }
} */
/* #swagger.responses[200] = {
  description: 'Order status updated successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Order status updated successfully' },
          data: { $ref: '#/definitions/Order' }
        }
      }
    }
  }
} */

export default router;
