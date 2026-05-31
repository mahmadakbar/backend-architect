import { getListTask } from "@services/api/tasks";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetListTask = () => {
  return useQuery({
    queryKey: ["list-task"],
    queryFn: async () => {
      const response = await getListTask();

      if ("error" in response) {
        console.log("Login error:", response.error);

        toast.error(response.error.message);
        throw new Error(response.error.message);
      }

      return response.data;
    },
  });
};
