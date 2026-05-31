"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VProductPagination = exports.VUpdateProduct = exports.VCreateProduct = void 0;
const joi_1 = __importDefault(require("joi"));
exports.VCreateProduct = joi_1.default.object({
    name: joi_1.default.string().min(3).max(255).required(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
    price: joi_1.default.number().positive().precision(2).required(),
    stock: joi_1.default.number().integer().min(0).required(),
    image: joi_1.default.string().uri().optional().allow(null, ""),
    category: joi_1.default.string().max(100).optional().allow(null, ""),
    status: joi_1.default.number().integer().valid(0, 1, 2).optional().default(1),
});
exports.VUpdateProduct = joi_1.default.object({
    name: joi_1.default.string().min(3).max(255).optional(),
    description: joi_1.default.string().max(5000).optional().allow(null, ""),
    price: joi_1.default.number().positive().precision(2).optional(),
    stock: joi_1.default.number().integer().min(0).optional(),
    image: joi_1.default.string().uri().optional().allow(null, ""),
    category: joi_1.default.string().max(100).optional().allow(null, ""),
    status: joi_1.default.number().integer().valid(0, 1, 2).optional(),
});
exports.VProductPagination = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    search: joi_1.default.string().optional().allow(null, ""),
    category: joi_1.default.string().optional().allow(null, ""),
    status: joi_1.default.number().integer().valid(0, 1, 2).optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).optional(),
    sortBy: joi_1.default.string()
        .valid("date", "status", "category", "name", "price", "code")
        .optional(),
    sortOrder: joi_1.default.string().valid("asc", "desc").optional().default("asc"),
});
//# sourceMappingURL=products.validation.js.map