"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VLogin = exports.VRegister = void 0;
const joi_1 = __importDefault(require("joi"));
exports.VRegister = joi_1.default.object({
    username: joi_1.default.string().min(3).max(50).required(),
    password: joi_1.default.string().min(6).required(),
    name: joi_1.default.string().min(2).max(100).required(),
});
exports.VLogin = joi_1.default.object({
    username: joi_1.default.string().min(3).max(50).required(),
    password: joi_1.default.string().min(6).required(),
});
//# sourceMappingURL=auth.validation.js.map