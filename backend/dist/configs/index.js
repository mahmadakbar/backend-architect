"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpecs = exports.logger = exports.env = void 0;
const env_configs_1 = __importDefault(require("./env.configs"));
exports.env = env_configs_1.default;
const logger_configs_1 = __importDefault(require("./logger.configs"));
exports.logger = logger_configs_1.default;
const swagger_config_1 = require("./swagger.config");
Object.defineProperty(exports, "swaggerSpecs", { enumerable: true, get: function () { return swagger_config_1.swaggerSpecs; } });
//# sourceMappingURL=index.js.map