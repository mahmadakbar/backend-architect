import Joi from "joi";

export const VChangeUserRole = Joi.object({
  roleId: Joi.number().integer().positive().required().messages({
    "number.base": "Role ID must be a number",
    "number.integer": "Role ID must be an integer",
    "number.positive": "Role ID must be a positive number",
    "any.required": "Role ID is required",
  }),
});
