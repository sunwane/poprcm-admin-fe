import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Đang xử lý...',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl shadow-lg px-8 py-6 flex items-center space-x-4 ${className}`}>
        {/* Spinning Icon */}
        <svg 
          className="w-6 h-6 text-blue-600 animate-spin" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        
        {/* Loading Text with Pulse Animation */}
        <span className="text-lg font-medium text-gray-700 animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;