"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLoginUser = exports.SRegisterUser = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
const error_utils_1 = require("@utils/error.utils");
const encryption_helper_1 = require("@utils/helper/encryption.helper");
const jwt_util_1 = require("@utils/jwt.util");
const axios_1 = require("axios");
const SRegisterUser = async (userData) => {
    try {
        if (!userData.username || !userData.password || !userData.name) {
            throw new error_utils_1.ApiError("All fields are required", axios_1.HttpStatusCode.BadRequest);
        }
        const normalizedUsername = userData.username.toLowerCase().trim();
        const encryptedPassword = (0, encryption_helper_1.encrypt)(userData.password);
        const existingUser = await prisma_clients_1.prisma.user.findUnique({
            where: { username: normalizedUsername },
        });
        if (existingUser) {
            throw new error_utils_1.ApiError("User already exists", axios_1.HttpStatusCode.Conflict);
        }
        // Get the default "user" role
        const userRole = await prisma_clients_1.prisma.role.findUnique({
            where: { name: "user" },
        });
        // If role doesn't exist, throw error - roles must be seeded first
        if (!userRole) {
            throw new error_utils_1.ApiError("System error: User role not found. Please run database seeding first.", axios_1.HttpStatusCode.InternalServerError);
        }
        const newUser = await prisma_clients_1.prisma.user.create({
            data: {
                username: normalizedUsername,
                password: encryptedPassword,
                name: userData.name,
                role_id: userRole.id, // Assign default "user" role
            },
        });
        return {
            success: true,
            message: "User registered successfully",
        };
    }
    catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};
exports.SRegisterUser = SRegisterUser;
const SLoginUser = async (userData) => {
    try {
        if (!userData.username || !userData.password) {
            throw new error_utils_1.ApiError("Username and password are required", axios_1.HttpStatusCode.BadRequest);
        }
        const normalizedUsername = userData.username.toLowerCase().trim();
        const user = await prisma_clients_1.prisma.user.findUnique({
            where: { username: normalizedUsername },
            include: { role: true }, // Include role information
        });
        if (!user) {
            throw new error_utils_1.ApiError("User not found", axios_1.HttpStatusCode.NotFound);
        }
        if ((0, encryption_helper_1.decrypt)(user.password) !== userData.password) {
            throw new error_utils_1.ApiError("Invalid password", axios_1.HttpStatusCode.Unauthorized);
        }
        const tokenPayload = {
            userId: user.id.toString(),
            role: user.role.name, // Include role in token
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(tokenPayload);
        return {
            accessToken,
            name: user.name || "",
            username: userData.username,
            role: user.role.name,
        };
    }
    catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};
exports.SLoginUser = SLoginUser;
//# sourceMappingURL=auth.service.js.map