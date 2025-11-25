export interface WebSocketConnectionInfo {
  url: string;
  endpoint: string;
  podName: string;
  connectionParams: {
    podName: string;
    type: string;
  };
  messageTypes: string[];
  instructions: {
    connect: string;
    note: string;
    autoFilter: string;
  };
  sampleMessage: {
    type: string;
    message: string;
    data: any;
    timestamp: number;
  };
}

export interface LabTestResponse {
  testId: string;
  labId: number;
  testVmName: string;
  status: string;
  websocketUrl: string;
  connectionInfo: WebSocketConnectionInfo;
}

export interface LabTestStatusResponse {
  testId: string;
  labId: number;
  testVmName: string;
  status: string;
  websocketUrl?: string;
}

export interface TestMessage {
  type: string;
  message: string;
  data?: any;
  timestamp: number;
}

export type TestConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type TestExecutionStatus =
  | "idle"
  | "waiting_connection"
  | "running"
  | "completed"
  | "failed";
