export interface TerminalMessage {
  type: string;
  message: string;
  data?: any;
  timestamp: number;
}
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'unknown';

export class TerminalService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: TerminalMessage) => void> = new Set();
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();
  private executionHandlers: Set<(status: ExecutionStatus) => void> = new Set();

  constructor(private websocketUrl: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notifyStatus('connecting');
      this.addMessage({
        type: 'system',
        message: ` Đang kết nối tới WebSocket...`,
        timestamp: Date.now()
      });

      // khoi tao websocket va message de hien thi len terminal 
      // resolve khi ket noi thanh cong
      // reject neu co loi xay ra

      this.ws = new WebSocket(this.websocketUrl);   // connect den socket server qua socketUrl 

      this.ws.onopen = () => {
        this.notifyStatus('connected');
        this.addMessage({
          type: 'system',
          message: ` Kết nối WebSocket thành công`,
          timestamp: Date.now()
        });
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyStatus('error');
        this.addMessage({
          type: 'error',
          message: ` Lỗi WebSocket connection`,
          timestamp: Date.now()
        });
        reject(error);
      };

      this.ws.onclose = (event) => {
        this.notifyStatus('disconnected');
        const reason = event.reason || 'Kết nối bị đóng';
        this.addMessage({
          type: 'system',
          message: ` WebSocket đã ngắt kết nối: ${reason}`,
          timestamp: Date.now()
        });
      };
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const message: TerminalMessage = {
        type: data.type || 'log',
        message: data.message || '',
        data: data.data || null,
        timestamp: data.timestamp || Date.now()
      };

      this.notifyMessage(message);
      this.updateExecutionStatus(message);

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.addMessage({
        type: 'error',
        message: ` Lỗi parse message: ${event.data}`,
        timestamp: Date.now()
      });
    }
  }

  private updateExecutionStatus(message: TerminalMessage) {
    if (message.type === 'success') {
      this.notifyExecution('completed');
    } else if (message.type === 'error' && message.message.includes('Stopping execution')) {
      this.notifyExecution('failed');
    } else if (message.type === 'start') {
      this.notifyExecution('running');
    }
  }

  private addMessage(message: TerminalMessage) {
    this.notifyMessage(message);
  }

  private notifyMessage(message: TerminalMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyStatus(status: ConnectionStatus) {
    this.statusHandlers.forEach(handler => handler(status));
  }

  private notifyExecution(status: ExecutionStatus) {
    this.executionHandlers.forEach(handler => handler(status));
  }

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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export utility functions
export const exportLogs = (messages: TerminalMessage[], podName: string) => {
  const logContent = messages.map(msg => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
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