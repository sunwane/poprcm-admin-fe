interface VideoPopupProps {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

const VideoPopup: React.FC<VideoPopupProps> = ({ isOpen, videoUrl, title, onClose }) => {
  if (!isOpen) return null;

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Direct video files
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return url;
    }
    
    // Default fallback
    return url;
  };
  
  const embedUrl = getEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg');

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
        
        <div className="aspect-video bg-black">
          {isDirectVideo ? (
            <video 
              src={embedUrl} 
              controls 
              className="w-full h-full"
              preload="metadata"
            >
              Trình duyệt không hỗ trợ video này.
            </video>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPopup;
