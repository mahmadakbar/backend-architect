"use server";

import network from "@services/network";
import { getSession } from "@services/session";

export interface QueueStatus {
  status: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED";
  position?: number;
  total?: number;
  estimatedWait?: number;
  result?: any;
  error?: string;
}

export interface QueueResponse {
  queue: {
    token: string;
    position: number;
    total: number;
    estimatedWait: number;
    statusUrl: string;
  };
}

/**
 * Poll queue status until completed or failed
 * @param token Queue token
 * @param onProgress Callback for progress updates
 * @param maxAttempts Maximum polling attempts (default 60 = 3 minutes)
 * @param intervalMs Polling interval in milliseconds (default 3000 = 3 seconds)
 */
export const pollQueueStatus = async (
  token: string,
  onProgress?: (status: QueueStatus) => void,
  maxAttempts: number = 60,
  intervalMs: number = 3000,
): Promise<QueueStatus> => {
  const session = await getSession();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await network.get<{
        success: boolean;
        data: QueueStatus;
      }>(`/v1/queue/status/${token}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const status = response.data.data;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check if completed or failed
      if (status.status === "COMPLETED" || status.status === "FAILED") {
        return status;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error("Queue polling error:", error);

      // If it's a 404, token expired
      if ((error as any)?.response?.status === 404) {
        throw new Error("Queue token expired or not found");
      }

      // Wait and retry on other errors
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  // Max attempts reached
  throw new Error("Queue processing timeout");
};

/**
 * Get queue depth
 */
export const getQueueDepth = async () => {
  try {
    const session = await getSession();
    const response = await network.get<{
      success: boolean;
      data: { depth: number };
    }>("/v1/queue/depth", {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    return response.data.data.depth;
  } catch (error) {
    console.error("Failed to get queue depth:", error);
    return 0;
  }
};
