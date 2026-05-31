"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const error_utils_1 = require("@utils/error.utils");
const MValidation = (schema) => async (req, res, next) => {
    try {
        const validationPromises = [];
        if (schema.body) {
            validationPromises.push(schema.body.validateAsync(req.body, { abortEarly: false }));
        }
        if (schema.query) {
            validationPromises.push(schema.query.validateAsync(req.query, { abortEarly: false }));
        }
        if (schema.params) {
            validationPromises.push(schema.params.validateAsync(req.params, { abortEarly: false }));
        }
        await Promise.all(validationPromises);
        return next();
    }
    catch (error) {
        if (error instanceof joi_1.default.ValidationError) {
            const errors = error.details.map((detail) => ({
                path: detail.path.join("."),
                message: detail.message,
            }));
            return next(new error_utils_1.ApiError("Validation failed", 400));
        }
        return next(new error_utils_1.ApiError("Internal Server Error during validation", 500));
    }
};
exports.default = MValidation;
//# sourceMappingURL=validation.middleware.js.map