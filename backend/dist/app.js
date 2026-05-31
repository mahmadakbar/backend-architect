"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = require("pino-http");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const _configs_1 = require("@configs");
const _middlewares_1 = require("@middlewares");
const api_routes_1 = __importDefault(require("@api/api.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(_configs_1.env.PORT) || 5000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, pino_http_1.pinoHttp)({ logger: _configs_1.logger }));
// Swagger Documentation
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(_configs_1.swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Task Management & E-Commerce API Documentation",
}));
console.log("✅ Swagger documentation available at /api-docs");
app.use("/api", api_routes_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Task Management API is running!",
        documentation: "/api-docs",
        version: "1.0.0",
    });
});
// Centralized error handler
app.use(_middlewares_1.MErrorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map