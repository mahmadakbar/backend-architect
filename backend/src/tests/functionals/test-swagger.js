require("ts-node/register");
require("tsconfig-paths/register");

const { swaggerSpecs } = require("../../configs/swagger.config.ts");

console.log("Security:", JSON.stringify(swaggerSpecs.security, null, 2));
console.log(
  "ApiKeyAuth:",
  JSON.stringify(swaggerSpecs.components?.securitySchemes?.ApiKeyAuth, null, 2),
);
