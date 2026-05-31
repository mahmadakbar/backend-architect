"use server";

import { IApiRes } from "@interfaces/api";
import network from "@services/network";
import { deleteSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";

export const submitLogout = async () => {
  try {
    // Delete session cookie
    await deleteSession();

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    return errorMessage(error);
  }
};
