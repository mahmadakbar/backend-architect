import { IApiError } from "@interfaces/api";
import { env } from "@utils/environment";
import axios, { AxiosError, AxiosResponse } from "axios";

const network = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
    apikey: env.APIKEY,
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "x-frame-options": "SAMEORIGIN",
  },
});

// Response interceptor
network.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle 202 Accepted (queued requests) differently
    // We'll pass it through so the caller can handle it
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    console.log("Network errors:", JSON.stringify(response?.data, null, 2));

    if (response) {
      // Handle different status codes

      if (response?.data) {
        console.log(
          "Response status code:",
          (response.data as IApiError).error.message,
        );
        return Promise.reject(
          new Error((response.data as IApiError).error.message),
        );
      }
      switch (response.status) {
        case 401:
          return Promise.reject(new Error("Unauthorized access"));
        case 404:
          return Promise.reject(new Error("Resource not found"));
        case 500:
          return Promise.reject(new Error("Server error"));
        default:
          return Promise.reject(new Error(`Error: ${response.status}`));
      }
    } else if (error.request) {
      console.error("No response received", error.request);
    } else {
      console.error("Request setup error", error.message);
    }

    return Promise.reject(error);
  },
);

export default network;
export { network as axiosInstance };
