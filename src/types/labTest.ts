

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
  success: boolean;
  message: string;
  labId: string;
  labName: string;
  podName: string;
  namespace: string;
  websocket: WebSocketConnectionInfo;
  executionStarted: boolean;
  createdAt: string;
  error?: string; // For error cases
}

export interface LabTestStatusResponse {
  labId: string;
  podName: string;
  status: string;
  timestamp: string;
}

export interface StopTestResponse {
  success: boolean;
  message: string;
  labId: string;
  podName: string;
  stoppedAt: string;
}

export interface TerminalMessage {
  type: string;
  message: string;
  data?: any;
  timestamp: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'unknown';