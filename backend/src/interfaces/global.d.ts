declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
      sanitizeQuery: () => void;
      sanitizeBody: () => void;
    }
  }

  export interface IGlobalErrorResponse {
    status: boolean;
    message: string;
    data: any;
  }

  export interface IUser {
    id: number;
    username?: string;
    name?: string;
    role?: string;
  }

  export interface IResponseTask {
    id: number;
    title: string;
    description: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    deadline: string | null;
  }
}

export {};
