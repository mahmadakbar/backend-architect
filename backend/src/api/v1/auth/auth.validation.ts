import Joi from "joi";

export const VRegister: Joi.ObjectSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
});

export const VLogin: Joi.ObjectSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
});
