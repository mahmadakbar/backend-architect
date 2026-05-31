import { NextFunction, Request, Response } from "express";
import {
  SCreateTask,
  SDeleteTask,
  SGetTasksByUserId,
  SUpdateTask,
} from "./tasks.service";
import { HttpStatusCode } from "axios";
import { handleError } from "@utils/error.utils";
import logger from "@configs/logger.configs";

export const CCreateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body, user } = req;
    const { title, description, status, deadline } = body;

    const result = await SCreateTask(
      Number(user?.id),
      title,
      description,
      status,
      deadline,
    );

    res.status(HttpStatusCode.Created).json({
      success: true,
      message: "Task created successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CUpdateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body, user, params } = req;
    const { title, description, status, deadline } = body;
    const taskId = Number(params.taskId);

    if (!user?.role) {
      throw new Error("Unauthorized: User role not found");
    }

    const result = await SUpdateTask(
      Number(user.id),
      taskId,
      user.role,
      title,
      description,
      status,
      deadline,
    );

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Task updated successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CDeleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, params } = req;

    if (!user?.role) {
      throw new Error("Unauthorized: User role not found");
    }

    const taskId = Number(params.taskId);
    const result = await SDeleteTask(taskId, Number(user.id), user.role);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Task deleted successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CGetAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;

    if (!user?.role) {
      throw new Error("Unauthorized: User role not found");
    }

    const tasks = await SGetTasksByUserId(Number(user.id), user.role);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    logger.error(error, "Error in CGetAllTasks");
    handleError(error, next, HttpStatusCode.NotFound);
  }
};
