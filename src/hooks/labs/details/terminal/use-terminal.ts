import { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalService, TerminalMessage, ConnectionStatus, ExecutionStatus } from '@/services/terminalService';

interface UseTerminalOptions {
  websocketUrl: string;
  autoConnect?: boolean;
  isPaused?: boolean;
}

export const useTerminal = ({ websocketUrl, autoConnect = false, isPaused = false }: UseTerminalOptions) => {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('unknown');
  
  const terminalServiceRef = useRef<TerminalService | null>(null);

  // Initialize terminal service
  useEffect(() => {
    if (!websocketUrl) return;

    const service = new TerminalService(websocketUrl);
    terminalServiceRef.current = service;

    // Setup message handler
    const unsubscribeMessage = service.onMessage((message) => {
      if (!isPaused) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Setup status handler
    const unsubscribeStatus = service.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Setup execution handler
    const unsubscribeExecution = service.onExecutionChange((status) => {
      setExecutionStatus(status);
    });

    // Auto connect if enabled
    if (autoConnect) {
      service.connect().catch(console.error);
    }

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      unsubscribeExecution();
      service.disconnect();
    };
  }, [websocketUrl, autoConnect]);

  // Handle pause state changes
  useEffect(() => {
    // When unpausing, we might want to handle missed messages
    // For now, we just continue with new messages
  }, [isPaused]);

  const connect = useCallback(async () => {
    if (terminalServiceRef.current) {
      try {
        await terminalServiceRef.current.connect();
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (terminalServiceRef.current) {
      terminalServiceRef.current.disconnect();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const isConnected = useCallback(() => {
    return terminalServiceRef.current?.isConnected() ?? false;
  }, []);

  return {
    messages,
    connectionStatus,
    executionStatus,
    connect,
    disconnect,
    clearMessages,
    isConnected,
  };
};