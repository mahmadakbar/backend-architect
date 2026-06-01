import { io, Socket } from "socket.io-client";
import { axiosInstance } from "./network";

export interface QueueStatus {
  status: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED";
  position?: number;
  total?: number;
  estimatedWait?: number;
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QueueResponse {
  status: string;
  message: string;
  queueToken: string;
  position: number;
  total: number;
  estimatedWait: number;
  checkStatusUrl: string;
}

class QueueManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(status: QueueStatus) => void>> =
    new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.connect();
  }

  /**
   * Connect to Socket.IO server
   */
  private connect() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:3131";

    this.socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to queue server");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from queue server");
    });

    this.socket.on(
      "queue-update",
      (data: {
        queueToken: string;
        status: string;
        result?: any;
        error?: string;
      }) => {
        console.log("📩 Queue update received:", data);

        const listeners = this.listeners.get(data.queueToken);
        if (listeners) {
          const queueStatus: QueueStatus = {
            status: data.status as QueueStatus["status"],
            result: data.result,
            error: data.error,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          listeners.forEach((callback) => callback(queueStatus));

          // If completed or failed, clean up
          if (data.status === "COMPLETED" || data.status === "FAILED") {
            this.stopWatching(data.queueToken);
          }
        }
      },
    );
  }

  /**
   * Start watching a queue token
   */
  watchQueue(
    queueToken: string,
    callback: (status: QueueStatus) => void,
    pollingInterval: number = 2000,
  ): void {
    // Add callback to listeners
    if (!this.listeners.has(queueToken)) {
      this.listeners.set(queueToken, new Set());
    }
    this.listeners.get(queueToken)!.add(callback);

    // Join Socket.IO room
    if (this.socket?.connected) {
      this.socket.emit("join-queue", queueToken);
    }

    // Start polling as fallback
    this.startPolling(queueToken, callback, pollingInterval);
  }

  /**
   * Stop watching a queue token
   */
  stopWatching(queueToken: string): void {
    // Remove from listeners
    this.listeners.delete(queueToken);

    // Leave Socket.IO room
    if (this.socket?.connected) {
      this.socket.emit("leave-queue", queueToken);
    }

    // Stop polling
    this.stopPolling(queueToken);
  }

  /**
   * Start polling for queue status
   */
  private startPolling(
    queueToken: string,
    callback: (status: QueueStatus) => void,
    interval: number,
  ): void {
    // Clear existing interval
    this.stopPolling(queueToken);

    const intervalId = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/v1/queue/status/${queueToken}`,
        );

        if (response.data.success) {
          const status: QueueStatus = response.data.data;
          callback(status);

          // Stop polling if completed or failed
          if (status.status === "COMPLETED" || status.status === "FAILED") {
            this.stopWatching(queueToken);
          }
        }
      } catch (error: any) {
        console.error("Error polling queue status:", error);

        // If not found, stop polling
        if (error.response?.status === 404) {
          this.stopWatching(queueToken);
        }
      }
    }, interval);

    this.pollingIntervals.set(queueToken, intervalId);
  }

  /**
   * Stop polling for a queue token
   */
  private stopPolling(queueToken: string): void {
    const intervalId = this.pollingIntervals.get(queueToken);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(queueToken);
    }
  }

  /**
   * Check queue status once
   */
  async checkStatus(queueToken: string): Promise<QueueStatus | null> {
    try {
      const response = await axiosInstance.get(
        `/v1/queue/status/${queueToken}`,
      );

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Error checking queue status:", error);
      return null;
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    // Stop all polling
    this.pollingIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.pollingIntervals.clear();
    this.listeners.clear();

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const queueManager = new QueueManager();
