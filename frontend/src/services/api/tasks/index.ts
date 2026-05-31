"use server";

import { IApiRes, IApiResTasks } from "@interfaces/api";
import network from "@services/network";
import { getSession } from "@services/session";
import { errorMessage } from "@utils/messages/errorMessage";

export type IAddTaskPayload = {
  title?: string;
  description?: string;
  status?: boolean;
  deadline?: string;
};

export const getListTask = async () => {
  try {
    const session = await getSession();
    const response = await network.get<IApiRes<IApiResTasks[]>>("/v1/tasks", {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const submitAddTask = async (data: IAddTaskPayload) => {
  try {
    const session = await getSession();
    const response = await network.post<IApiRes<null>>(
      "/v1/tasks",
      {
        title: data.title,
        description: data.description,
        status: data.status,
        deadline: data.deadline,
      },
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};

export const submitDeleteTask = async (taskId: string) => {
  try {
    const session = await getSession();
    const response = await network.delete<IApiRes<null>>(
      `/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
export const submitUpdateTask = async (
  taskId: string,
  data: IAddTaskPayload
) => {
  try {
    const session = await getSession();

    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      deadline: data.deadline,
    };

    console.log("=== API UPDATE TASK ===");
    console.log("Task ID:", taskId);
    console.log("Payload to API:", payload);
    console.log("=======================");

    const response = await network.post<IApiRes<null>>(
      `/v1/tasks/update/${taskId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return errorMessage(error);
  }
};
