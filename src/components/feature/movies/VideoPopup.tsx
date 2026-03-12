import React, { useState, useEffect } from 'react';

interface VideoPopupProps {
  isOpen: boolean;
  videoUrl: string;
  embeddedUrl?: string; // Optional embedded URL as fallback
  title: string;
  onClose: () => void;
}

const VideoPopup: React.FC<VideoPopupProps> = ({ 
  isOpen, 
  videoUrl, 
  embeddedUrl, 
  title, 
  onClose 
}) => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [hasError, setHasError] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Reset state when popup opens/closes or URLs change
  useEffect(() => {
    if (isOpen) {
      setCurrentVideoUrl(videoUrl);
      setHasError(false);
      setIsUsingFallback(false);
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  const handleVideoError = () => {
    console.warn('Primary video failed to load:', currentVideoUrl);
    setHasError(true);
    
    // Try fallback to embedded URL if available
    if (embeddedUrl && !isUsingFallback) {
      console.log('Switching to embedded URL fallback:', embeddedUrl);
      setCurrentVideoUrl(embeddedUrl);
      setIsUsingFallback(true);
      setHasError(false);
    }
  };

  const isDirectVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.m3u8');
  };

  // Check if current URL is valid
  const hasValidUrl = currentVideoUrl && currentVideoUrl.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="aspect-video bg-black relative">
          {!hasValidUrl || hasError ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{!hasValidUrl ? 'URL video không hợp lệ' : 'Không thể tải video'}</p>
              </div>
            </div>
          ) : isDirectVideo(currentVideoUrl) ? (
            <video 
              src={currentVideoUrl} 
              controls 
              className="w-full h-full"
              preload="metadata"
              onError={handleVideoError}
            >
              Trình duyệt không hỗ trợ video này.
            </video>
          ) : (
            <iframe
              src={currentVideoUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={title}
              onError={handleVideoError}
            />
          )}
          
          {isUsingFallback && hasValidUrl && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              Sử dụng video dự phòng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPopup;
