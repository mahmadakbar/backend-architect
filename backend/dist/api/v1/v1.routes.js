"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const tasks_routes_1 = __importDefault(require("./tasks/tasks.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
const products_routes_1 = __importDefault(require("./products/products.routes"));
const orders_routes_1 = __importDefault(require("./orders/orders.routes"));
const router = (0, express_1.Router)();
router.use("/tasks", tasks_routes_1.default);
router.use("/auth", auth_routes_1.default);
router.use("/users", users_routes_1.default);
router.use("/products", products_routes_1.default);
router.use("/orders", orders_routes_1.default);
exports.default = router;
//# sourceMappingURL=v1.routes.js.map