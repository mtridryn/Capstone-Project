import React from 'react';

/**
 * ErrorMessage - Reusable error display component untuk MVP views
 */
const ErrorMessage = ({ 
  message, 
  type = "error", 
  onRetry = null, 
  onDismiss = null,
  className = "" 
}) => {
  if (!message) return null;

  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconMap = {
    error: "❌",
    warning: "⚠️", 
    info: "ℹ️"
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex items-start">
        <span className="text-lg mr-3 flex-shrink-0">
          {iconMap[type]}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs bg-white border border-current rounded px-3 py-1 hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs bg-white border border-current rounded px-3 py-1 hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
