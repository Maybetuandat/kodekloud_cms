import { TestMessage } from "@/types/labTest";
import { TestMessageItem } from "./test-message-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface TestMessageListProps {
  messages: TestMessage[];
}

export function TestMessageList({ messages }: TestMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800">
        <p className="text-sm text-slate-500 font-mono">
          💡 Chưa có logs. Đang khởi động test...
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-slate-800" ref={scrollAreaRef}>
      <div className="py-2">
        {messages.map((message, index) => (
          <TestMessageItem key={index} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
