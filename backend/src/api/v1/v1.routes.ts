import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import taskRoutes from "./tasks/tasks.routes";
import userRoutes from "./users/users.routes";
import productRoutes from "./products/products.routes";
import orderRoutes from "./orders/orders.routes";

const router = Router();

router.use("/tasks", taskRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;
