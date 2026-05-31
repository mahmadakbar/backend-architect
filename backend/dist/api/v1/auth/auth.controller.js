"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLoginUser = exports.CRegisterUser = void 0;
const auth_service_1 = require("./auth.service");
const error_utils_1 = require("@utils/error.utils");
const axios_1 = require("axios");
const CRegisterUser = async (req, res, next) => {
    try {
        const { body: userData } = req;
        const result = await (0, auth_service_1.SRegisterUser)(userData);
        res.status(axios_1.HttpStatusCode.Created).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        console.log("Error in CRegisterUser:", error);
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.Conflict);
    }
};
exports.CRegisterUser = CRegisterUser;
const CLoginUser = async (req, res, next) => {
    try {
        const { body: userData } = req;
        const result = await (0, auth_service_1.SLoginUser)(userData);
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "User logged in successfully",
            data: result,
        });
    }
    catch (error) {
        console.log("Error in CLoginUser:", error);
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.Unauthorized);
    }
};
exports.CLoginUser = CLoginUser;
//# sourceMappingURL=auth.controller.js.map