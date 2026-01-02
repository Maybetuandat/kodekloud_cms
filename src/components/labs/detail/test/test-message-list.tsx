// src/components/labs/detail/test/test-message-list.tsx
import { useEffect, useRef } from "react";
import { TestMessage } from "@/types/labTest";
import {
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Loader2,
  Link,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestMessageListProps {
  messages: TestMessage[];
}

export function TestMessageList({ messages }: TestMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      // Success states
      case "success":
      case "step_success":
        return (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        );

      // Setup complete
      case "setup_complete":
        return (
          <PartyPopper className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        );

      // Error states
      case "error":
      case "step_error":
      case "step_failed":
        return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;

      // Warning
      case "warning":
        return (
          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
        );

      // Connection
      case "connection":
        return <Link className="h-4 w-4 text-cyan-500 flex-shrink-0" />;

      // Start states
      case "start":
        return <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />;

      case "step_start":
        return (
          <Loader2 className="h-4 w-4 text-violet-500 flex-shrink-0 animate-spin" />
        );

      // Info
      case "info":
        return <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />;

      default:
        return <Terminal className="h-4 w-4 text-slate-400 flex-shrink-0" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      // Success states
      case "success":
      case "step_success":
      case "setup_complete":
        return "text-emerald-400";

      // Error states
      case "error":
      case "step_error":
      case "step_failed":
        return "text-red-400";

      // Warning
      case "warning":
        return "text-yellow-400";

      // Connection
      case "connection":
        return "text-cyan-400";

      // Start states
      case "start":
        return "text-purple-400";

      case "step_start":
        return "text-violet-400";

      // Info
      case "info":
        return "text-blue-400";

      default:
        return "text-slate-300";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-500" />
          <p className="text-sm text-slate-400">Đang chờ messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2 font-mono text-sm">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 py-2 px-3 rounded-md transition-colors",
            "hover:bg-slate-700/50"
          )}
        >
          {getMessageIcon(message.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">
                {formatTimestamp(message.timestamp)}
              </span>
              <span
                className={cn("break-words", getMessageColor(message.type))}
              >
                {message.message}
              </span>
            </div>
            {message.data && Object.keys(message.data).length > 0 && (
              <pre className="mt-2 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
                {JSON.stringify(message.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
