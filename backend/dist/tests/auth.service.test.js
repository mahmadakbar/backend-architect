"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("@api/v1/auth/auth.service");
const prisma_clients_1 = require("@prisma/prisma.clients");
const error_utils_1 = require("@utils/error.utils");
const encryptionHelper = __importStar(require("@utils/helper/encryption.helper"));
const jwtUtil = __importStar(require("@utils/jwt.util"));
// Mock the dependencies
jest.mock("@prisma/prisma.clients");
jest.mock("@utils/helper/encryption.helper");
jest.mock("@utils/jwt.util");
describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("SRegisterUser", () => {
        const mockUserData = {
            username: "testuser",
            password: "password123",
            name: "Test User",
        };
        const mockRole = {
            id: 1,
            name: "user",
            description: "Regular user",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const mockUser = {
            id: 1,
            username: "testuser",
            password: "encrypted_password",
            name: "Test User",
            role_id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        it("should successfully register a new user", async () => {
            // Arrange
            encryptionHelper.encrypt.mockReturnValue("encrypted_password");
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(mockRole);
            prisma_clients_1.prisma.user.create.mockResolvedValue(mockUser);
            // Act
            const result = await (0, auth_service_1.SRegisterUser)(mockUserData);
            // Assert
            expect(result).toEqual({
                success: true,
                message: "User registered successfully",
            });
            expect(prisma_clients_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: "testuser" },
            });
            expect(prisma_clients_1.prisma.role.findUnique).toHaveBeenCalledWith({
                where: { name: "user" },
            });
            expect(prisma_clients_1.prisma.user.create).toHaveBeenCalledWith({
                data: {
                    username: "testuser",
                    password: "encrypted_password",
                    name: "Test User",
                    role_id: 1,
                },
            });
        });
        it("should throw error if required fields are missing", async () => {
            // Arrange
            const incompleteData = { username: "test", password: "", name: "Test" };
            // Act & Assert
            await expect((0, auth_service_1.SRegisterUser)(incompleteData)).rejects.toThrow(error_utils_1.ApiError);
        });
        it("should throw error if user already exists", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            // Act & Assert
            await expect((0, auth_service_1.SRegisterUser)(mockUserData)).rejects.toThrow("User already exists");
        });
        it("should throw error if user role is not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, auth_service_1.SRegisterUser)(mockUserData)).rejects.toThrow("System error: User role not found");
        });
        it("should normalize username to lowercase", async () => {
            // Arrange
            const upperCaseData = { ...mockUserData, username: "TESTUSER" };
            encryptionHelper.encrypt.mockReturnValue("encrypted_password");
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            prisma_clients_1.prisma.role.findUnique.mockResolvedValue(mockRole);
            prisma_clients_1.prisma.user.create.mockResolvedValue(mockUser);
            // Act
            await (0, auth_service_1.SRegisterUser)(upperCaseData);
            // Assert
            expect(prisma_clients_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: "testuser" },
            });
        });
    });
    describe("SLoginUser", () => {
        const mockLoginData = {
            username: "testuser",
            password: "password123",
        };
        const mockRole = {
            id: 1,
            name: "user",
            description: "Regular user",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const mockUser = {
            id: 1,
            username: "testuser",
            password: "encrypted_password",
            name: "Test User",
            role_id: 1,
            role: mockRole,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        it("should successfully login with valid credentials", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            encryptionHelper.decrypt.mockReturnValue("password123");
            jwtUtil.generateAccessToken.mockReturnValue("mock_jwt_token");
            // Act
            const result = await (0, auth_service_1.SLoginUser)(mockLoginData);
            // Assert
            expect(result).toEqual({
                accessToken: "mock_jwt_token",
                name: "Test User",
                username: "testuser",
                role: "user",
            });
            expect(prisma_clients_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: "testuser" },
                include: { role: true },
            });
            expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
                userId: "1",
                role: "user",
            });
        });
        it("should throw error if username or password is missing", async () => {
            // Arrange
            const incompleteData = { username: "", password: "test" };
            // Act & Assert
            await expect((0, auth_service_1.SLoginUser)(incompleteData)).rejects.toThrow("Username and password are required");
        });
        it("should throw error if user is not found", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(null);
            // Act & Assert
            await expect((0, auth_service_1.SLoginUser)(mockLoginData)).rejects.toThrow("User not found");
        });
        it("should throw error if password is invalid", async () => {
            // Arrange
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            encryptionHelper.decrypt.mockReturnValue("wrong_password");
            // Act & Assert
            await expect((0, auth_service_1.SLoginUser)(mockLoginData)).rejects.toThrow("Invalid password");
        });
        it("should normalize username to lowercase during login", async () => {
            // Arrange
            const upperCaseLogin = { ...mockLoginData, username: "TESTUSER" };
            prisma_clients_1.prisma.user.findUnique.mockResolvedValue(mockUser);
            encryptionHelper.decrypt.mockReturnValue("password123");
            jwtUtil.generateAccessToken.mockReturnValue("mock_jwt_token");
            // Act
            await (0, auth_service_1.SLoginUser)(upperCaseLogin);
            // Assert
            expect(prisma_clients_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: "testuser" },
                include: { role: true },
            });
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map