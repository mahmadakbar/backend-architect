"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpecs = void 0;
const base_swagger_1 = require("./base.swagger");
const auth_swagger_1 = require("./auth.swagger");
const tasks_swagger_1 = require("./tasks.swagger");
const users_swagger_1 = require("./users.swagger");
const products_swagger_1 = require("./products.swagger");
const orders_swagger_1 = require("./orders.swagger");
/**
 * Modular Swagger Configuration
 *
 * Each API domain (auth, products, orders, tasks, users) has its own file containing:
 * - Schemas: Request/response models for that domain
 * - Paths: API endpoint definitions for that domain
 *
 * Benefits:
 * - Easy to maintain: Each file focuses on one API domain
 * - Easy to scale: Add new domains by creating new files
 * - Easy to find: Related schemas and paths are co-located
 * - Easy to update: Changes are isolated to relevant files
 */
exports.swaggerSpecs = {
    ...base_swagger_1.swaggerBase,
    components: {
        ...base_swagger_1.swaggerBase.components,
        schemas: {
            ...base_swagger_1.swaggerBase.components.schemas,
            // Auth schemas
            ...auth_swagger_1.authSchemas,
            // Task schemas
            ...tasks_swagger_1.taskSchemas,
            // User schemas
            ...users_swagger_1.userSchemas,
            // Product schemas
            ...products_swagger_1.productSchemas,
            // Order schemas
            ...orders_swagger_1.orderSchemas,
        },
    },
    paths: {
        // Auth paths
        ...auth_swagger_1.authPaths,
        // Task paths
        ...tasks_swagger_1.taskPaths,
        // User paths
        ...users_swagger_1.userPaths,
        // Product paths
        ...products_swagger_1.productPaths,
        // Order paths
        ...orders_swagger_1.orderPaths,
    },
};
//# sourceMappingURL=index.js.map