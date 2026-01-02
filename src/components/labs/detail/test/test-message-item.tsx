import { TestMessage } from "@/types/labTest";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Terminal,
  Sparkles,
  Link,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestMessageItemProps {
  message: TestMessage;
}

export function TestMessageItem({ message }: TestMessageItemProps) {
  const getIcon = () => {
    switch (message.type) {
      // Success states
      case "success":
      case "step_success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;

      // Setup complete
      case "setup_complete":
        return <PartyPopper className="h-4 w-4 text-emerald-400" />;

      // Connection
      case "connection":
        return <Link className="h-4 w-4 text-cyan-400" />;

      // Error states
      case "error":
      case "step_error":
      case "step_failed":
        return <XCircle className="h-4 w-4 text-red-400" />;

      // Warning
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;

      // Start/Running states
      case "start":
        return <Sparkles className="h-4 w-4 text-purple-400" />;

      case "step_start":
        return <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />;

      // Info
      case "step":
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />;

      default:
        return <Terminal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      // Success states
      case "success":
      case "step_success":
      case "setup_complete":
        return "text-emerald-400";

      // Connection
      case "connection":
        return "text-cyan-400";

      // Error states
      case "error":
      case "step_error":
      case "step_failed":
        return "text-red-400";

      // Warning
      case "warning":
        return "text-yellow-400";

      // Start states
      case "start":
        return "text-purple-400 font-bold";

      case "step_start":
        return "text-violet-400";

      // Info
      case "step":
      case "info":
        return "text-blue-400";

      default:
        return "text-gray-400";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", { hour12: false });
  };

  return (
    <div className="flex gap-3 px-4 py-2 font-mono text-sm">
      <div className="flex-shrink-0 text-slate-500 min-w-[80px]">
        {formatTimestamp(message.timestamp)}
      </div>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <span className={cn("break-words", getTextColor())}>
          {message.message}
        </span>
        {message.data && (
          <pre className="mt-2 text-xs text-gray-400 pl-4 border-l-2 border-slate-700">
            {JSON.stringify(message.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
