import { NextFunction, Request, Response } from "express";
import {
  SCreateProduct,
  SUpdateProduct,
  SDeleteProduct,
  SGetProductById,
  SGetProducts,
  SSearchProducts,
} from "./products.service";
import { HttpStatusCode } from "axios";
import { handleError } from "@utils/error.utils";

export const CCreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;

    const result = await SCreateProduct(body);

    res.status(HttpStatusCode.Created).json({
      success: true,
      message: "Product created successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.BadRequest);
  }
};

export const CUpdateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body, params } = req;
    const productId = Number(params.productId);

    const result = await SUpdateProduct(productId, body);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Product updated successfully",
      data: result || {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;
    const productId = Number(params.productId);

    await SDeleteProduct(productId);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Product deleted successfully",
      data: {},
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CGetProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = req;
    const productId = Number(params.productId);

    const product = await SGetProductById(productId);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    handleError(error, next, HttpStatusCode.NotFound);
  }
};

export const CGetProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page,
      limit,
      search,
      category,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await SGetProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search as string,
      category: category as string,
      status: status ? Number(status) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as
        | "date"
        | "status"
        | "category"
        | "name"
        | "price"
        | "code",
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products: result.products,
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

export const CSearchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search } = req.query;
    const { page, limit, category } = req.query;

    if (!search) {
      return res.status(HttpStatusCode.BadRequest).json({
        success: false,
        message: "Search term is required",
        data: {},
      });
    }

    const result = await SSearchProducts(search as string, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      category: category as string,
    });

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "Products search completed",
      data: {
        products: result.products,
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
