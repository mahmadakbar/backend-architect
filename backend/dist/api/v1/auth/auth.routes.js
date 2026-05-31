"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_util_1 = __importDefault(require("@utils/validator.util"));
const auth_validation_1 = require("./auth.validation");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/register", validator_util_1.default.body(auth_validation_1.VRegister), auth_controller_1.CRegisterUser);
// #swagger.tags = ['Auth']
// #swagger.summary = 'Register a new user'
// #swagger.description = 'Create a new user account with username, password, and name'
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/RegisterRequest" }
    }
  }
} */
/* #swagger.responses[201] = {
  description: 'User registered successfully',
  content: {
    "application/json": {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User registered successfully' }
        }
      }
    }
  }
} */
/* #swagger.responses[409] = {
  description: 'User already exists',
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/ErrorResponse" }
    }
  }
} */
router.post("/login", validator_util_1.default.body(auth_validation_1.VLogin), auth_controller_1.CLoginUser);
// #swagger.tags = ['Auth']
// #swagger.summary = 'Login user'
// #swagger.description = 'Authenticate user and receive JWT token'
/* #swagger.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/LoginRequest" }
    }
  }
} */
/* #swagger.responses[200] = {
  description: 'Login successful',
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/LoginResponse" }
    }
  }
} */
/* #swagger.responses[401] = {
  description: 'Invalid credentials',
  content: {
    "application/json": {
      schema: { $ref: "#/definitions/ErrorResponse" }
    }
  }
} */
exports.default = router;
//# sourceMappingURL=auth.routes.js.map