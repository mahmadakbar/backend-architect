import { env } from "@configs";
import { Response } from "express";

// Helper function to set authentication cookies
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.BRANCH === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/", // Make cookie available for all paths
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.BRANCH === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Make cookie available for all paths
  });
};

// Helper function to clear authentication cookies
export const clearAuthCookies = (res: Response) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: env.BRANCH === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: env.BRANCH === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
};
