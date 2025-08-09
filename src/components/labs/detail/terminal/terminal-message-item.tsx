import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Bug, Lightbulb, Terminal } from 'lucide-react';
import { TerminalMessage } from '@/services/terminalService';

interface LogMessage {
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  code: string;
  message: string;
  timestamp: number;
  color: string;
}

interface TerminalMessageItemProps {
  message: TerminalMessage;
}

export const TerminalMessageItem: React.FC<TerminalMessageItemProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isEnhancedLog = message.type === 'log' && message.data && typeof message.data === 'object' && 'level' in message.data;
  const logData = isEnhancedLog ? (message.data as LogMessage) : null;

  // Check if this is an error-related message
  const isErrorRelated = logData?.level === 'ERROR' || 
    ['STEP_FAILED', 'ERROR_ANALYSIS', 'EXCEPTION_DETAILS', 'STDERR_ANALYSIS'].includes(logData?.code || '');

  // Check if this is a troubleshooting message
  const isTroubleshooting = logData?.code?.startsWith('SUGGESTION_') || 
    logData?.code === 'TROUBLESHOOTING' || 
    logData?.code === 'MANUAL_DEBUG';

  // Check if this is stderr output
  const isStderrOutput = logData?.code === 'STDERR' || message.type === 'stderr';

  const getMessageStyle = (type: string, logData?: LogMessage | null) => {
    if (logData) {
      const baseStyle = 'font-mono text-sm';
      let fontWeight = 'font-normal';
      
      // Make error messages bold and larger
      if (logData.level === 'ERROR') {
        fontWeight = 'font-bold';
      }
      
      // Special styling for specific error codes
      if (logData.code === 'ERROR_ANALYSIS') {
        return `${baseStyle} ${fontWeight} text-red-400 dark:text-red-300 text-base border-l-4 border-red-500 pl-3 bg-red-50 dark:bg-red-900/20 py-1`;
      }
      
      if (logData.code === 'FAILED_COMMAND') {
        return `${baseStyle} ${fontWeight} text-red-300 dark:text-red-200 bg-red-900/30 px-2 py-1 rounded`;
      }
      
      if (isTroubleshooting) {
        return `${baseStyle} text-yellow-600 dark:text-yellow-300 border-l-2 border-yellow-500 pl-3`;
      }
      
      if (isStderrOutput) {
        return `${baseStyle} text-red-400 dark:text-red-300 bg-red-900/20 px-1 rounded`;
      }
      
      switch (logData.level) {
        case 'ERROR':
          return `${baseStyle} ${fontWeight} text-red-500 dark:text-red-400`;
        case 'SUCCESS':
          return `${baseStyle} ${fontWeight} text-green-500 dark:text-green-400`;
        case 'WARNING':
          return `${baseStyle} ${fontWeight} text-yellow-500 dark:text-yellow-400`;
        case 'INFO':
        default:
          return `${baseStyle} ${fontWeight} text-gray-600 dark:text-gray-300`;
      }
    }

    // Fallback styling
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
      case 'stderr':
        return 'text-red-500 dark:text-red-400 font-mono text-sm font-bold bg-red-900/20 px-1 rounded';
      case 'stdout':
        return 'text-gray-700 dark:text-gray-300 font-mono text-sm';
      default:
        return 'text-foreground';
    }
  };

  const getLogLevelIndicator = (logData?: LogMessage | null): React.ReactNode => {
    if (!logData) return null;
    
    switch (logData.level) {
      case 'ERROR':
        if (logData.code === 'ERROR_ANALYSIS') {
          return <Bug className="w-4 h-4 text-red-500" />;
        }
        if (logData.code === 'EXCEPTION_DETAILS') {
          return <AlertTriangle className="w-4 h-4 text-red-500" />;
        }
        return '❌';
      case 'SUCCESS': return '✅';
      case 'WARNING': 
        if (isTroubleshooting) {
          return <Lightbulb className="w-4 h-4 text-yellow-500" />;
        }
        return '⚠️';
      case 'INFO': 
        if (logData.code === 'COMMAND_EXECUTE') {
          return <Terminal className="w-4 h-4 text-blue-500" />;
        }
        return 'ℹ️';
      default: return '';
    }
  };

  const getLogLevelBadge = (logData?: LogMessage | null): React.ReactNode => {
    if (!logData) return null;

    const badgeClass = 'px-1.5 py-0.5 rounded text-xs font-medium';
    
    // Special badges for specific error codes
    if (logData.code === 'ERROR_ANALYSIS') {
      return <span className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300`}>ERROR ANALYSIS</span>;
    }
    
    if (logData.code === 'TROUBLESHOOTING') {
      return <span className={`${badgeClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300`}>SUGGESTIONS</span>;
    }
    
    if (logData.code === 'STDERR_ANALYSIS') {
      return <span className={`${badgeClass} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>STDERR</span>;
    }

    switch (logData.level) {
      case 'ERROR':
        return <span className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>ERROR</span>;
      case 'SUCCESS':
        return <span className={`${badgeClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>SUCCESS</span>;
      case 'WARNING':
        return <span className={`${badgeClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>WARNING</span>;
      case 'INFO':
        return <span className={`${badgeClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>INFO</span>;
      default:
        return null;
    }
  };

  // Check if message should be collapsible
  const isCollapsible = isErrorRelated && (
    logData?.code === 'ERROR_ANALYSIS' ||
    logData?.code === 'EXCEPTION_DETAILS' ||
    logData?.code === 'STDERR_ANALYSIS'
  );

  const messageContainerClass = isErrorRelated 
    ? 'mb-2 break-words border-l-2 border-red-500 pl-3 bg-red-50/50 dark:bg-red-900/10 py-1 rounded-r'
    : isTroubleshooting
    ? 'mb-1 break-words border-l-2 border-yellow-500 pl-3 bg-yellow-50/50 dark:bg-yellow-900/10 py-1 rounded-r'
    : 'mb-1 break-words';

  return (
    <div className={messageContainerClass}>
      <div className="flex flex-wrap items-start gap-2">
        {/* Timestamp */}
        <span className="text-gray-500 flex-shrink-0 text-xs">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>

        {/* Message Type or Log Level Badge */}
        {logData ? (
          <>
            {getLogLevelBadge(logData)}
            {/* Log Code for debugging/tracing */}
            <span className="text-gray-400 flex-shrink-0 text-xs font-mono">
              [{logData.code}]
            </span>
          </>
        ) : (
          <span className="text-blue-400 flex-shrink-0 min-w-[80px] text-xs">
            [{message.type.toUpperCase()}]
          </span>
        )}

        {/* Collapsible indicator for error analysis */}
        {isCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}

        {/* Log Level Indicator Icon */}
        <span className="flex-shrink-0">
          {getLogLevelIndicator(logData)}
        </span>

        {/* Message Content */}
        <span className={`${getMessageStyle(message.type, logData)} flex-1 break-all`}>
          {message.message}
        </span>
      </div>

      {/* Additional Data (for non-enhanced logs) */}
      {message.data && !isEnhancedLog && (
        <div className="mt-1 ml-2 text-gray-400 text-xs break-all">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(message.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Enhanced log data details (expandable for errors) */}
      {logData && isCollapsible && isExpanded && (
        <div className="mt-2 ml-8 p-3 bg-gray-900 rounded border border-gray-700">
          <div className="text-gray-300 text-sm">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-gray-400">Level:</span> 
                <span className={`ml-2 font-medium ${
                  logData.level === 'ERROR' ? 'text-red-400' : 
                  logData.level === 'WARNING' ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  {logData.level}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Code:</span> 
                <span className="ml-2 font-mono text-blue-400">{logData.code}</span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Timestamp:</span> 
              <span className="ml-2">{new Date(logData.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Color:</span> 
              <span className="ml-2" style={{ color: logData.color }}>
                {logData.color}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Special rendering for error patterns */}
      {logData?.code === 'ERROR_PATTERN' && (
        <div className="mt-1 ml-8 p-2 bg-orange-100 dark:bg-orange-900/20 rounded border-l-4 border-orange-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-orange-800 dark:text-orange-200 text-sm font-medium">
              Common Error Pattern Detected
            </span>
          </div>
        </div>
      )}

      {/* Special rendering for troubleshooting suggestions */}
      {isTroubleshooting && logData?.code !== 'TROUBLESHOOTING' && (
        <div className="mt-1 ml-8 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span className="text-yellow-800 dark:text-yellow-200 text-sm">
              {message.message.replace(/^\s*\d+\.\s*/, '')}
            </span>
          </div>
        </div>
      )}

      {/* Special rendering for command execution */}
      {logData?.code === 'COMMAND_EXECUTE' && (
        <div className="mt-1 ml-8 p-2 bg-blue-100 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200 text-sm font-mono">
              {message.message.replace('💻 Executing command: ', '')}
            </span>
          </div>
        </div>
      )}

      {/* Special rendering for exit codes */}
      {logData?.code === 'EXIT_CODE' && (
        <div className="mt-1 ml-8 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-mono">
            {message.message}
          </span>
        </div>
      )}
    </div>
  );
};