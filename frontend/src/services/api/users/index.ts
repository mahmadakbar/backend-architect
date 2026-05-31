"use server";

import { IApiRes } from "@interfaces/api";
import network from "@services/network";
import { errorMessage } from "@utils/messages/errorMessage";
import { getSession } from "@services/session";

interface IUser {
  id: number;
  username: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
  };
}

interface IRole {
  id: number;
  name: string;
}

export const getAllUsers = async () => {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await network.get<IApiRes<IUser[]>>("/v1/users", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const getAllRoles = async () => {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await network.get<IApiRes<IRole[]>>("/v1/users/roles", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const changeUserRole = async (userId: number, roleId: number) => {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await network.put<
      IApiRes<{ success: boolean; message: string }>
    >(
      `/v1/users/${userId}/role`,
      { roleId },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
