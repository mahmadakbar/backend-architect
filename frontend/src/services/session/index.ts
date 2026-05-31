"use server";
import { IApiResLogin } from "@interfaces/api";
import { cookies } from "next/headers";

export const createSession = async (session: IApiResLogin) => {
  const cookieStore = await cookies();
  const maxAge = new Date();
  maxAge.setDate(maxAge.getDate() + 30);
  cookieStore.set("session", JSON.stringify(session), {
    httpOnly: true,
    expires: maxAge,
  });
};

export const getSession = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return null;
  }
  return JSON.parse(session) as IApiResLogin;
};

export const getCookies = async (name: string) => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(name)?.value;

  if (!cookieValue) {
    return null;
  }

  return cookieValue;
};

export const deleteSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
};
