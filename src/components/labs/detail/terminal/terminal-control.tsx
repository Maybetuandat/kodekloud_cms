import React from 'react';
import { Play, Pause, Square, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface TerminalControlsProps {
  isPaused: boolean;
  isScrollLocked: boolean;
  onTogglePause: () => void;
  onToggleScrollLock: () => void;
  onClearLogs: () => void;
  onExportLogs: () => void;
}

export const TerminalControls: React.FC<TerminalControlsProps> = ({
  isPaused,
  isScrollLocked,
  onTogglePause,
  onToggleScrollLock,
  onClearLogs,
  onExportLogs,
}) => {
  return (
    <div className="flex-shrink-0 px-6">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Điều khiển Terminal</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePause}
                className="flex items-center gap-1"
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleScrollLock}
                className="flex items-center gap-1"
              >
                {isScrollLocked ? '🔒' : '🔓'} Auto Scroll
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLogs}
                className="flex items-center gap-1"
              >
                <Square className="h-3 w-3" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportLogs}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};