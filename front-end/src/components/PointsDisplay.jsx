import { usePoints } from "./PointsContext.jsx";

const PointsDisplay = ({
  className = "",
  showLabel = true,
  size = "normal",
}) => {
  const { points, loading, error } = usePoints();

  const sizeClasses = {
    small: "text-sm",
    normal: "text-lg",
    large: "text-2xl font-bold",
  };

  return (
    <div className={`flex items-center space-x-2 ${className} group`}>
      {/* Points Display */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-primary-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg animate-pulse-custom">
          <span className="text-white text-sm transition-transform duration-300 group-hover:scale-110 animate-bounce">
            ★
          </span>
        </div>

        <div className="flex flex-col">
          {showLabel && (
            <span className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-primary-600">
              Poin Anda
            </span>
          )}
          <span
            className={`text-orange-500 font-medium transition-all duration-300 group-hover:text-primary-600 group-hover:scale-105 ${
              sizeClasses[size]
            } ${loading ? "animate-pulse" : ""}`}
          >
            {loading ? "..." : points}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-xs text-yellow-600" title={error}>
            Offline
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600">Syncing...</span>
        </div>
      )}
    </div>
  );
};

export default PointsDisplay;
