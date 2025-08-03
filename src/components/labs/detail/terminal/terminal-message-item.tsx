import React from 'react';
import { TerminalMessage } from '@/services/terminalService';

interface TerminalMessageItemProps {
  message: TerminalMessage;
}

export const TerminalMessageItem: React.FC<TerminalMessageItemProps> = ({ message }) => {
  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'start':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      case 'success':
      case 'step_success':
        return 'text-green-600 dark:text-green-400 font-semibold';
      case 'error':
      case 'step_error':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'step':
        return 'text-purple-600 dark:text-purple-400 font-semibold';
      case 'stdout':
        return 'text-gray-700 dark:text-gray-300 font-mono text-sm';
      case 'stderr':
        return 'text-red-500 dark:text-red-400 font-mono text-sm';
      case 'log':
        return 'text-gray-600 dark:text-gray-400 font-mono text-sm';
      case 'system':
        return 'text-blue-500 dark:text-blue-400 italic';
      case 'retry':
        return 'text-orange-600 dark:text-orange-400 font-semibold';
      case 'info':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'connection':
        return 'text-green-500 dark:text-green-400 italic';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="mb-1 break-words">
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-gray-500 flex-shrink-0 text-xs">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        <span className="text-blue-400 flex-shrink-0 min-w-[80px] text-xs">
          [{message.type.toUpperCase()}]
        </span>
        <span className={`${getMessageStyle(message.type)} flex-1 break-all`}>
          {message.message}
        </span>
      </div>
      {message.data && (
        <div className="mt-1 ml-2 text-gray-400 text-xs break-all">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(message.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};