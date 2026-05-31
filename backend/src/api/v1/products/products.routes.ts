import { MAuthToken, MIsAdminOrAbove } from "@middlewares";
import { Router } from "express";
import {
  VCreateProduct,
  VUpdateProduct,
  VProductPagination,
} from "./products.validation";
import {
  CCreateProduct,
  CUpdateProduct,
  CDeleteProduct,
  CGetProductById,
  CGetProducts,
  CSearchProducts,
} from "./products.controller";
import validator from "@utils/validator.util";

const router = Router();

// Public routes (no auth required)
router.get("/", validator.query(VProductPagination), CGetProducts);
// #swagger.tags = ['Products']
// #swagger.summary = 'Get all products with pagination and advanced filtering'
// #swagger.description = 'Retrieve all products with pagination, search, filter, and sort options'
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
/* #swagger.parameters['search'] = {
  in: 'query',
  description: 'Search by product code, name, description, or category',
  required: false,
  type: 'string'
} */
/* #swagger.parameters['category'] = {
  in: 'query',
  description: 'Filter by category (exact match)',
  required: false,
  type: 'string'
} */
/* #swagger.parameters['status'] = {
  in: 'query',
  description: 'Filter by status (0: deleted, 1: active, 2: inactive)',
  required: false,
  type: 'integer',
  enum: [0, 1, 2]
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
  enum: ['date', 'status', 'category', 'name', 'price', 'code']
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
  description: 'Products retrieved successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Products retrieved successfully' },
          data: { type: 'array', items: { $ref: '#/definitions/Product' } },
          metadata: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              totalData: { type: 'integer', example: 50 },
              totalPages: { type: 'integer', example: 5 }
            }
          }
        }
      }
    }
  }
} */

router.get("/search", CSearchProducts);
// #swagger.tags = ['Products']
// #swagger.summary = 'Search products'
// #swagger.description = 'Search products by name or description'
/* #swagger.parameters['search'] = {
  in: 'query',
  description: 'Search term',
  required: true,
  type: 'string'
} */
/* #swagger.responses[200] = {
  description: 'Products search completed',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Products search completed' },
          data: { type: 'array', items: { $ref: '#/definitions/Product' } },
          metadata: { $ref: '#/definitions/PaginationMetadata' }
        }
      }
    }
  }
} */

router.get("/:productId", CGetProductById);
// #swagger.tags = ['Products']
// #swagger.summary = 'Get product by ID'
// #swagger.description = 'Retrieve a single product by its ID'
/* #swagger.parameters['productId'] = {
  in: 'path',
  description: 'Product ID',
  required: true,
  type: 'integer'
} */
/* #swagger.responses[200] = {
  description: 'Product retrieved successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Product retrieved successfully' },
          data: { $ref: '#/definitions/Product' }
        }
      }
    }
  }
} */

// Protected routes (admin/superadmin only)
router.post(
  "/",
  MAuthToken,
  MIsAdminOrAbove,
  validator.body(VCreateProduct),
  CCreateProduct,
);
// #swagger.tags = ['Products']
// #swagger.summary = 'Create a new product'
// #swagger.description = 'Create a new product (Admin/Superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/CreateProductRequest" }
    }
  }
} */
/* #swagger.responses[201] = {
  description: 'Product created successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Product created successfully' },
          data: { $ref: '#/definitions/Product' }
        }
      }
    }
  }
} */

router.put(
  "/:productId",
  MAuthToken,
  MIsAdminOrAbove,
  validator.body(VUpdateProduct),
  CUpdateProduct,
);
// #swagger.tags = ['Products']
// #swagger.summary = 'Update a product'
// #swagger.description = 'Update product details (Admin/Superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['productId'] = {
  in: 'path',
  description: 'Product ID',
  required: true,
  type: 'integer'
} */
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/UpdateProductRequest" }
    }
  }
} */
/* #swagger.responses[200] = {
  description: 'Product updated successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Product updated successfully' },
          data: { $ref: '#/definitions/Product' }
        }
      }
    }
  }
} */

router.delete("/:productId", MAuthToken, MIsAdminOrAbove, CDeleteProduct);
// #swagger.tags = ['Products']
// #swagger.summary = 'Delete a product'
// #swagger.description = 'Soft delete a product (Admin/Superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['productId'] = {
  in: 'path',
  description: 'Product ID',
  required: true,
  type: 'integer'
} */
/* #swagger.responses[200] = {
  description: 'Product deleted successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Product deleted successfully' },
          data: { type: 'object' }
        }
      }
    }
  }
} */

export default router;
