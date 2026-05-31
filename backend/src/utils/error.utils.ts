import { NextFunction } from "express";
import { HttpStatusCode } from "axios";

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (
  error: unknown,
  next: NextFunction,
  defaultStatusCode: number = HttpStatusCode.InternalServerError
): void => {
  if (!(error instanceof ApiError)) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    error = new ApiError(message, defaultStatusCode);
  }

  next(error);
};
