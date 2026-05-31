"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MErrorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = 500;
    let message = "Internal Server Error";
    // Handle Joi validation errors
    if (err.error && err.error.isJoi) {
        statusCode = 400;
        message = err.error.details.map((detail) => detail.message).join(", ");
    }
    // If it's our custom ApiError, use its values
    else if ("statusCode" in err) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.message) {
        // For standard errors, at least use the message
        message = err.message;
    }
    // Log error for debugging (consider removing in production)
    console.error(`[${statusCode}] ${message}`, err.stack || err);
    // Send formatted response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
        },
    });
};
exports.default = MErrorHandler;
//# sourceMappingURL=errorHandler.middleware.js.map