import {
  SGetAllUsers,
  SChangeUserRole,
  SGetAllRoles,
} from "@api/v1/users/users.service";
import { prisma } from "@prisma/prisma.clients";
import { ApiError } from "@utils/error.utils";

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
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await SGetAllUsers();

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
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: {
          role: true,
        },
      });
    });

    it("should not return password field", async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await SGetAllUsers();

      // Assert
      expect(result[0]).not.toHaveProperty("password");
      expect(result[1]).not.toHaveProperty("password");
    });

    it("should return empty array if no users exist", async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await SGetAllUsers();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      // Arrange
      (prisma.user.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection error"),
      );

      // Act & Assert
      await expect(SGetAllUsers()).rejects.toThrow("Database connection error");
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockAdminRole);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        role_id: 2,
      });

      // Act
      const result = await SChangeUserRole(1, 2);

      // Assert
      expect(result).toEqual({
        success: true,
        message: "User role updated to admin",
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { role_id: 2 },
      });
    });

    it("should throw error if user is not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SChangeUserRole(999, 2)).rejects.toThrow("User not found");
    });

    it("should throw error if role is not found", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SChangeUserRole(1, 999)).rejects.toThrow("Role not found");
    });

    it("should verify user exists before checking role", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SChangeUserRole(1, 2)).rejects.toThrow(ApiError);
      expect(prisma.role.findUnique).not.toHaveBeenCalled();
    });

    it("should handle database update errors", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockAdminRole);
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error("Database update failed"),
      );

      // Act & Assert
      await expect(SChangeUserRole(1, 2)).rejects.toThrow(
        "Database update failed",
      );
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
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      // Act
      const result = await SGetAllRoles();

      // Assert
      expect(result).toEqual(mockRoles);
      expect(result).toHaveLength(3);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
        },
      });
    });

    it("should only return id and name fields", async () => {
      // Arrange
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      // Act
      const result = await SGetAllRoles();

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
      (prisma.role.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await SGetAllRoles();

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      // Arrange
      (prisma.role.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection error"),
      );

      // Act & Assert
      await expect(SGetAllRoles()).rejects.toThrow("Database connection error");
    });
  });
});
