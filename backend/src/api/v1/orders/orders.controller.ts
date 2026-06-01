import { NextFunction, Request, Response } from "express";
import {
  SCreateOrder,
  SGetOrderById,
  SGetOrderHistory,
  SCancelOrder,
  SUpdateOrderStatus,
} from "./orders.service";
import { HttpStatusCode } from "axios";
import { handleError } from "@utils/error.utils";

export const CCreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body, user } = req;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const result = await SCreateOrder(Number(user.id), body);

    res.status(HttpStatusCode.Created).json({
      success: true,
      message: "Order created successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.BadRequest);
  }
};

export const CGetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params, user } = req;
    const orderId = Number(params.orderId);

    if (!user?.id || !user?.role) {
      throw new Error("User not authenticated");
    }

    const order = await SGetOrderById(orderId, Number(user.id), user.role);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CGetOrderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, query } = req;
    const {
      page,
      limit,
      status,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    if (!user?.id || !user?.role) {
      throw new Error("User not authenticated");
    }

    const result = await SGetOrderHistory(Number(user.id), user.role, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as "date" | "status" | "totalAmount" | "code",
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Order history retrieved successfully",
      data: {
        orders: result.orders,
        pagination: {
          total: result.metadata.totalData,
          page: result.metadata.page,
          limit: result.metadata.limit,
          totalPages: result.metadata.totalPages,
          hasNextPage: result.metadata.page < result.metadata.totalPages,
          hasPrevPage: result.metadata.page > 1,
        },
      },
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.InternalServerError);
  }
};

export const CCancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params, user } = req;
    const orderId = Number(params.orderId);

    if (!user?.id || !user?.role) {
      throw new Error("User not authenticated");
    }

    const result = await SCancelOrder(orderId, Number(user.id), user.role);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Order cancelled successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.BadRequest);
  }
};

export const CUpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params, body, user } = req;
    const orderId = Number(params.orderId);
    const { status } = body;

    if (!user?.id || !user?.role) {
      throw new Error("User not authenticated");
    }

    const result = await SUpdateOrderStatus(
      orderId,
      status,
      Number(user.id),
      user.role,
    );

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Order status updated successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.BadRequest);
  }
};
