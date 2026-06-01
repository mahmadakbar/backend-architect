// IMPORTANT: Initialize OpenTelemetry FIRST before any other imports
import "./configs/telemetry.configs";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env, logger, swaggerSpecs } from "@configs";
import { MErrorHandler } from "@middlewares";
import apiRoutes from "@api/api.routes";

dotenv.config();

const app = express();
const PORT = Number(env.PORT) || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Task Management & E-Commerce API Documentation",
  }),
);
logger.info("✅ Swagger documentation available at /api-docs");

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Task Management & E-Commerce API is running!",
    documentation: "/api-docs",
    version: "1.0.0",
  });
});

// Centralized error handler
app.use(MErrorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});

export default app;
