import {
  IAddTaskPayload,
  submitAddTask,
  submitDeleteTask,
  submitUpdateTask,
} from "@services/api/tasks";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubmitAddTask = () => {
  return useMutation({
    mutationKey: ["submit-add-task"],
    mutationFn: async (data: IAddTaskPayload) => {
      const response = await submitAddTask(data);

      if ("error" in response) {
        console.log("Add task error:", response.error);

        toast.error(response.error.message);
        throw new Error(response.error.message);
      }

      return response;
    },
  });
};

export const useSubmitDeleteTask = () => {
  return useMutation({
    mutationKey: ["submit-delete-task"],
    mutationFn: async (taskId: string) => {
      // Implement the delete task API call here
      const response = await submitDeleteTask(taskId);
      if ("error" in response) {
        console.log("Delete task error:", response.error);
        toast.error(response.error.message);
        throw new Error(response.error.message);
      }
      return response;
    },
  });
};

export const useSubmitUpdateTask = () => {
  return useMutation({
    mutationKey: ["submit-update-task"],
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: IAddTaskPayload;
    }) => {
      // Implement the update task API call here
      const response = await submitUpdateTask(taskId, data);
      if ("error" in response) {
        console.log("Update task error:", response.error);
        toast.error(response.error.message);
        throw new Error(response.error.message);
      }
      return response;
    },
  });
};
