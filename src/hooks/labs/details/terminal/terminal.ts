import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TerminalService, 
  TerminalMessage, 
  ConnectionStatus, 
  ExecutionStatus,
  TerminalConfig 
} from '@/services/terminalService';

interface UseTerminalOptions {
  websocketUrl: string;
  autoConnect?: boolean;
  isPaused?: boolean;
  maxMessages?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseTerminalReturn {
  messages: TerminalMessage[];
  connectionStatus: ConnectionStatus;
  executionStatus: ExecutionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearMessages: () => void;
  isConnected: boolean;
  messageCount: number;
  lastMessage: TerminalMessage | null;
}

export const useTerminal = (options: UseTerminalOptions): UseTerminalReturn => {
  const {
    websocketUrl,
    autoConnect = false,
    isPaused = false,
    maxMessages = 1000,
    reconnectAttempts = 3,
    reconnectDelay = 3000
  } = options;

  // State
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  
  // Refs
  const terminalServiceRef = useRef<TerminalService | null>(null);
  const lastMessageRef = useRef<TerminalMessage | null>(null);

  // Initialize terminal service
  useEffect(() => {
    const config: TerminalConfig = {
      websocketUrl,
      autoConnect,
      isPaused,
      reconnectAttempts,
      reconnectDelay
    };

    terminalServiceRef.current = new TerminalService(config);

    // Set up event handlers
    const unsubscribeMessage = terminalServiceRef.current.onMessage((message) => {
      lastMessageRef.current = message;
      setMessages(prev => {
        const newMessages = [...prev, message];
        // Keep only the last maxMessages
        if (newMessages.length > maxMessages) {
          return newMessages.slice(-maxMessages);
        }
        return newMessages;
      });
    });

    const unsubscribeStatus = terminalServiceRef.current.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeExecution = terminalServiceRef.current.onExecutionChange((status) => {
      setExecutionStatus(status);
    });

    // Auto-connect if enabled
    if (autoConnect) {
      terminalServiceRef.current.connect().catch(error => {
        console.error('Auto-connect failed:', error);
      });
    }

    // Cleanup
    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      unsubscribeExecution();
      terminalServiceRef.current?.disconnect();
    };
  }, [websocketUrl, autoConnect, maxMessages, reconnectAttempts, reconnectDelay]);

  // Update pause state
  useEffect(() => {
    if (terminalServiceRef.current) {
      terminalServiceRef.current.updateConfig({ isPaused });
    }
  }, [isPaused]);

  // Connect function
  const connect = useCallback(async () => {
    if (terminalServiceRef.current) {
      try {
        await terminalServiceRef.current.connect();
      } catch (error) {
        console.error('Connection failed:', error);
        throw error;
      }
    }
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (terminalServiceRef.current) {
      terminalServiceRef.current.disconnect();
    }
  }, []);

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
    lastMessageRef.current = null;
  }, []);

  // Computed values
  const isConnected = terminalServiceRef.current?.isConnected() ?? false;
  const messageCount = messages.length;
  const lastMessage = lastMessageRef.current;

  return {
    messages,
    connectionStatus,
    executionStatus,
    connect,
    disconnect,
    clearMessages,
    isConnected,
    messageCount,
    lastMessage
  };
};