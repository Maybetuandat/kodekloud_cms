import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus, ExecutionStatus } from '@/services/terminalService';

interface TerminalStatusBadgesProps {
  connectionStatus: ConnectionStatus;
  executionStatus: ExecutionStatus;
}

export const TerminalStatusBadges: React.FC<TerminalStatusBadgesProps> = ({
  connectionStatus,
  executionStatus,
}) => {
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Badge variant="secondary" className="animate-pulse">⏳ Đang kết nối</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500">🟢 Đã kết nối</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">🔴 Ngắt kết nối</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Lỗi kết nối</Badge>;
      default:
        return <Badge variant="secondary">❓ Không xác định</Badge>;
    }
  };

  const getExecutionBadge = () => {
    switch (executionStatus) {
      case 'running':
        return <Badge variant="default" className="bg-blue-500 animate-pulse">🏃 Đang chạy</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">✅ Hoàn thành</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Thất bại</Badge>;
      default:
        return <Badge variant="secondary">⏸️ Chờ</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getConnectionBadge()}
      {getExecutionBadge()}
    </div>
  );
};