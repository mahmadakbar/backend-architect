import { NextFunction, Request, Response } from "express";
import { SLoginUser, SRegisterUser } from "./auth.service";
import { handleError } from "@utils/error.utils";
import { HttpStatusCode } from "axios";
import logger from "@configs/logger.configs";

export const CRegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body: userData } = req;

    const result = await SRegisterUser(userData);

    res.status(HttpStatusCode.Created).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(error, "Error in CRegisterUser");
    handleError(error, next, HttpStatusCode.Conflict);
  }
};

export const CLoginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body: userData } = req;

    const result = await SLoginUser(userData);

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  } catch (error) {
    logger.error(error, "Error in CLoginUser");
    handleError(error, next, HttpStatusCode.Unauthorized);
  }
};
