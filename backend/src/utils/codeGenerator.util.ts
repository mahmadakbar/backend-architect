import { prisma } from "@prisma/prisma.clients";

/**
 * Generate unique code for products (PRD0001, PRD0002, etc.)
 */
export const generateProductCode = async (): Promise<string> => {
  const lastProduct = await prisma.product.findFirst({
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

/**
 * Generate unique code for orders (ORD0001, ORD0002, etc.)
 */
export const generateOrderCode = async (): Promise<string> => {
  const lastOrder = await prisma.order.findFirst({
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

/**
 * Generate unique code for order items (ITM0001, ITM0002, etc.)
 */
export const generateOrderItemCode = async (): Promise<string> => {
  const lastItem = await prisma.orderItem.findFirst({
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
