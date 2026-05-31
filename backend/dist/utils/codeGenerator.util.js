"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderItemCode = exports.generateOrderCode = exports.generateProductCode = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
/**
 * Generate unique code for products (PRD0001, PRD0002, etc.)
 */
const generateProductCode = async () => {
    const lastProduct = await prisma_clients_1.prisma.product.findFirst({
        orderBy: { id: "desc" },
        select: { code: true },
    });
    if (!lastProduct) {
        return "PRD0001";
    }
    // Extract number from last code (e.g., "PRD0005" -> 5)
    const lastNumber = parseInt(lastProduct.code.replace("PRD", ""), 10);
    const nextNumber = lastNumber + 1;
    // Format with leading zeros (PRD0001, PRD0002, etc.)
    return `PRD${nextNumber.toString().padStart(4, "0")}`;
};
exports.generateProductCode = generateProductCode;
/**
 * Generate unique code for orders (ORD0001, ORD0002, etc.)
 */
const generateOrderCode = async () => {
    const lastOrder = await prisma_clients_1.prisma.order.findFirst({
        orderBy: { id: "desc" },
        select: { code: true },
    });
    if (!lastOrder) {
        return "ORD0001";
    }
    const lastNumber = parseInt(lastOrder.code.replace("ORD", ""), 10);
    const nextNumber = lastNumber + 1;
    return `ORD${nextNumber.toString().padStart(4, "0")}`;
};
exports.generateOrderCode = generateOrderCode;
/**
 * Generate unique code for order items (ITM0001, ITM0002, etc.)
 */
const generateOrderItemCode = async () => {
    const lastItem = await prisma_clients_1.prisma.orderItem.findFirst({
        orderBy: { id: "desc" },
        select: { code: true },
    });
    if (!lastItem) {
        return "ITM0001";
    }
    const lastNumber = parseInt(lastItem.code.replace("ITM", ""), 10);
    const nextNumber = lastNumber + 1;
    return `ITM${nextNumber.toString().padStart(4, "0")}`;
};
exports.generateOrderItemCode = generateOrderItemCode;
//# sourceMappingURL=codeGenerator.util.js.map