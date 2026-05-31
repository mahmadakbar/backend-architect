import { IApiBodyLogin, IApiBodyRegister } from "@interfaces/api";
import { submitLogin, submitRegister } from "@services/api/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubmitRegister = () => {
  return useMutation({
    mutationKey: ["submit-register"],
    mutationFn: async (body: IApiBodyRegister) => {
      const response = await submitRegister(body);

      if ("error" in response) {
        console.log("Registration error:", response.error);

        toast.error(response.error.message);
        throw new Error(response.error.message);
      }

      return response;
    },
  });
};

export const useSubmitLogin = () => {
  return useMutation({
    mutationKey: ["submit-login"],
    mutationFn: async (body: IApiBodyLogin) => {
      const response = await submitLogin(body);

      if ("error" in response) {
        console.log("Login error:", response.error);

        toast.error(response.error.message);
        throw new Error(response.error.message);
      }

      return response;
    },
  });
};
