// IMPORTANT: Initialize OpenTelemetry FIRST before any other imports
import "./configs/telemetry.configs";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env, logger, swaggerSpecs } from "@configs";
import { MErrorHandler } from "@middlewares";
import apiRoutes from "@api/api.routes";
import { QueueWorker } from "@utils/queue.worker";
import { QueueManager } from "@jobs/queue.manager";
import {
  startAllProcessors,
  stopAllProcessors,
} from "@jobs/processors/job.processors";
import { EmailService } from "@services/email.service";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = Number(env.PORT) || 5000;

// Setup Socket.IO with CORS
export const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // In production, specify allowed origins
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join a room for queue token updates
  socket.on("join-queue", (queueToken: string) => {
    socket.join(`queue:${queueToken}`);
    logger.info(`Client ${socket.id} joined queue room: ${queueToken}`);
  });

  // Leave queue room
  socket.on("leave-queue", (queueToken: string) => {
    socket.leave(`queue:${queueToken}`);
    logger.info(`Client ${socket.id} left queue room: ${queueToken}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Custom security headers (API key validation is handled by MApiKey middleware in routes)
app.use((req, res, next) => {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-xss-protection", "1; mode=block");
  res.setHeader(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains; preload",
  );
  res.setHeader("x-frame-options", "SAMEORIGIN");
  res.setHeader("apikey", env.APIKEY);
  next();
});

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

// Initialize services before starting server
async function initializeServices() {
  try {
    // Initialize Email Service
    EmailService.initialize();

    // Initialize BullMQ queues
    await QueueManager.initialize();

    // Start job processors
    startAllProcessors();

    logger.info("✅ All services initialized successfully");
  } catch (error) {
    logger.error(error, "Failed to initialize services");
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Stop job processors
    await stopAllProcessors();

    // Close BullMQ queues
    await QueueManager.shutdown();

    // Stop old queue worker
    QueueWorker.stop();

    // Close Socket.IO connections
    io.close(() => {
      logger.info("Socket.IO server closed");
    });

    logger.info("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error(error, "Error during graceful shutdown");
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error(error, "Uncaught exception");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled rejection");
  gracefulShutdown("unhandledRejection");
});

// Start server
initializeServices().then(() => {
  server.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`🔌 Socket.IO server ready`);
    logger.info(`📧 Email service initialized`);
    logger.info(`🔄 Job queue processors running`);

    // Start old queue worker for rate limiting (backward compatibility)
    QueueWorker.start(1000); // Process every 1 second
  });
});

export default app;
export { server };
