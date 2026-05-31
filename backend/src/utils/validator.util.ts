import { RequestHandler } from "express";
import {
  createValidator,
  ExpressJoiContainerConfig,
  ExpressJoiInstance,
} from "express-joi-validation";
import Joi from "joi";

interface EJoiInstanceExt extends ExpressJoiInstance {
  formdata(schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): RequestHandler;
}

const validator = <EJoiInstanceExt>createValidator({
  passError: true,
});

validator.formdata =
  (schema, cfg): RequestHandler =>
  (req, res, next) => {
    if (!req.body?.data)
      return next({
        message: "data is required",
        status: 400,
      });

    const validate = schema.validate(
      JSON.parse(req.body.data as string),
      cfg?.joi || {}
    );

    if (validate.error) {
      return next(validate.error);
    }

    req.body = {
      ...req.body,
      data: validate.value,
    };
    next();
  };

export default validator;
