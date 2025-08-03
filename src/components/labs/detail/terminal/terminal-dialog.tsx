
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";


import { exportLogs } from "@/services/terminalService";
import { useScrollToBottom } from "@/hooks/labs/details/terminal/scrollToBottom";
import { useTerminal } from "@/hooks/labs/details/terminal/terminal";
import { TerminalControls } from "./terminal-control";
import { TerminalFooter } from "./terminal-footer";
import { TerminalHeader } from "./terminal-header";
import { TerminalOutput } from "./terminal-output";



interface TerminalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websocketUrl: string;
  podName: string;
  labName: string;
  onClose?: () => void;
}

export function TerminalDialog({
  open,
  onOpenChange,
  websocketUrl,
  podName,
  labName,
  onClose,
}: TerminalDialogProps) {
  const { t } = useTranslation('common');
  
  // Local state for UI controls
  const [isScrollLocked, setIsScrollLocked] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Terminal connection and state management
  const {
    messages,
    connectionStatus,
    executionStatus,
    connect,
    disconnect,
    clearMessages,
  } = useTerminal({
    websocketUrl,
    autoConnect: open, // Auto connect when dialog opens
    isPaused,
  });

  // Auto scroll functionality
  const { scrollRef } = useScrollToBottom([messages], isScrollLocked);

  // Dialog close handler
  const handleClose = () => {
    disconnect();
    onOpenChange(false);
    onClose?.();
  };

  // Control handlers
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleToggleScrollLock = () => {
    setIsScrollLocked(!isScrollLocked);
  };

  const handleExportLogs = () => {
    exportLogs(messages, podName);
  };

  // Don't render if websocketUrl is not provided
  if (!websocketUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <TerminalHeader
          labName={labName}
          podName={podName}
          connectionStatus={connectionStatus}
          executionStatus={executionStatus}
        />

        <TerminalControls
          isPaused={isPaused}
          isScrollLocked={isScrollLocked}
          onTogglePause={handleTogglePause}
          onToggleScrollLock={handleToggleScrollLock}
          onClearLogs={clearMessages}
          onExportLogs={handleExportLogs}
        />

        <TerminalOutput
          messages={messages}
          scrollRef={scrollRef}
        />

        <TerminalFooter
          messageCount={messages.length}
          executionStatus={executionStatus}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

// Export all terminal components
export * from './terminal-header';
export * from './terminal-control';
export * from './terminal-output';
export * from './terminal-footer';
export * from './terminal-status-badge';
export * from './terminal-message-item';