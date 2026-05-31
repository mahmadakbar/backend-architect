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
