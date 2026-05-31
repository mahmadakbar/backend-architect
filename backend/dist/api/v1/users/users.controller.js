"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CGetAllRoles = exports.CChangeUserRole = exports.CGetAllUsers = void 0;
const users_service_1 = require("./users.service");
const axios_1 = require("axios");
const error_utils_1 = require("@utils/error.utils");
/**
 * Get all users (superadmin only)
 */
const CGetAllUsers = async (req, res, next) => {
    try {
        const users = await (0, users_service_1.SGetAllUsers)();
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Users retrieved successfully",
            data: users,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CGetAllUsers = CGetAllUsers;
/**
 * Change user role (superadmin only)
 */
const CChangeUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;
        if (!roleId) {
            return res.status(axios_1.HttpStatusCode.BadRequest).json({
                success: false,
                message: "Role ID is required",
            });
        }
        const result = await (0, users_service_1.SChangeUserRole)(Number(userId), Number(roleId));
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: result.message,
            data: result,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CChangeUserRole = CChangeUserRole;
/**
 * Get all available roles
 */
const CGetAllRoles = async (req, res, next) => {
    try {
        const roles = await (0, users_service_1.SGetAllRoles)();
        res.status(axios_1.HttpStatusCode.Ok).json({
            success: true,
            message: "Roles retrieved successfully",
            data: roles,
        });
    }
    catch (error) {
        (0, error_utils_1.handleError)(error, next, axios_1.HttpStatusCode.InternalServerError);
    }
};
exports.CGetAllRoles = CGetAllRoles;
//# sourceMappingURL=users.controller.js.map