"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VUpdateTask = exports.VCreateTask = void 0;
const joi_1 = __importDefault(require("joi"));
exports.VCreateTask = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string().min(3).max(255).required(),
    status: joi_1.default.boolean().optional().allow(null),
    deadline: joi_1.default.date().optional().allow(null),
});
exports.VUpdateTask = joi_1.default.object({
    title: joi_1.default.string().optional().allow(null),
    description: joi_1.default.string().optional().allow(null),
    status: joi_1.default.boolean().optional().allow(null),
    deadline: joi_1.default.date().optional().allow(null),
});
//# sourceMappingURL=tasks.validation.js.map