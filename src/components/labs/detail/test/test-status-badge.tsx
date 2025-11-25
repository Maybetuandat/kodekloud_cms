import { Badge } from "@/components/ui/badge";
import { TestConnectionStatus, TestExecutionStatus } from "@/types/labTest";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

interface TestStatusBadgeProps {
  connectionStatus: TestConnectionStatus;
  executionStatus: TestExecutionStatus;
}

export function TestStatusBadge({
  connectionStatus,
  executionStatus,
}: TestStatusBadgeProps) {
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case "connecting":
        return (
          <Badge className="gap-1 bg-slate-700 border-slate-600 text-slate-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang kết nối...
          </Badge>
        );
      case "connected":
        return <Badge className="bg-green-600 text-white">Đã kết nối</Badge>;

      case "disconnected":
        return (
          <Badge className="gap-1 bg-slate-700 border-slate-600 text-slate-400">
            <WifiOff className="h-3 w-3" />
            Ngắt kết nối
          </Badge>
        );
      case "error":
        return (
          <Badge className="gap-1 bg-red-500/20 border-red-500/30 text-red-400">
            <XCircle className="h-3 w-3" />
            Lỗi kết nối
          </Badge>
        );
      default:
        return null;
    }
  };

  const getExecutionBadge = () => {
    switch (executionStatus) {
      case "waiting_connection":
        return (
          <Badge className="gap-1 bg-yellow-500/20 border-yellow-500/30 text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            Chờ kết nối
          </Badge>
        );
      case "running":
        return (
          <Badge className="gap-1 bg-blue-500/20 border-blue-500/30 text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang chạy
          </Badge>
        );
      case "completed":
        return <Badge className="bg-green-600 text-white">Hoàn thành</Badge>;

      case "failed":
        return (
          <Badge className="gap-1 bg-red-500/20 border-red-500/30 text-red-400">
            <XCircle className="h-3 w-3" />
            Thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2">
      {getConnectionBadge()}
      {getExecutionBadge()}
    </div>
  );
}
