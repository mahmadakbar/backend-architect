// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiError } from "@utils/error.utils";

interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const MValidation =
  (schema: ValidationSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationPromises = [];

      if (schema.body) {
        validationPromises.push(
          schema.body.validateAsync(req.body, { abortEarly: false })
        );
      }

      if (schema.query) {
        validationPromises.push(
          schema.query.validateAsync(req.query, { abortEarly: false })
        );
      }

      if (schema.params) {
        validationPromises.push(
          schema.params.validateAsync(req.params, { abortEarly: false })
        );
      }

      await Promise.all(validationPromises);
      return next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map((detail) => ({
          path: detail.path.join("."),
          message: detail.message,
        }));
        return next(new ApiError("Validation failed", 400));
      }
      return next(new ApiError("Internal Server Error during validation", 500));
    }
  };

export default MValidation;
