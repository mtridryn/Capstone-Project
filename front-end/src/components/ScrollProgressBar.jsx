import { useScrollProgress } from "../hooks/useScrollAnimation.js";

/**
 * ScrollProgressBar - Komponen untuk menampilkan progress scroll halaman
 */
const ScrollProgressBar = ({ 
  className = "",
  color = "bg-gradient-to-r from-primary-500 to-primary-600",
  height = "h-1",
  position = "fixed top-0 left-0 right-0",
  zIndex = "z-50"
}) => {
  const progress = useScrollProgress();

  return (
    <div className={`${position} ${height} bg-gray-200 ${zIndex} ${className}`}>
      <div 
        className={`${height} ${color} transition-all duration-300 ease-out`}
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px rgba(255, 155, 122, 0.5)' : 'none'
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
