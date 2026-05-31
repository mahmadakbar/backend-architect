import { env } from "@configs";
import jwt from "jsonwebtoken";
import logger from "@configs/logger.configs";

// Types for JWT payloads
export interface JwtPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  version: number;
}

/**
 * Generate an access token for a user
 * @param payload User information to encode in the token
 * @returns Signed JWT token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES.ACCESS,
    algorithm: "HS256",
  } as any);
};

/**
 * Generate a refresh token for a user
 * @param payload User information for the refresh token
 * @returns Signed refresh token
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(
    payload,
    env.JWT.REFRESH as string,
    {
      expiresIn: env.JWT.EXPIRES.REFRESH,
      algorithm: "HS256",
    } as any,
  );
};

/**
 * Verify an access token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT.SECRET || "") as JwtPayload;
    logger.info({ decoded, secret: env.JWT.SECRET }, "Decoded JWT RES");
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param token Refresh token to verify
 * @returns Decoded refresh token payload or null if invalid
 */
export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT.REFRESH || "") as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Decode a token without verification
 * @param token JWT token to decode
 * @returns Decoded token payload or null if invalid format
 */
export const decodeToken = <T>(token: string): T | null => {
  try {
    return jwt.decode(token) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Extract the token from the authorization header
 * @param authHeader Authorization header value
 * @returns Token without 'Bearer ' prefix or null if invalid format
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
