// Enhanced LogMessage interface matching backend
export interface LogMessage {
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  code: string;
  message: string;
  timestamp: number;
  color: string;
}

// Terminal message interface
export interface TerminalMessage {
  type: string;
  message: string;
  data?: LogMessage | any; // Can be LogMessage or any other data
  timestamp: number;
}

// Connection and execution status types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

// Terminal service configuration
export interface TerminalConfig {
  websocketUrl: string;
  autoConnect?: boolean;
  isPaused?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

// Terminal service class
export class TerminalService {
  private ws: WebSocket | null = null;
  private config: TerminalConfig;
  private messageHandlers = new Set<(message: TerminalMessage) => void>();
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();
  private executionHandlers = new Set<(status: ExecutionStatus) => void>();
  private reconnectAttempts = 0;
  private currentConnectionStatus: ConnectionStatus = 'disconnected';
  private currentExecutionStatus: ExecutionStatus = 'idle';

  constructor(config: TerminalConfig) {
    this.config = {
      reconnectAttempts: 3,
      reconnectDelay: 3000,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.notifyStatus('connecting');

      try {
        this.ws = new WebSocket(this.config.websocketUrl);

        this.ws.onopen = () => {
          console.log('Connected to WebSocket');
          this.reconnectAttempts = 0;
          this.notifyStatus('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          if (this.config.isPaused) return;

          try {
            const message: TerminalMessage = JSON.parse(event.data);
            
            // Track execution status based on log codes
            if (message.type === 'log' && message.data && 'code' in message.data) {
              const logData = message.data as LogMessage;
              this.updateExecutionStatus(logData.code);
            }
            
            this.notifyMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.notifyStatus('disconnected');
          this.ws = null;

          // Auto-reconnect if not a manual close
          if (event.code !== 1000 && this.reconnectAttempts < (this.config.reconnectAttempts || 3)) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.notifyStatus('error');
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        this.notifyStatus('error');
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectDelay);
  }

  private updateExecutionStatus(logCode: string) {
    switch (logCode) {
      case 'SETUP_START':
        this.notifyExecution('running');
        break;
      case 'SETUP_COMPLETE':
        this.notifyExecution('completed');
        break;
      case 'SETUP_PARTIAL':
      case 'EXECUTION_STOPPED':
      case 'ALL_ATTEMPTS_FAILED':
        this.notifyExecution('failed');
        break;
      case 'POD_NOT_READY':
      case 'SYSTEM_ERROR':
        this.notifyExecution('failed');
        break;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.notifyStatus('disconnected');
    this.notifyExecution('idle');
  }

  private notifyMessage(message: TerminalMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyStatus(status: ConnectionStatus) {
    this.currentConnectionStatus = status;
    this.statusHandlers.forEach(handler => handler(status));
  }

  private notifyExecution(status: ExecutionStatus) {
    this.currentExecutionStatus = status;
    this.executionHandlers.forEach(handler => handler(status));
  }

  // Event listeners
  onMessage(handler: (message: TerminalMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: (status: ConnectionStatus) => void) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  onExecutionChange(handler: (status: ExecutionStatus) => void) {
    this.executionHandlers.add(handler);
    return () => this.executionHandlers.delete(handler);
  }

  // Getters
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.currentConnectionStatus;
  }

  getExecutionStatus(): ExecutionStatus {
    return this.currentExecutionStatus;
  }

  // Update configuration
  updateConfig(newConfig: Partial<TerminalConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Utility function to export logs with enhanced formatting
export const exportLogs = (messages: TerminalMessage[], podName: string) => {
  const logContent = messages.map(msg => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
    
    // Enhanced log formatting
    if (msg.type === 'log' && msg.data && 'level' in msg.data) {
      const logData = msg.data as LogMessage;
      return `[${timestamp}] [${logData.level}] [${logData.code}] ${msg.message}`;
    }
    
    // Fallback formatting
    return `[${timestamp}] [${msg.type.toUpperCase()}] ${msg.message}`;
  }).join('\n');

  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lab-${podName}-logs-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to get log level color
export const getLogLevelColor = (level: string): string => {
  switch (level) {
    case 'ERROR': return '#dc3545';
    case 'SUCCESS': return '#28a745';
    case 'WARNING': return '#ffc107';
    case 'INFO': 
    default: return '#6c757d';
  }
};

// Helper function to format log message for display
export const formatLogMessage = (message: TerminalMessage): string => {
  if (message.type === 'log' && message.data && 'level' in message.data) {
    const logData = message.data as LogMessage;
    return `[${logData.level}] ${message.message}`;
  }
  return message.message;
};