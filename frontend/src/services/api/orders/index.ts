"use server";

import { IApiRes, IApiResPaginatedOrders, IApiResOrder } from "@interfaces/api";
import network from "@services/network";
import { getSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";

export type IOrderFilter = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "status" | "totalAmount" | "code";
  sortOrder?: "asc" | "desc";
};

export type ICreateOrderPayload = {
  items: {
    product_id: number;
    quantity: number;
  }[];
};

export const getOrderHistory = async (filters?: IOrderFilter) => {
  try {
    const session = await getSession();
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `/v1/orders/history?${queryString}`
      : "/v1/orders/history";

    const response = await network.get<IApiRes<IApiResPaginatedOrders>>(url, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const getOrderById = async (id: number) => {
  try {
    const session = await getSession();
    const response = await network.get<IApiRes<IApiResOrder>>(
      `/v1/orders/${id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const createOrder = async (data: ICreateOrderPayload) => {
  try {
    const session = await getSession();
    const response = await network.post<IApiRes<IApiResOrder>>(
      "/v1/orders",
      data,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const cancelOrder = async (id: number) => {
  try {
    const session = await getSession();
    const response = await network.patch<IApiRes<IApiResOrder>>(
      `/v1/orders/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
