"use server";

import { IApiBodyLogin, IApiRes, IApiResLogin } from "@interfaces/api";
import network from "@services/network";
import { createSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";
import { redirect } from "next/navigation";

export async function loginAction(body: IApiBodyLogin) {
  try {
    const response = await network.post<IApiRes<IApiResLogin>>(
      "/v1/auth/login",
      body,
    );

    // Store the access token session cookie
    await createSession(response.data.data);

    // Return success - we'll handle redirect on client
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = errorMessage(error);
    return {
      success: false,
      error: err.error,
    };
  }
}
