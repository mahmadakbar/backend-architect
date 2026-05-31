import { IApiError } from "@interfaces/api";
import { AxiosError } from "axios";

export const errorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      // redirect('/unauthorized')
    }

    console.error("API Error:", error);
    console.error("API Error Response:", error.response);

    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Something went wrong",
        statusCode: error.response?.status,
        data: error.response?.data?.data,
      },
    } as IApiError;
  }
  console.log("Unknown error type:", error);

  // Handle Error instances
  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong";

  return {
    success: false,
    error: {
      message: errorMessage,
      statusCode: 500,
    },
  } as IApiError;
};
