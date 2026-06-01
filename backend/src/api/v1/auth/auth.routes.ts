import { Router } from "express";
import validator from "@utils/validator.util";
import { VLogin, VRegister } from "./auth.validation";
import { CLoginUser, CRegisterUser } from "./auth.controller";

const router = Router();
// Note: MApiKey middleware is applied at v1.routes.ts level

router.post("/register", validator.body(VRegister), CRegisterUser);
// #swagger.tags = ['Auth']
// #swagger.summary = 'Register a new user'
// #swagger.description = 'Create a new user account with username, password, and name. **Requires security headers**: apikey, x-content-type-options, x-xss-protection, strict-transport-security, x-frame-options'
/* #swagger.parameters['apikey'] = {
  in: 'header',
  required: true,
  type: 'string',
  description: 'API Key for authentication'
} */
/* #swagger.parameters['x-content-type-options'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'nosniff',
  description: 'Prevents MIME type sniffing'
} */
/* #swagger.parameters['x-xss-protection'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: '1; mode=block',
  description: 'Enables XSS protection'
} */
/* #swagger.parameters['strict-transport-security'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'max-age=31536000; includeSubDomains; preload',
  description: 'Enforces HTTPS connections'
} */
/* #swagger.parameters['x-frame-options'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'SAMEORIGIN',
  description: 'Prevents clickjacking attacks'
} */
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
// #swagger.description = 'Authenticate user and receive JWT token. **Requires security headers**: apikey, x-content-type-options, x-xss-protection, strict-transport-security, x-frame-options'
/* #swagger.parameters['apikey'] = {
  in: 'header',
  required: true,
  type: 'string',
  description: 'API Key for authentication'
} */
/* #swagger.parameters['x-content-type-options'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'nosniff',
  description: 'Prevents MIME type sniffing'
} */
/* #swagger.parameters['x-xss-protection'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: '1; mode=block',
  description: 'Enables XSS protection'
} */
/* #swagger.parameters['strict-transport-security'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'max-age=31536000; includeSubDomains; preload',
  description: 'Enforces HTTPS connections'
} */
/* #swagger.parameters['x-frame-options'] = {
  in: 'header',
  required: true,
  type: 'string',
  default: 'SAMEORIGIN',
  description: 'Prevents clickjacking attacks'
} */
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
