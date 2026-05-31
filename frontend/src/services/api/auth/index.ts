"use server";

import {
  IApiBodyLogin,
  IApiBodyRegister,
  IApiRes,
  IApiResLogin,
} from "@interfaces/api";
import network from "@services/network";
import { createSession } from "@services/session";
import { env } from "@utils/environment";
import { errorMessage } from "@utils/messages/errorMessage";
import { redirect } from "next/navigation";

export const submitRegister = async (body: IApiBodyRegister) => {
  try {
    const response = await network.post<IApiRes<null>>(
      "/v1/auth/register",
      body,
    );

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const submitLogin = async (body: IApiBodyLogin) => {
  try {
    const response = await network.post<IApiRes<IApiResLogin>>(
      "/v1/auth/login",
      body,
    );

    // Store the access token session cookie
    await createSession(response.data.data);

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
