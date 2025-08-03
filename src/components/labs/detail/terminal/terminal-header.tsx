import React from 'react';
import { Terminal } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConnectionStatus, ExecutionStatus } from '@/services/terminalService';
import { TerminalStatusBadges } from './terminal-status-badge';


interface TerminalHeaderProps {
  labName: string;
  podName: string;
  connectionStatus: ConnectionStatus;
  executionStatus: ExecutionStatus;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  labName,
  podName,
  connectionStatus,
  executionStatus,
}) => {
  return (
    <div className="flex-shrink-0 p-6 pb-4 border-b">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Terminal - {labName}
              </DialogTitle>
              <DialogDescription className="text-left">
                Pod: {podName}
              </DialogDescription>
            </div>
          </div>
          <TerminalStatusBadges 
            connectionStatus={connectionStatus}
            executionStatus={executionStatus}
          />
        </div>
      </DialogHeader>
    </div>
  );
};