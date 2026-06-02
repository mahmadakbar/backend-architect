import { Router } from "express";
import { MApiKey } from "@middlewares";
import { MRateLimitWithQueue } from "@middlewares/ratelimit.middleware";
import authRoutes from "./auth/auth.routes";
import taskRoutes from "./tasks/tasks.routes";
import userRoutes from "./users/users.routes";
import productRoutes from "./products/products.routes";
import orderRoutes from "./orders/orders.routes";
import queueRoutes from "./queue/queue.routes";
import jobRoutes from "./jobs/jobs.routes";

const router = Router();

// Apply strict API key and security headers validation to all v1 routes
router.use(MApiKey);

// Auth and queue routes (no rate limiting)
router.use("/auth", authRoutes);
router.use("/queue", queueRoutes);
router.use("/jobs", jobRoutes); // Job queue management (admin only)

// Apply rate limiting to these routes
router.use("/tasks", MRateLimitWithQueue(), taskRoutes);
router.use("/users", MRateLimitWithQueue(), userRoutes);
router.use("/products", MRateLimitWithQueue(), productRoutes);
router.use("/orders", MRateLimitWithQueue(), orderRoutes);

export default router;
