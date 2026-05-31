import { SRegisterUser, SLoginUser } from "@api/v1/auth/auth.service";
import { prisma } from "@prisma/prisma.clients";
import { ApiError } from "@utils/error.utils";
import { HttpStatusCode } from "axios";
import * as encryptionHelper from "@utils/helper/encryption.helper";
import * as jwtUtil from "@utils/jwt.util";

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
      (encryptionHelper.encrypt as jest.Mock).mockReturnValue(
        "encrypted_password",
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await SRegisterUser(mockUserData);

      // Assert
      expect(result).toEqual({
        success: true,
        message: "User registered successfully",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: "user" },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
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
      await expect(SRegisterUser(incompleteData)).rejects.toThrow(ApiError);
    });

    it("should throw error if user already exists", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(SRegisterUser(mockUserData)).rejects.toThrow(
        "User already exists",
      );
    });

    it("should throw error if user role is not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SRegisterUser(mockUserData)).rejects.toThrow(
        "System error: User role not found",
      );
    });

    it("should normalize username to lowercase", async () => {
      // Arrange
      const upperCaseData = { ...mockUserData, username: "TESTUSER" };
      (encryptionHelper.encrypt as jest.Mock).mockReturnValue(
        "encrypted_password",
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await SRegisterUser(upperCaseData);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (encryptionHelper.decrypt as jest.Mock).mockReturnValue("password123");
      (jwtUtil.generateAccessToken as jest.Mock).mockReturnValue(
        "mock_jwt_token",
      );

      // Act
      const result = await SLoginUser(mockLoginData);

      // Assert
      expect(result).toEqual({
        accessToken: "mock_jwt_token",
        name: "Test User",
        username: "testuser",
        role: "user",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
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
      await expect(SLoginUser(incompleteData)).rejects.toThrow(
        "Username and password are required",
      );
    });

    it("should throw error if user is not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SLoginUser(mockLoginData)).rejects.toThrow("User not found");
    });

    it("should throw error if password is invalid", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (encryptionHelper.decrypt as jest.Mock).mockReturnValue("wrong_password");

      // Act & Assert
      await expect(SLoginUser(mockLoginData)).rejects.toThrow(
        "Invalid password",
      );
    });

    it("should normalize username to lowercase during login", async () => {
      // Arrange
      const upperCaseLogin = { ...mockLoginData, username: "TESTUSER" };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (encryptionHelper.decrypt as jest.Mock).mockReturnValue("password123");
      (jwtUtil.generateAccessToken as jest.Mock).mockReturnValue(
        "mock_jwt_token",
      );

      // Act
      await SLoginUser(upperCaseLogin);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: "testuser" },
        include: { role: true },
      });
    });
  });
});
