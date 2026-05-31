"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpecs = void 0;
var index_1 = require("./swagger/index");
Object.defineProperty(exports, "swaggerSpecs", { enumerable: true, get: function () { return index_1.swaggerSpecs; } });
//# sourceMappingURL=swagger.config.js.map