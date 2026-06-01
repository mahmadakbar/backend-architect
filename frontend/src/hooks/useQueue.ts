"use client";

import { useState, useEffect, useCallback } from "react";
import { queueManager, QueueStatus } from "@/services/queue";

export interface QueueResponse {
  status: string;
  message: string;
  queueToken: string;
  position: number;
  total: number;
  estimatedWait: number;
  checkStatusUrl: string;
}

interface UseQueueResult {
  status: QueueStatus | null;
  isWatching: boolean;
  error: string | null;
  startWatching: (queueToken: string) => void;
  stopWatching: () => void;
}

/**
 * Hook to watch queue status for a queued request
 */
export function useQueue(): UseQueueResult {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const startWatching = useCallback((queueToken: string) => {
    setCurrentToken(queueToken);
    setIsWatching(true);
    setError(null);

    queueManager.watchQueue(queueToken, (newStatus) => {
      setStatus(newStatus);

      // If completed or failed, stop watching
      if (newStatus.status === "COMPLETED" || newStatus.status === "FAILED") {
        setIsWatching(false);
      }
    });
  }, []);

  const stopWatching = useCallback(() => {
    if (currentToken) {
      queueManager.stopWatching(currentToken);
      setIsWatching(false);
      setCurrentToken(null);
    }
  }, [currentToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentToken) {
        queueManager.stopWatching(currentToken);
      }
    };
  }, [currentToken]);

  return {
    status,
    isWatching,
    error,
    startWatching,
    stopWatching,
  };
}

/**
 * Hook to handle API calls that might return queue responses
 */
export function useQueuedRequest<T = any>() {
  const { status, isWatching, startWatching, stopWatching } = useQueue();
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status) {
      if (status.status === "COMPLETED") {
        setResult(status.result);
        setIsLoading(false);
      } else if (status.status === "FAILED") {
        setError(status.error || "Request failed");
        setIsLoading(false);
      }
    }
  }, [status]);

  const handleResponse = useCallback(
    async (response: any) => {
      // Check if response is a queue response (202)
      if (response.status === 202 && response.data.queueToken) {
        const queueData: QueueResponse = response.data;
        setIsLoading(true);
        startWatching(queueData.queueToken);
      } else {
        // Normal response
        setResult(response.data);
        setIsLoading(false);
      }
    },
    [startWatching],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    stopWatching();
  }, [stopWatching]);

  return {
    result,
    error,
    isLoading,
    isQueued: isWatching,
    queueStatus: status,
    handleResponse,
    reset,
  };
}
