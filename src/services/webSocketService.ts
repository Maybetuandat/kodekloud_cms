// src/services/webSocketService.ts
import {
  TestMessage,
  TestConnectionStatus,
  TestExecutionStatus,
} from "@/types/labTest";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: TestMessage) => void> = new Set();
  private connectionStatusHandlers: Set<
    (status: TestConnectionStatus) => void
  > = new Set();
  private executionStatusHandlers: Set<(status: TestExecutionStatus) => void> =
    new Set();

  constructor(private websocketUrl: string) {}

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notifyConnectionStatus("connecting");
      this.notifyExecutionStatus("waiting_connection");

      this.ws = new WebSocket(this.websocketUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected to:", this.websocketUrl);
        this.notifyConnectionStatus("connected");
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.notifyConnectionStatus("error");
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        this.notifyConnectionStatus("disconnected");
      };
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 WebSocket message received:", data);

      const message: TestMessage = {
        type: data.type || "log",
        message: data.message || "",
        data: data.data || null,
        timestamp: data.timestamp || Date.now(),
      };

      this.notifyMessage(message);
      this.updateExecutionStatus(message);
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
    }
  }

  /**
   * Update execution status based on message type
   */
  private updateExecutionStatus(message: TestMessage) {
    // Map backend message types to execution status
    switch (message.type) {
      case "connection":
      case "start":
      case "info":
        this.notifyExecutionStatus("running");
        break;
      case "success":
        // Check if this is final success message
        if (
          message.message.includes("ready") ||
          message.message.includes("completed")
        ) {
          this.notifyExecutionStatus("completed");
        } else {
          this.notifyExecutionStatus("running");
        }
        break;
      case "error":
        this.notifyExecutionStatus("failed");
        break;
      case "warning":
        // Warning doesn't change execution status
        break;
    }
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: (message: TestMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatus(handler: (status: TestConnectionStatus) => void) {
    this.connectionStatusHandlers.add(handler);
    return () => this.connectionStatusHandlers.delete(handler);
  }

  /**
   * Subscribe to execution status changes
   */
  onExecutionStatus(handler: (status: TestExecutionStatus) => void) {
    this.executionStatusHandlers.add(handler);
    return () => this.executionStatusHandlers.delete(handler);
  }

  /**
   * Notify message handlers
   */
  private notifyMessage(message: TestMessage) {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  /**
   * Notify connection status handlers
   */
  private notifyConnectionStatus(status: TestConnectionStatus) {
    this.connectionStatusHandlers.forEach((handler) => handler(status));
  }

  /**
   * Notify execution status handlers
   */
  private notifyExecutionStatus(status: TestExecutionStatus) {
    this.executionStatusHandlers.forEach((handler) => handler(status));
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyConnectionStatus("disconnected");
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
