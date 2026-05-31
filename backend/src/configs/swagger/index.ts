import { swaggerBase } from "./base.swagger";
import { authSchemas, authPaths } from "./auth.swagger";
import { taskSchemas, taskPaths } from "./tasks.swagger";
import { userSchemas, userPaths } from "./users.swagger";
import { productSchemas, productPaths } from "./products.swagger";
import { orderSchemas, orderPaths } from "./orders.swagger";

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

export const swaggerSpecs = {
  ...swaggerBase,
  components: {
    ...swaggerBase.components,
    schemas: {
      ...swaggerBase.components.schemas,
      // Auth schemas
      ...authSchemas,
      // Task schemas
      ...taskSchemas,
      // User schemas
      ...userSchemas,
      // Product schemas
      ...productSchemas,
      // Order schemas
      ...orderSchemas,
    },
  },
  paths: {
    // Auth paths
    ...authPaths,
    // Task paths
    ...taskPaths,
    // User paths
    ...userPaths,
    // Product paths
    ...productPaths,
    // Order paths
    ...orderPaths,
  },
};
