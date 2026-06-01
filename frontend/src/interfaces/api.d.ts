export type IApiRes<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type IApiError<T = unknown> = {
  success: boolean;
  error: {
    message: string;
    statusCode: number;
    data?: T;
  };
};

export interface IApiBodyRegister {
  username: string;
  password: string;
  name: string;
}

export interface IApiBodyLogin {
  username: string;
  password: string;
}

export interface IApiResLogin {
  accessToken: string;
  name: string;
  username: string;
  role: string; // superadmin | admin | user
}

export interface IApiResTasks {
  id: number;
  title: string;
  description: string;
  status: boolean;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResProduct {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  image: string | null;
  category: string | null;
  status: number; // 0: deleted, 1: active, 2: inactive
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface IApiResPaginatedProducts {
  products: IApiResProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IApiResOrder {
  id: number;
  code: string;
  user_id: number;
  totalAmount: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string | null;
  cancelledAt: string | null;
  orderItems: IApiResOrderItem[];
  user?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface IApiResOrderItem {
  id: number;
  code: string;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  createdAt: string;
  product?: IApiResProduct;
}

export interface IApiResPaginatedOrders {
  orders: IApiResOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ICartItem {
  product: IApiResProduct;
  quantity: number;
}
