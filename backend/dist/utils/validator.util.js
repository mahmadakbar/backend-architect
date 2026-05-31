"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_joi_validation_1 = require("express-joi-validation");
const validator = (0, express_joi_validation_1.createValidator)({
    passError: true,
});
validator.formdata =
    (schema, cfg) => (req, res, next) => {
        if (!req.body?.data)
            return next({
                message: "data is required",
                status: 400,
            });
        const validate = schema.validate(JSON.parse(req.body.data), cfg?.joi || {});
        if (validate.error) {
            return next(validate.error);
        }
        req.body = {
            ...req.body,
            data: validate.value,
        };
        next();
    };
exports.default = validator;
//# sourceMappingURL=validator.util.js.map