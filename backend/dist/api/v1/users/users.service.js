"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SGetAllRoles = exports.SChangeUserRole = exports.SGetAllUsers = void 0;
const prisma_clients_1 = require("@prisma/prisma.clients");
const error_utils_1 = require("@utils/error.utils");
const axios_1 = require("axios");
/**
 * Get all users (superadmin only)
 */
const SGetAllUsers = async () => {
    try {
        const users = await prisma_clients_1.prisma.user.findMany({
            include: {
                role: true,
            },
        });
        // Map to return only necessary fields
        return users.map((user) => ({
            id: user.id,
            username: user.username,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: {
                id: user.role.id,
                name: user.role.name,
            },
        }));
    }
    catch (error) {
        console.error("Get all users error:", error);
        throw error;
    }
};
exports.SGetAllUsers = SGetAllUsers;
/**
 * Change user role (superadmin only)
 */
const SChangeUserRole = async (userId, newRoleId) => {
    try {
        // Check if user exists
        const user = await prisma_clients_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new error_utils_1.ApiError("User not found", axios_1.HttpStatusCode.NotFound);
        }
        // Check if role exists
        const role = await prisma_clients_1.prisma.role.findUnique({
            where: { id: newRoleId },
        });
        if (!role) {
            throw new error_utils_1.ApiError("Role not found", axios_1.HttpStatusCode.NotFound);
        }
        // Update user role
        await prisma_clients_1.prisma.user.update({
            where: { id: userId },
            data: { role_id: newRoleId },
        });
        return {
            success: true,
            message: `User role updated to ${role.name}`,
        };
    }
    catch (error) {
        console.error("Change user role error:", error);
        throw error;
    }
};
exports.SChangeUserRole = SChangeUserRole;
/**
 * Get all available roles
 */
const SGetAllRoles = async () => {
    try {
        const roles = await prisma_clients_1.prisma.role.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        return roles;
    }
    catch (error) {
        console.error("Get all roles error:", error);
        throw error;
    }
};
exports.SGetAllRoles = SGetAllRoles;
//# sourceMappingURL=users.service.js.map