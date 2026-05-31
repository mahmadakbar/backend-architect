"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VChangeUserRole = void 0;
const joi_1 = __importDefault(require("joi"));
exports.VChangeUserRole = joi_1.default.object({
    roleId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Role ID must be a number",
        "number.integer": "Role ID must be an integer",
        "number.positive": "Role ID must be a positive number",
        "any.required": "Role ID is required",
    }),
});
//# sourceMappingURL=users.validation.js.map