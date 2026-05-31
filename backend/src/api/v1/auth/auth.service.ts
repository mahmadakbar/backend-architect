import { prisma } from "@prisma/prisma.clients";
import { ApiError } from "@utils/error.utils";
import { decrypt, encrypt } from "@utils/helper/encryption.helper";
import { generateAccessToken } from "@utils/jwt.util";
import { HttpStatusCode } from "axios";
import logger from "@configs/logger.configs";

export const SRegisterUser = async (userData: {
  username: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    if (!userData.username || !userData.password || !userData.name) {
      throw new ApiError("All fields are required", HttpStatusCode.BadRequest);
    }

    const normalizedUsername = userData.username.toLowerCase().trim();
    const encryptedPassword = encrypt(userData.password);

    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      throw new ApiError("User already exists", HttpStatusCode.Conflict);
    }

    // Get the default "user" role
    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    // If role doesn't exist, throw error - roles must be seeded first
    if (!userRole) {
      throw new ApiError(
        "System error: User role not found. Please run database seeding first.",
        HttpStatusCode.InternalServerError,
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: encryptedPassword,
        name: userData.name,
        role_id: userRole.id, // Assign default "user" role
      },
    });

    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    logger.error(error, "Registration error");
    throw error;
  }
};

export const SLoginUser = async (userData: {
  username: string;
  password: string;
}): Promise<{
  accessToken: string;
  name?: string;
  username?: string;
  role?: string;
}> => {
  try {
    if (!userData.username || !userData.password) {
      throw new ApiError(
        "Username and password are required",
        HttpStatusCode.BadRequest,
      );
    }

    const normalizedUsername = userData.username.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      include: { role: true }, // Include role information
    });

    if (!user) {
      throw new ApiError("User not found", HttpStatusCode.NotFound);
    }

    if (decrypt(user.password) !== userData.password) {
      throw new ApiError("Invalid password", HttpStatusCode.Unauthorized);
    }

    const tokenPayload = {
      userId: user.id.toString(),
      role: user.role.name, // Include role in token
    };

    const accessToken = generateAccessToken(tokenPayload);

    return {
      accessToken,
      name: user.name || "",
      username: userData.username,
      role: user.role.name,
    };
  } catch (error) {
    logger.error(error, "Login error");
    throw error;
  }
};
