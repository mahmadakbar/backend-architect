import Joi from "joi";

export const VCreateProduct: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(5000).optional().allow(null, ""),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().optional().allow(null, ""),
  category: Joi.string().max(100).optional().allow(null, ""),
  status: Joi.number().integer().valid(0, 1, 2).optional().default(1),
});

export const VUpdateProduct: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(5000).optional().allow(null, ""),
  price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
  image: Joi.string().uri().optional().allow(null, ""),
  category: Joi.string().max(100).optional().allow(null, ""),
  status: Joi.number().integer().valid(0, 1, 2).optional(),
});

export const VProductPagination: Joi.ObjectSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(null, ""),
  category: Joi.string().optional().allow(null, ""),
  status: Joi.number().integer().valid(0, 1, 2).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
  sortBy: Joi.string()
    .valid("date", "status", "category", "name", "price", "code")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("asc"),
});
