"use client";

import { getSession } from "@services/session";
import { IApiResLogin } from "@interfaces/api";
import { useQuery } from "@tanstack/react-query";

export const useGetSession = () => {
  return useQuery<IApiResLogin | null>({
    queryKey: ["session"],
    queryFn: async () => {
      const session = await getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
