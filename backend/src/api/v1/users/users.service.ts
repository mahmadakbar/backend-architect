import { prisma } from "@prisma/prisma.clients";
import { ApiError } from "@utils/error.utils";
import { HttpStatusCode } from "axios";
import logger from "@configs/logger.configs";

/**
 * Get all users (superadmin only)
 */
export const SGetAllUsers = async (): Promise<any[]> => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    logger.error(error, "Get all users error");
    throw error;
  }
};

/**
 * Change user role (superadmin only)
 */
export const SChangeUserRole = async (
  userId: number,
  newRoleId: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", HttpStatusCode.NotFound);
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: newRoleId },
    });

    if (!role) {
      throw new ApiError("Role not found", HttpStatusCode.NotFound);
    }

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role_id: newRoleId },
    });

    return {
      success: true,
      message: `User role updated to ${role.name}`,
    };
  } catch (error) {
    logger.error(error, "Change user role error");
    throw error;
  }
};

/**
 * Get all available roles
 */
export const SGetAllRoles = async (): Promise<any[]> => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return roles;
  } catch (error) {
    logger.error(error, "Get all roles error");
    throw error;
  }
};
