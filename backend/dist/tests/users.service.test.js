"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = require("@api/v1/users/users.service");
const prisma_clients_1 = require("@prisma/prisma.clients");
const error_utils_1 = require("@utils/error.utils");
// Mock Prisma
jest.mock("@prisma/prisma.clients");
describe("Users Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const mockRole = {
        id: 1,
        name: "user",
        description: "Regular user",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockAdminRole = {
        id: 2,
        name: "admin",
        description: "Administrator",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockUsers = [
        {
            id: 1,
            username: "user1",
            password: "encrypted_password1",
            name: "User One",
            role_id: 1,
            role: mockRole,
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-02"),
        },
        {
            id: 2,
            username: "user2",
            password: "encrypted_password2",
            name: "User Two",
            role_id: 1,
            role: mockRole,
            createdAt: new Date("2026-01-03"),
            updatedAt: new Date("2026-01-04"),
        },
    ];
    describe("SGetAllUsers", () => {
        it("should return all users with role information", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findMany.mockResolvedValue(mockUsers);
            // Act
            const result = await (0, users_service_1.SGetAllUsers)();
            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 1,
                username: "user1",
                name: "User One",
                createdAt: mockUsers[0].createdAt,
                updatedAt: mockUsers[0].updatedAt,
                role: {
                    id: 1,
                    name: "user",
                },
            });
            expect(prisma_clients_1.prisma.user.findMany).toHaveBeenCalledWith({
                include: {
                    role: true,
                },
            });
        });
        it("should not return password field", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findMany.mockResolvedValue(mockUsers);
            // Act
            const result = await (0, users_service_1.SGetAllUsers)();
            // Assert
            expect(result[0]).not.toHaveProperty("password");
            expect(result[1]).not.toHaveProperty("password");
        });
        it("should return empty array if no users exist", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findMany.mockResolvedValue([]);
            // Act
            const result = await (0, users_service_1.SGetAllUsers)();
            // Assert
            expect(result).toEqual([]);
        });
        it("should handle database errors", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findMany.mockRejectedValue(new Error("Database connection error"));
            // Act & Assert
            await expect((0, users_service_1.SGetAllUsers)()).rejects.toThrow("Database connection error");
        });
    });
    describe("SChangeUserRole", () => {
        const mockUser = {
            id: 1,
            username: "testuser",
            password: "encrypted_password",
            name: "Test User",
            role_id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        it("should successfully change user role", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(mockAdminRole);
            prisma_clients_1.prisma.user.update.mockResolvedValue({
                ...mockUser,
                role_id: 2,
            });
            // Act
            const result = await (0, users_service_1.SChangeUserRole)(1, 2);
            // Assert
            expect(result).toEqual({
                success: true,
                message: "User role updated to admin",
            });
            expect(prisma_clients_1.prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { role_id: 2 },
            });
        });
        it("should throw error if user is not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, users_service_1.SChangeUserRole)(999, 2)).rejects.toThrow("User not found");
        });
        it("should throw error if role is not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, users_service_1.SChangeUserRole)(1, 999)).rejects.toThrow("Role not found");
        });
        it("should verify user exists before checking role", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, users_service_1.SChangeUserRole)(1, 2)).rejects.toThrow(error_utils_1.ApiError);
            expect(prisma_clients_1.prisma.role.findUnique).not.toHaveBeenCalled();
        });
        it("should handle database update errors", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(mockAdminRole);
            prisma_clients_1.prisma.user.update.mockRejectedValue(new Error("Database update failed"));
            // Act & Assert
            await expect((0, users_service_1.SChangeUserRole)(1, 2)).rejects.toThrow("Database update failed");
        });
    });
    describe("SGetAllRoles", () => {
        const mockRoles = [
            { id: 1, name: "user" },
            { id: 2, name: "admin" },
            { id: 3, name: "superadmin" },
        ];
        it("should return all available roles", async () => {
            // Arrange
            prisma_clients_1.prisma.role.findMany.mockResolvedValue(mockRoles);
            // Act
            const result = await (0, users_service_1.SGetAllRoles)();
            // Assert
            expect(result).toEqual(mockRoles);
            expect(result).toHaveLength(3);
            expect(prisma_clients_1.prisma.role.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    name: true,
                },
            });
        });
        it("should only return id and name fields", async () => {
            // Arrange
            prisma_clients_1.prisma.role.findMany.mockResolvedValue(mockRoles);
            // Act
            const result = await (0, users_service_1.SGetAllRoles)();
            // Assert
            result.forEach((role) => {
                expect(Object.keys(role)).toEqual(["id", "name"]);
                expect(role).not.toHaveProperty("description");
                expect(role).not.toHaveProperty("createdAt");
                expect(role).not.toHaveProperty("updatedAt");
            });
        });
        it("should return empty array if no roles exist", async () => {
            // Arrange
            prisma_clients_1.prisma.role.findMany.mockResolvedValue([]);
            // Act
            const result = await (0, users_service_1.SGetAllRoles)();
            // Assert
            expect(result).toEqual([]);
        });
        it("should handle database errors", async () => {
            // Arrange
            prisma_clients_1.prisma.role.findMany.mockRejectedValue(new Error("Database connection error"));
            // Act & Assert
            await expect((0, users_service_1.SGetAllRoles)()).rejects.toThrow("Database connection error");
        });
    });
});
//# sourceMappingURL=users.service.test.js.map