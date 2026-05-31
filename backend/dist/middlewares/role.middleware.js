"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIsAdminOrAbove = exports.MIsSuperAdmin = exports.MCheckRole = void 0;
const error_utils_1 = require("@utils/error.utils");
/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of role names that are allowed to access the route
 */
const MCheckRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return next(new error_utils_1.ApiError("Unauthorized: No role found", 401));
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new error_utils_1.ApiError(`Forbidden: ${user.role} role does not have permission to access this resource`, 403));
        }
        next();
    };
};
exports.MCheckRole = MCheckRole;
/**
 * Middleware to check if user is superadmin
 */
exports.MIsSuperAdmin = (0, exports.MCheckRole)(["superadmin"]);
/**
 * Middleware to check if user is superadmin or admin
 */
exports.MIsAdminOrAbove = (0, exports.MCheckRole)(["superadmin", "admin"]);
//# sourceMappingURL=role.middleware.js.map