import React, { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Terminal, Filter, Bug } from 'lucide-react';
import { TerminalMessage, LogMessage } from '@/services/terminalService';
import { TerminalMessageItem } from './terminal-message-item';
import { ErrorSummary } from './ErrorSummary';


interface TerminalOutputProps {
  messages: TerminalMessage[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

type LogFilter = 'all' | 'errors' | 'warnings' | 'success' | 'info';

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  messages,
  scrollRef,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'errors'>('logs');
  const [logFilter, setLogFilter] = useState<LogFilter>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const enhanced = messages.filter(msg => 
      msg.type === 'log' && msg.data && 'level' in msg.data
    );
    
    const levels = enhanced.reduce((acc, msg) => {
      const logData = msg.data as LogMessage;
      acc[logData.level] = (acc[logData.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasErrors = levels.ERROR > 0;
    const hasWarnings = levels.WARNING > 0;

    return {
      total: messages.length,
      enhanced: enhanced.length,
      legacy: messages.length - enhanced.length,
      levels,
      hasErrors,
      hasWarnings
    };
  }, [messages]);

  // Filter messages based on current filter
  const filteredMessages = useMemo(() => {
    if (logFilter === 'all') return messages;

    return messages.filter(msg => {
      if (msg.type === 'log' && msg.data && 'level' in msg.data) {
        const logData = msg.data as LogMessage;
        switch (logFilter) {
          case 'errors': return logData.level === 'ERROR';
          case 'warnings': return logData.level === 'WARNING';
          case 'success': return logData.level === 'SUCCESS';
          case 'info': return logData.level === 'INFO';
          default: return true;
        }
      }
      
      // Fallback for legacy messages
      switch (logFilter) {
        case 'errors': return msg.type === 'error' || msg.type === 'step_error' || msg.type === 'stderr';
        case 'warnings': return msg.type === 'warning';
        case 'success': return msg.type === 'success' || msg.type === 'step_success';
        case 'info': return msg.type === 'info' || msg.type === 'start' || msg.type === 'stdout';
        default: return true;
      }
    });
  }, [messages, logFilter]);

  return (
    <div className="flex-1 px-6 min-h-0">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Terminal Output ({stats.total} messages)
            </CardTitle>
            
            {/* Log level statistics */}
            <div className="flex items-center gap-2">
              {stats.levels.ERROR > 0 && (
                <Badge variant="destructive" className="text-xs">
                  ❌ {stats.levels.ERROR}
                </Badge>
              )}
              {stats.levels.WARNING > 0 && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  ⚠️ {stats.levels.WARNING}
                </Badge>
              )}
              {stats.levels.SUCCESS > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  ✅ {stats.levels.SUCCESS}
                </Badge>
              )}
              {stats.levels.INFO > 0 && (
                <Badge variant="secondary" className="text-xs">
                  ℹ️ {stats.levels.INFO}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Enhanced vs Legacy message info */}
          {stats.enhanced > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Enhanced: {stats.enhanced} | Legacy: {stats.legacy}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 p-0 min-h-0 flex flex-col">
          {/* Tabs for Logs vs Error Summary */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'logs' | 'errors')} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-2 border-b">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Terminal Logs
                  {stats.hasErrors && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      {stats.levels.ERROR}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="errors" className="flex items-center gap-2" disabled={!stats.hasErrors}>
                  <Bug className="w-4 h-4" />
                  Error Analysis
                  {stats.hasErrors && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      {stats.levels.ERROR}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Log Filter (only shown in logs tab) */}
              {activeTab === 'logs' && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex gap-1">
                    <Button
                      variant={logFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter('all')}
                      className="text-xs h-7"
                    >
                      All
                    </Button>
                    <Button
                      variant={logFilter === 'errors' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter('errors')}
                      className="text-xs h-7"
                      disabled={!stats.hasErrors}
                    >
                      Errors
                    </Button>
                    <Button
                      variant={logFilter === 'warnings' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter('warnings')}
                      className="text-xs h-7"
                      disabled={!stats.hasWarnings}
                    >
                      Warnings
                    </Button>
                    <Button
                      variant={logFilter === 'success' ? 'outline' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter('success')}
                      className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-50"
                      disabled={!stats.levels.SUCCESS}
                    >
                      Success
                    </Button>
                    <Button
                      variant={logFilter === 'info' ? 'outline' : 'outline'}
                      size="sm"
                      onClick={() => setLogFilter('info')}
                      className="text-xs h-7"
                      disabled={!stats.levels.INFO}
                    >
                      Info
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="logs" className="flex-1 m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-4 bg-black/95 text-green-400 font-mono text-sm min-h-full">
                  {filteredMessages.length === 0 ? (
                    <div className="text-gray-500 italic text-center py-8">
                      {logFilter === 'all' ? (
                        <>
                          <div className="mb-2">🔌 Terminal đã sẵn sàng</div>
                          <div className="text-xs">Đang chờ log messages từ server...</div>
                        </>
                      ) : (
                        <>
                          <div className="mb-2">🔍 Không có logs nào với filter "{logFilter}"</div>
                          <div className="text-xs">Thử thay đổi filter hoặc chờ thêm logs...</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Filter indicator */}
                      {logFilter !== 'all' && (
                        <div className="mb-4 p-2 bg-blue-900/30 border border-blue-700 rounded text-blue-300 text-sm">
                          <div className="flex items-center justify-between">
                            <span>📋 Showing {filteredMessages.length} of {messages.length} messages (filter: {logFilter})</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLogFilter('all')}
                              className="text-blue-300 hover:text-blue-100 h-6 px-2 text-xs"
                            >
                              Clear Filter
                            </Button>
                          </div>
                        </div>
                      )}

                      {filteredMessages.map((msg, index) => (
                        <TerminalMessageItem key={`${msg.timestamp}-${index}`} message={msg} />
                      ))}
                      
                      {/* Scroll anchor */}
                      <div ref={scrollRef} className="h-1" />
                      
                      {/* Terminal prompt indicator */}
                      <div className="mt-4 text-green-400 opacity-75">
                        <span className="animate-pulse">▋</span>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="errors" className="flex-1 m-0">
              <ScrollArea className="h-full w-full">
                <div className="p-4">
                  {stats.hasErrors ? (
                    <ErrorSummary messages={messages} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Terminal className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No Errors Detected
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        All setup steps are running smoothly. Check the Terminal Logs tab for detailed execution information.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};