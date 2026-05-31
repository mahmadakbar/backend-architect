"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.ApiError = void 0;
const axios_1 = require("axios");
class ApiError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
const handleError = (error, next, defaultStatusCode = axios_1.HttpStatusCode.InternalServerError) => {
    if (!(error instanceof ApiError)) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        error = new ApiError(message, defaultStatusCode);
    }
    next(error);
};
exports.handleError = handleError;
//# sourceMappingURL=error.utils.js.map