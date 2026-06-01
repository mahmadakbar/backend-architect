import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export helper utilities
export * from "./helper/currency";
export * from "./helper/cart";
// Re-export RBAC utilities
export * from "./rbac/withRBAC";

// Re-export message utilities
export * from "./messages/errorMessage";
