"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _middlewares_1 = require("@middlewares");
const express_1 = require("express");
const validator_util_1 = __importDefault(require("@utils/validator.util"));
const users_controller_1 = require("./users.controller");
const users_validation_1 = require("./users.validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(_middlewares_1.MAuthToken);
// Get all roles (any authenticated user can see available roles)
router.get("/roles", users_controller_1.CGetAllRoles);
// #swagger.tags = ['Users']
// #swagger.summary = 'Get all available roles'
// #swagger.description = 'Retrieve all available roles in the system'
// #swagger.security = [{ "bearerAuth": [] }]
// Routes below require superadmin role
router.use(_middlewares_1.MIsSuperAdmin);
// Get all users (superadmin only)
router.get("/", users_controller_1.CGetAllUsers);
// #swagger.tags = ['Users']
// #swagger.summary = 'Get all users'
// #swagger.description = 'Retrieve all users with their roles (superadmin only)'
// #swagger.security = [{ "bearerAuth": [] }]
// Change user role (superadmin only)
router.put("/:userId/role", validator_util_1.default.body(users_validation_1.VChangeUserRole), users_controller_1.CChangeUserRole);
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
exports.default = router;
//# sourceMappingURL=users.routes.js.map