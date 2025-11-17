import React, { useState, useEffect } from 'react';
import ServiceChecker from '@/services/ServiceChecker';

interface ServiceStatusProps {
  className?: string;
  showRefresh?: boolean;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ 
  className = '', 
  showRefresh = false 
}) => {
  const [serviceStatus, setServiceStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Gọi ServiceChecker để kiểm tra trạng thái khi component được mount
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    setIsChecking(true);
    const status = await ServiceChecker.checkServiceAvailability();
    setServiceStatus(status);
    setIsChecking(false);
  };

  const handleRefresh = async () => {
    // Reset trạng thái và kiểm tra lại
    ServiceChecker.resetServiceCheck();
    await checkServiceStatus();
  };

  if (serviceStatus === null && !isChecking) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isChecking 
            ? 'bg-yellow-500 animate-pulse' 
            : serviceStatus 
              ? 'bg-blue-500' 
              : 'bg-red-500'
        }`} />
        <span className={`text-sm font-medium ${
          isChecking 
            ? 'text-yellow-600' 
            : serviceStatus 
              ? 'text-blue-600' 
              : 'text-red-600'
        }`}>
          {isChecking 
            ? 'Đang kiểm tra...' 
            : serviceStatus 
              ? 'Backend Service Online' 
              : 'Sử dụng Mock Data'
          }
        </span>
      </div>

      {showRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isChecking}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Kiểm tra lại trạng thái service"
        >
          <svg 
            className={`w-4 h-4 text-gray-500 ${isChecking ? 'animate-spin' : ''}`} 
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
        </button>
      )}
    </div>
  );
};

export default ServiceStatus;