"use server";

import {
  IApiRes,
  IApiResPaginatedProducts,
  IApiResProduct,
} from "@interfaces/api";
import network from "@services/network";
import { getSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";

export type IProductFilter = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: number;
  sortBy?: "date" | "name" | "price" | "code";
  sortOrder?: "asc" | "desc";
};

export type ICreateProductPayload = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  status?: number;
};

export type IUpdateProductPayload = Partial<ICreateProductPayload>;

export const getProducts = async (filters?: IProductFilter) => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status !== undefined)
      params.append("status", filters.status.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/v1/products?${queryString}` : "/v1/products";

    const response = await network.get<IApiRes<IApiResPaginatedProducts>>(url);
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const getProductById = async (id: number) => {
  try {
    const response = await network.get<IApiRes<IApiResProduct>>(
      `/v1/products/${id}`,
    );
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const createProduct = async (data: ICreateProductPayload) => {
  try {
    const session = await getSession();
    const response = await network.post<IApiRes<IApiResProduct>>(
      "/v1/products",
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

export const updateProduct = async (
  id: number,
  data: IUpdateProductPayload,
) => {
  try {
    const session = await getSession();
    const response = await network.put<IApiRes<IApiResProduct>>(
      `/v1/products/${id}`,
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

export const deleteProduct = async (id: number) => {
  try {
    const session = await getSession();
    const response = await network.delete<IApiRes<null>>(`/v1/products/${id}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
