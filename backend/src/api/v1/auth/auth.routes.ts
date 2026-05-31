import { Router } from "express";
import validator from "@utils/validator.util";
import { VLogin, VRegister } from "./auth.validation";
import { CLoginUser, CRegisterUser } from "./auth.controller";

const router = Router();

router.post("/register", validator.body(VRegister), CRegisterUser);
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

router.post("/login", validator.body(VLogin), CLoginUser);
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

export default router;
