import { prisma } from "@prisma/prisma.clients";
import logger from "@configs/logger.configs";

export const SCreateTask = async (
  userId: number,
  title: string,
  description: string,
  status?: boolean,
  deadline?: Date,
): Promise<{ success: boolean; message: string }> => {
  try {
    logger.info({ userId, description }, `Creating task for user ID ${userId}`);

    if (!userId || isNaN(Number(userId))) {
      throw new Error("Invalid user ID");
    }

    const userExists = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    logger.info(
      { userId, userExists },
      `Checking if user with ID ${userId} exists`,
    );

    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    await prisma.task.create({
      data: {
        title,
        description,
        status: status || false,
        deadline: deadline || null,
        created_by: userExists.username,
        user_id: Number(userId),
      },
    });

    return {
      success: true,
      message: "Task created successfully",
    };
  } catch (error: any) {
    logger.error(error, "Task creation error");
    throw error;
  }
};

export const SUpdateTask = async (
  userId: number,
  taskId: number,
  userRole: string,
  title?: string,
  description?: string,
  status?: boolean,
  deadline?: Date,
): Promise<{ success: boolean; message: string }> => {
  try {
    const userExists = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    logger.info(
      { userId, userExists },
      `Checking if user with ID ${userId} exists`,
    );

    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const taskExists = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    if (!taskExists) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Role-based permission check
    // Superadmin can edit any task
    // Regular user can only edit their own tasks
    if (userRole !== "superadmin" && taskExists.user_id !== Number(userId)) {
      throw new Error(`You don't have permission to update this task`);
    }

    await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        title: title || taskExists.title,
        description: description || taskExists.description,
        status: status !== undefined ? status : taskExists.status,
        deadline: deadline || taskExists.deadline,
      },
    });

    return {
      success: true,
      message: "Task updated successfully",
    };
  } catch (error: any) {
    logger.error(error, "Task update error");
    throw error;
  }
};

export const SDeleteTask = async (
  taskId: number,
  userId: number,
  userRole: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!taskId || isNaN(Number(taskId))) {
      throw new Error("Invalid task ID");
    }

    const taskExists = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    logger.info(
      { taskId, taskExists },
      `Checking if task with ID ${taskId} exists`,
    );

    if (!taskExists) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Role-based permission check
    // Superadmin can delete any task
    // Regular user can only delete their own tasks
    if (userRole !== "superadmin" && taskExists.user_id !== Number(userId)) {
      throw new Error(`You don't have permission to delete this task`);
    }

    await prisma.task.delete({
      where: { id: Number(taskId) },
    });

    return {
      success: true,
      message: "Task deleted successfully",
    };
  } catch (error: any) {
    logger.error(error, "Task deletion error");
    throw error;
  }
};

export const SGetTasksByUserId = async (
  userId: number,
  userRole: string,
): Promise<IResponseTask[]> => {
  try {
    if (!userId || isNaN(Number(userId))) {
      throw new Error("Invalid user ID");
    }

    const userExists = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    logger.info(
      { userId, userExists },
      `Checking if user with ID ${userId} exists`,
    );

    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Role-based filtering
    // Superadmin and Admin can see all tasks
    // Regular user can only see their own tasks
    let tasks;
    if (userRole === "superadmin" || userRole === "admin") {
      tasks = await prisma.task.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { user_id: Number(userId) },
        orderBy: { createdAt: "desc" },
      });
    }

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt?.toISOString() || "",
      deadline: task.deadline?.toISOString() || null,
    }));
  } catch (error: any) {
    logger.error(error, "Task retrieval error");
    throw error;
  }
};
