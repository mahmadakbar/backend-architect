import { MAuthToken, MIsSuperAdmin } from "@middlewares";
import { Router } from "express";
import validator from "@utils/validator.util";
import {
  CGetAllUsers,
  CChangeUserRole,
  CGetAllRoles,
} from "./users.controller";
import { VChangeUserRole } from "./users.validation";

const router = Router();

// All routes require authentication
router.use(MAuthToken);

// Get all roles (any authenticated user can see available roles)
router.get("/roles", CGetAllRoles);
// #swagger.tags = ['Users']
// #swagger.summary = 'Get all available roles'
// #swagger.description = 'Retrieve all available roles in the system'
// #swagger.security = [{ "bearerAuth": [] }]

// Routes below require superadmin role
router.use(MIsSuperAdmin);

// Get all users (superadmin only)
router.get("/", CGetAllUsers);
// #swagger.tags = ['Users']
// #swagger.summary = 'Get all users'
// #swagger.description = 'Retrieve all users with their roles (superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]

// Change user role (superadmin only)
router.put("/:userId/role", validator.body(VChangeUserRole), CChangeUserRole);
// #swagger.tags = ['Users']
// #swagger.summary = 'Change user role'
// #swagger.description = 'Update a user\'s role (superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
/* #swagger.parameters['userId'] = {
  in: 'path',
  description: 'User ID',
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
          roleId: { type: 'integer', example: 1 }
        }
      }
    }
  }
} */

export default router;
