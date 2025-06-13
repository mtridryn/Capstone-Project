import React from 'react';

/**
 * EmptyState - Reusable empty state component untuk MVP views
 */
const EmptyState = ({ 
  icon = "📭",
  title = "No Data Found",
  description = "There's nothing to show here yet.",
  actionLabel = null,
  onAction = null,
  className = ""
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
