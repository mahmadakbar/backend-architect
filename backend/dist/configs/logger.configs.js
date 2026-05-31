"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const env_configs_1 = __importDefault(require("./env.configs"));
let transport;
try {
    transport =
        env_configs_1.default.BRANCH === "development"
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                },
            }
            : undefined;
}
catch (error) {
    console.warn("Failed to configure pino transport, using defaults", error);
    transport = undefined;
}
const logger = (0, pino_1.default)({
    level: env_configs_1.default.LOG_LEVEL || "info",
    transport,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
exports.default = logger;
//# sourceMappingURL=logger.configs.js.map