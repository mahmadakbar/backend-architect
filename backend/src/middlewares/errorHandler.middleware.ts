import { Request, Response, NextFunction } from "express";
import { ApiError } from "@utils/error.utils";
import logger from "@configs/logger.configs";

const MErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle Joi validation errors
  if (err.error && err.error.isJoi) {
    statusCode = 400;
    message = err.error.details.map((detail: any) => detail.message).join(", ");
  }
  // If it's our custom ApiError, use its values
  else if ("statusCode" in err) {
    statusCode = (err as ApiError).statusCode;
    message = err.message;
  } else if (err.message) {
    // For standard errors, at least use the message
    message = err.message;
  }

  // Log error for debugging (consider removing in production)
  logger.error(
    { err, statusCode, message, stack: err.stack },
    `[${statusCode}] ${message}`,
  );

  // Send formatted response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
};

export default MErrorHandler;
