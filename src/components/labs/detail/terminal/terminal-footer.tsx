import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutionStatus } from '@/services/terminalService';

interface TerminalFooterProps {
  messageCount: number;
  executionStatus: ExecutionStatus;
  onClose: () => void;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({
  messageCount,
  executionStatus,
  onClose,
}) => {
  return (
    <div className="flex-shrink-0 p-6 pt-4 border-t">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total logs: {messageCount} | Status: {executionStatus}
        </div>
        <Button onClick={onClose} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Đóng Terminal
        </Button>
      </div>
    </div>
  );
};