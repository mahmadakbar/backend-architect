import { NextFunction, Request, Response } from "express";
import { SGetAllUsers, SChangeUserRole, SGetAllRoles } from "./users.service";
import { HttpStatusCode } from "axios";
import { handleError } from "@utils/error.utils";

/**
 * Get all users (superadmin only)
 */
export const CGetAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await SGetAllUsers();

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.InternalServerError);
  }
};

/**
 * Change user role (superadmin only)
 */
export const CChangeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(HttpStatusCode.BadRequest).json({
        success: false,
        message: "Role ID is required",
      });
    }

    const result = await SChangeUserRole(Number(userId), Number(roleId));

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.InternalServerError);
  }
};

/**
 * Get all available roles
 */
export const CGetAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await SGetAllRoles();

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.InternalServerError);
  }
};
