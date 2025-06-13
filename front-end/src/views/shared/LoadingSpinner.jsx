import React from 'react';

/**
 * LoadingSpinner - Reusable loading component untuk MVP views
 */
const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "medium", 
  overlay = false,
  className = "" 
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
