import { useState, useCallback, useEffect, useRef } from "react";

import {
  TestMessage,
  TestConnectionStatus,
  TestExecutionStatus,
  LabTestResponse,
} from "@/types/labTest";
import { toast } from "sonner";
import { WebSocketService } from "@/services/webSocketService";
import { labService } from "@/services/labService";
import { authService } from "@/services/authService";

interface UseLabTestState {
  isLoading: boolean;
  error: string | null;
  testResponse: LabTestResponse | null;
  messages: TestMessage[];
  connectionStatus: TestConnectionStatus;
  executionStatus: TestExecutionStatus;
}

export const useLabTest = (labId: number) => {
  const [state, setState] = useState<UseLabTestState>({
    isLoading: false,
    error: null,
    testResponse: null,
    messages: [],
    connectionStatus: "idle",
    executionStatus: "idle",
  });

  const wsServiceRef = useRef<WebSocketService | null>(null);

  /**
   * Start test
   */
  const startTest = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [],
      connectionStatus: "idle",
      executionStatus: "idle",
    }));

    try {
      // 1. Call API to start test
      const response = await labService.startLabTest(labId);

      setState((prev) => ({
        ...prev,
        testResponse: response,
        isLoading: false,
      }));

      // 2. Connect to WebSocket with token
      await connectWebSocket(response.websocketUrl);

      toast.success("Test started successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start test";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        connectionStatus: "error",
      }));
      toast.error("Failed to start test", {
        description: errorMessage,
      });
    }
  }, [labId]);

  /**
   * Connect to WebSocket with authentication token
   */
  const connectWebSocket = useCallback(async (websocketUrl: string) => {
    try {
      // Get authentication token
      const token = authService.getAuthToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      // Append token to WebSocket URL
      const urlWithToken = `${websocketUrl}&token=${encodeURIComponent(token)}`;

      console.log("🔐 Connecting to WebSocket with token...");

      // Create WebSocket service
      const wsService = new WebSocketService(urlWithToken);
      wsServiceRef.current = wsService;

      // Subscribe to messages
      wsService.onMessage((message) => {
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
      });

      // Subscribe to connection status
      wsService.onConnectionStatus((status) => {
        setState((prev) => ({
          ...prev,
          connectionStatus: status,
        }));
      });

      // Subscribe to execution status
      wsService.onExecutionStatus((status) => {
        setState((prev) => ({
          ...prev,
          executionStatus: status,
        }));
      });

      // Connect
      await wsService.connect();
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
      setState((prev) => ({
        ...prev,
        connectionStatus: "error",
        error:
          err instanceof Error ? err.message : "Failed to connect to WebSocket",
      }));
    }
  }, []);

  /**
   * Stop test and disconnect WebSocket
   */
  const stopTest = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      wsServiceRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      connectionStatus: "disconnected",
      executionStatus: "idle",
    }));
  }, []);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
    }));
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    startTest,
    stopTest,
    clearMessages,
  };
};
