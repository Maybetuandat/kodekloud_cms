import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TerminalMessage } from '@/services/terminalService';
import { TerminalMessageItem } from './terminal-message-item';


interface TerminalOutputProps {
  messages: TerminalMessage[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  messages,
  scrollRef,
}) => {
  return (
    <div className="flex-1 px-6 min-h-0">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-sm">
            Log Output ({messages.length} messages)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full w-full rounded-md border">
            <div className="p-4 bg-black/95 text-green-400 font-mono text-sm">
              {messages.length === 0 ? (
                <div className="text-gray-500 italic">
                  Đang chờ log messages...
                </div>
              ) : (
                messages.map((msg, index) => (
                  <TerminalMessageItem key={index} message={msg} />
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};