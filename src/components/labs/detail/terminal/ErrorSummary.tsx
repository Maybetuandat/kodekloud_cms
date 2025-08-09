import React, { useMemo } from 'react';
import { AlertTriangle, Bug, Terminal, Lightbulb, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TerminalMessage } from '@/services/terminalService';

interface LogMessage {
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  code: string;
  message: string;
  timestamp: number;
  color: string;
}

interface ErrorSummaryProps {
  messages: TerminalMessage[];
  className?: string;
}

interface ErrorGroup {
  stepOrder?: number;
  stepTitle?: string;
  failedCommand?: string;
  errorPatterns: string[];
  stderrLines: string[];
  suggestions: string[];
  exceptionDetails?: {
    type: string;
    message: string;
    cause?: string;
    stackTrace: string[];
  };
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ messages, className = '' }) => {
  const errorAnalysis = useMemo(() => {
    const enhancedLogs = messages.filter(msg => 
      msg.type === 'log' && msg.data && 'level' in msg.data
    ).map(msg => ({
      ...msg,
      logData: msg.data as LogMessage
    }));

    const errorGroups: ErrorGroup[] = [];
    let currentGroup: ErrorGroup | null = null;

    enhancedLogs.forEach(msg => {
      const { logData } = msg;

      switch (logData.code) {
        case 'STEP_FAILED':
          // Start new error group
          const stepMatch = msg.message.match(/Step (\d+) failed: (.+)/);
          currentGroup = {
            stepOrder: stepMatch ? parseInt(stepMatch[1]) : undefined,
            stepTitle: stepMatch ? stepMatch[2] : 'Unknown step',
            errorPatterns: [],
            stderrLines: [],
            suggestions: []
          };
          errorGroups.push(currentGroup);
          break;

        case 'FAILED_COMMAND':
          if (currentGroup) {
            currentGroup.failedCommand = msg.message.replace('📋 Failed command: ', '');
          }
          break;

        case 'ERROR_PATTERN':
          if (currentGroup) {
            currentGroup.errorPatterns.push(msg.message);
          }
          break;

        case 'STDERR_LINE':
          if (currentGroup) {
            currentGroup.stderrLines.push(msg.message.replace('  ', ''));
          }
          break;

        case 'SUGGESTION_1':
        case 'SUGGESTION_2':
        case 'SUGGESTION_3':
        case 'SUGGESTION_4':
        case 'SUGGESTION_TIMEOUT':
        case 'SUGGESTION_RETRY':
        case 'MANUAL_DEBUG':
          if (currentGroup) {
            currentGroup.suggestions.push(msg.message.replace(/^\s*\d+\.\s*/, ''));
          }
          break;

        case 'EXCEPTION_TYPE':
        case 'EXCEPTION_MESSAGE':
        case 'EXCEPTION_CAUSE':
        case 'STACK_LINE':
          if (currentGroup) {
            if (!currentGroup.exceptionDetails) {
              currentGroup.exceptionDetails = {
                type: '',
                message: '',
                stackTrace: []
              };
            }

            if (logData.code === 'EXCEPTION_TYPE') {
              currentGroup.exceptionDetails.type = msg.message.replace('  Type: ', '');
            } else if (logData.code === 'EXCEPTION_MESSAGE') {
              currentGroup.exceptionDetails.message = msg.message.replace('  Message: ', '');
            } else if (logData.code === 'EXCEPTION_CAUSE') {
              currentGroup.exceptionDetails.cause = msg.message.replace('  Cause: ', '');
            } else if (logData.code === 'STACK_LINE') {
              currentGroup.exceptionDetails.stackTrace.push(msg.message.replace('    ', ''));
            }
          }
          break;
      }
    });

    return {
      errorGroups,
      totalErrors: errorGroups.length,
      hasErrors: errorGroups.length > 0
    };
  }, [messages]);

  if (!errorAnalysis.hasErrors) {
    return null;
  }

  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Error Summary ({errorAnalysis.totalErrors} errors detected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorAnalysis.errorGroups.map((group, index) => (
          <ErrorGroupCard key={index} group={group} index={index} />
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                General Debugging Tips:
              </h4>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• Check the terminal logs above for the complete error output</li>
                <li>• Verify that all prerequisites are installed before running the command</li>
                <li>• Test the failed command manually in the pod for more details</li>
                <li>• Check container resource limits (CPU, memory, disk space)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ErrorGroupCard: React.FC<{ group: ErrorGroup; index: number }> = ({ group, index }) => {
  const [isOpen, setIsOpen] = React.useState(index === 0); // Open first error by default

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-red-200 dark:border-red-700 rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium text-red-800 dark:text-red-200">
                  Step {group.stepOrder}: {group.stepTitle}
                </div>
                {group.errorPatterns.length > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {group.errorPatterns.length} error pattern(s) detected
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {group.exceptionDetails && (
                <Badge variant="destructive" className="text-xs">
                  Exception
                </Badge>
              )}
              {group.errorPatterns.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  Pattern
                </Badge>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 border-t border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10">
            {/* Failed Command */}
            {group.failedCommand && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Failed Command:
                </h4>
                <code className="block p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-800 dark:text-red-200 text-sm font-mono">
                  {group.failedCommand}
                </code>
              </div>
            )}

            {/* Error Patterns */}
            {group.errorPatterns.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Detected Issues:
                </h4>
                <div className="space-y-2">
                  {group.errorPatterns.map((pattern, idx) => (
                    <div key={idx} className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-800 dark:text-orange-200 text-sm">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exception Details */}
            {group.exceptionDetails && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Exception Details:
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm">
                    <div><strong>Type:</strong> {group.exceptionDetails.type}</div>
                    <div><strong>Message:</strong> {group.exceptionDetails.message}</div>
                    {group.exceptionDetails.cause && (
                      <div><strong>Cause:</strong> {group.exceptionDetails.cause}</div>
                    )}
                  </div>
                  {group.exceptionDetails.stackTrace.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-red-700 dark:text-red-300 hover:text-red-800">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-900 text-gray-300 rounded text-xs overflow-x-auto">
                        {group.exceptionDetails.stackTrace.join('\n')}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Recent Error Output */}
            {group.stderrLines.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Recent Error Output:
                </h4>
                <div className="p-2 bg-gray-900 rounded text-red-400 text-sm font-mono max-h-32 overflow-y-auto">
                  {group.stderrLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {group.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Troubleshooting Suggestions:
                </h4>
                <div className="space-y-1">
                  {group.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-800 dark:text-blue-200 text-sm">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};