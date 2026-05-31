import { ApiError } from "@utils/error.utils";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of role names that are allowed to access the route
 */
export const MCheckRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.role) {
      return next(new ApiError("Unauthorized: No role found", 401));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new ApiError(
          `Forbidden: ${user.role} role does not have permission to access this resource`,
          403,
        ),
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is superadmin
 */
export const MIsSuperAdmin = MCheckRole(["superadmin"]);

/**
 * Middleware to check if user is superadmin or admin
 */
export const MIsAdminOrAbove = MCheckRole(["superadmin", "admin"]);
