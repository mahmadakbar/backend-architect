/**
 * The Swagger configuration has been modularized into separate files
 * per API domain for better maintainability.
 *
 * See: ./swagger/ folder for the new modular structure
 * - base.swagger.ts: Base config, common schemas
 * - auth.swagger.ts: Authentication endpoints
 * - products.swagger.ts: Product management endpoints
 * - orders.swagger.ts: Order management endpoints
 * - index.ts: Combines all configurations
 *
 * To add new endpoints:
 * 1. Create a new file in ./swagger/ (e.g., tasks.swagger.ts)
 * 2. Export schemas and paths from that file
 * 3. Import and merge in ./swagger/index.ts
 */

export { swaggerSpecs } from "./swagger/index";
