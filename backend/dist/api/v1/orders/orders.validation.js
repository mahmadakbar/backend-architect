"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOrderPagination = exports.VCreateOrder = void 0;
const joi_1 = __importDefault(require("joi"));
exports.VCreateOrder = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        product_id: joi_1.default.number().integer().positive().required(),
        quantity: joi_1.default.number().integer().positive().required(),
    }))
        .min(1)
        .required(),
});
exports.VOrderPagination = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    status: joi_1.default.string()
        .valid("PENDING", "PROCESSING", "COMPLETED", "CANCELLED")
        .optional(),
    search: joi_1.default.string().optional().allow(null, ""),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).optional(),
    sortBy: joi_1.default.string()
        .valid("date", "status", "totalAmount", "code")
        .optional(),
    sortOrder: joi_1.default.string().valid("asc", "desc").optional().default("asc"),
});
//# sourceMappingURL=orders.validation.js.map