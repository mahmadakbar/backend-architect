import Joi from "joi";

export const VCreateOrder: Joi.ObjectSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

export const VOrderPagination: Joi.ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.string()
    .valid("PENDING", "PROCESSING", "COMPLETED", "CANCELLED")
    .optional(),
  search: Joi.string().optional().allow(null, ""),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
  sortBy: Joi.string()
    .valid("date", "status", "totalAmount", "code")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("asc"),
});
