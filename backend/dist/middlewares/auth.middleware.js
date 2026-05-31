"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_utils_1 = require("@utils/error.utils");
const jwt_util_1 = require("@utils/jwt.util");
const prisma_clients_1 = require("@prisma/prisma.clients");
const MAuthToken = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return next(new error_utils_1.ApiError("Not authorized, no token", 401));
    }
    try {
        const token = authorization.split(" ")[1];
        const decoded = (0, jwt_util_1.verifyAccessToken)(token);
        if (decoded === null) {
            return next(new error_utils_1.ApiError("Not authorized, token invalid", 401));
        }
        console.log("Decoded JWT ___:", decoded);
        console.log("Decoded user ID:", decoded?.userId, typeof decoded.userId);
        // Fetch user with role information
        const user = await prisma_clients_1.prisma.user.findUnique({
            where: { id: Number(decoded.userId) },
            include: { role: true },
        });
        if (!user) {
            return next(new error_utils_1.ApiError("User not found", 401));
        }
        // Attach user with role to request object
        req.user = {
            id: user.id,
            username: user.username,
            name: user.name || undefined,
            role: user.role.name,
        };
        next();
    }
    catch (error) {
        // If access token is expired or invalid, could try to use refresh token here
        // or simply return 401 and let client handle refresh. For simplicity, returning 401.
        return next(new error_utils_1.ApiError("Not authorized, token failed", 401));
    }
};
exports.default = MAuthToken;
//# sourceMappingURL=auth.middleware.js.map