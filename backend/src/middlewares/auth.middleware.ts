import { ApiError } from "@utils/error.utils";
import { verifyAccessToken } from "@utils/jwt.util";
import { Request, Response, NextFunction } from "express";
import { prisma } from "@prisma/prisma.clients";

interface AuthRequest extends Request {
  user?: IUser;
}

const MAuthToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new ApiError("Not authorized, no token", 401));
  }
  try {
    const token = authorization.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (decoded === null) {
      return next(new ApiError("Not authorized, token invalid", 401));
    }

    // Fetch user with role information
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      include: { role: true },
    });

    if (!user) {
      return next(new ApiError("User not found", 401));
    }

    // Attach user with role to request object
    req.user = {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      role: user.role.name,
    };
    next();
  } catch (error) {
    // If access token is expired or invalid, could try to use refresh token here
    // or simply return 401 and let client handle refresh. For simplicity, returning 401.
    return next(new ApiError("Not authorized, token failed", 401));
  }
};

export default MAuthToken;
