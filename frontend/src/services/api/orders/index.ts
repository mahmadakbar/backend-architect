"use server";

import { IApiRes, IApiResPaginatedOrders, IApiResOrder } from "@interfaces/api";
import network from "@services/network";
import { getSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";
import {
  pollQueueStatus,
  QueueStatus,
  QueueResponse,
} from "@services/api/queue";

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

export const createOrder = async (
  data: ICreateOrderPayload,
  onProgress?: (status: QueueStatus) => void,
) => {
  try {
    const session = await getSession();
    const response = await network.post<
      IApiRes<IApiResOrder> | (IApiRes<null> & QueueResponse)
    >("/v1/orders", data, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    // Check if response is 202 (queued)
    if (response.status === 202) {
      const queueData = response.data as IApiRes<null> & QueueResponse;
      const queueToken = queueData.queue.token;

      console.log(
        `Order queued - Position: ${queueData.queue.position}/${queueData.queue.total}, Estimated wait: ${queueData.queue.estimatedWait}s`,
      );

      // Poll for completion
      const queueStatus = await pollQueueStatus(queueToken, onProgress);

      if (queueStatus.status === "COMPLETED") {
        // Return the order result from queue
        return queueStatus.result as IApiRes<IApiResOrder>;
      } else if (queueStatus.status === "FAILED") {
        throw new Error(queueStatus.error || "Order processing failed");
      }
    }

    // Direct response (status 200/201)
    return response.data as IApiRes<IApiResOrder>;
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

export const updateOrderStatus = async (
  id: number,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED",
) => {
  try {
    const session = await getSession();
    const response = await network.patch<IApiRes<IApiResOrder>>(
      `/v1/orders/${id}/status`,
      { status },
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
