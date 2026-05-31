import {
  SCreateTask,
  SUpdateTask,
  SDeleteTask,
  SGetTasksByUserId,
} from "@api/v1/tasks/tasks.service";
import { prisma } from "@prisma/prisma.clients";

// Mock Prisma
jest.mock("@prisma/prisma.clients");

describe("Tasks Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    username: "testuser",
    password: "encrypted_password",
    name: "Test User",
    role_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask = {
    id: 1,
    title: "Test Task",
    description: "Test Description",
    status: false,
    deadline: new Date("2026-12-31"),
    created_by: "testuser",
    user_id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("SCreateTask", () => {
    it("should successfully create a task", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      // Act
      const result = await SCreateTask(
        1,
        "Test Task",
        "Test Description",
        false,
        new Date("2026-12-31"),
      );

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Task created successfully",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.task.create).toHaveBeenCalled();
    });

    it("should throw error if user ID is invalid", async () => {
      // Act & Assert
      await expect(
        SCreateTask(NaN, "Test Task", "Test Description"),
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw error if user does not exist", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        SCreateTask(999, "Test Task", "Test Description"),
      ).rejects.toThrow("User with ID 999 not found");
    });

    it("should create task with default status false if not provided", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      // Act
      await SCreateTask(1, "Test Task", "Test Description");

      // Assert
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task",
          description: "Test Description",
          status: false,
          deadline: null,
          created_by: "testuser",
          user_id: 1,
        },
      });
    });
  });

  describe("SUpdateTask", () => {
    it("should successfully update a task by owner", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        title: "Updated Task",
      });

      // Act
      const result = await SUpdateTask(1, 1, "user", "Updated Task");

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Task updated successfully",
      });
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it("should allow superadmin to update any task", async () => {
      // Arrange
      const otherUserTask = { ...mockTask, user_id: 2 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(otherUserTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(otherUserTask);

      // Act
      const result = await SUpdateTask(1, 1, "superadmin", "Updated by admin");

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Task updated successfully",
      });
    });

    it("should throw error if regular user tries to update another user's task", async () => {
      // Arrange
      const otherUserTask = { ...mockTask, user_id: 2 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(otherUserTask);

      // Act & Assert
      await expect(SUpdateTask(1, 1, "user", "Updated Task")).rejects.toThrow(
        "You don't have permission to update this task",
      );
    });

    it("should throw error if task does not exist", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SUpdateTask(1, 999, "user", "Updated Task")).rejects.toThrow(
        "Task with ID 999 not found",
      );
    });

    it("should preserve existing values if not provided", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

      // Act
      await SUpdateTask(1, 1, "user");

      // Assert
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: mockTask.title,
          description: mockTask.description,
          status: mockTask.status,
          deadline: mockTask.deadline,
        },
      });
    });
  });

  describe("SDeleteTask", () => {
    it("should successfully delete a task by owner", async () => {
      // Arrange
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);

      // Act
      const result = await SDeleteTask(1, 1, "user");

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Task deleted successfully",
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should allow superadmin to delete any task", async () => {
      // Arrange
      const otherUserTask = { ...mockTask, user_id: 2 };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(otherUserTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(otherUserTask);

      // Act
      const result = await SDeleteTask(1, 1, "superadmin");

      // Assert
      expect(result).toEqual({
        success: true,
        message: "Task deleted successfully",
      });
    });

    it("should throw error if regular user tries to delete another user's task", async () => {
      // Arrange
      const otherUserTask = { ...mockTask, user_id: 2 };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(otherUserTask);

      // Act & Assert
      await expect(SDeleteTask(1, 1, "user")).rejects.toThrow(
        "You don't have permission to delete this task",
      );
    });

    it("should throw error if task ID is invalid", async () => {
      // Act & Assert
      await expect(SDeleteTask(NaN, 1, "user")).rejects.toThrow(
        "Invalid task ID",
      );
    });

    it("should throw error if task does not exist", async () => {
      // Arrange
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SDeleteTask(999, 1, "user")).rejects.toThrow(
        "Task with ID 999 not found",
      );
    });
  });

  describe("SGetTasksByUserId", () => {
    const mockTasks = [
      {
        id: 1,
        title: "Task 1",
        description: "Description 1",
        status: false,
        deadline: new Date("2026-12-31"),
        created_by: "testuser",
        user_id: 1,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
      },
      {
        id: 2,
        title: "Task 2",
        description: "Description 2",
        status: true,
        deadline: null,
        created_by: "testuser",
        user_id: 1,
        createdAt: new Date("2026-01-03"),
        updatedAt: new Date("2026-01-04"),
      },
    ];

    it("should return all tasks for regular user (own tasks only)", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await SGetTasksByUserId(1, "user");

      // Assert
      expect(result).toHaveLength(2);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return all tasks for superadmin", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await SGetTasksByUserId(1, "superadmin");

      // Assert
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return all tasks for admin", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Act
      const result = await SGetTasksByUserId(1, "admin");

      // Assert
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should throw error if user ID is invalid", async () => {
      // Act & Assert
      await expect(SGetTasksByUserId(NaN, "user")).rejects.toThrow(
        "Invalid user ID",
      );
    });

    it("should throw error if user does not exist", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(SGetTasksByUserId(999, "user")).rejects.toThrow(
        "User with ID 999 not found",
      );
    });

    it("should format task dates correctly", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTasks[0]]);

      // Act
      const result = await SGetTasksByUserId(1, "user");

      // Assert
      expect(result[0]).toHaveProperty("createdAt");
      expect(result[0]).toHaveProperty("updatedAt");
      expect(result[0]).toHaveProperty("deadline");
      expect(typeof result[0].createdAt).toBe("string");
    });
  });
});
