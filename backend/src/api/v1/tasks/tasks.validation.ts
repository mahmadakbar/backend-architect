import Joi from "joi";

export const VCreateTask: Joi.ObjectSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(3).max(255).required(),
  status: Joi.boolean().optional().allow(null),
  deadline: Joi.date().optional().allow(null),
});

export const VUpdateTask: Joi.ObjectSchema = Joi.object({
  title: Joi.string().optional().allow(null),
  description: Joi.string().optional().allow(null),
  status: Joi.boolean().optional().allow(null),
  deadline: Joi.date().optional().allow(null),
});
