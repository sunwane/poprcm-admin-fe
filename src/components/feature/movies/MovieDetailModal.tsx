import React, { useState } from 'react';
import { Movie } from '@/types/Movies';
import { getStatusText, getTypeText, formatViewCount, formatDate } from '@/utils/movieUtils';

interface MovieDetailModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
}

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

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ isOpen, movie, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'countries' | 'genres'>('info');
  const [videoPopup, setVideoPopup] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  if (!isOpen || !movie) return null;

  const openVideoPopup = (url: string, title: string) => {
    setVideoPopup({ isOpen: true, url, title });
  };

  const closeVideoPopup = () => {
    setVideoPopup({ isOpen: false, url: '', title: '' });
  };

  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản' },
    { id: 'countries', label: 'Quốc gia' },
    { id: 'genres', label: 'Thể loại' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600">Chi tiết phim</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Top Section - Thumbnail, Poster & Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Thumbnail */}
              <div className="lg:col-span-4">
                {movie.thumbnailUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={movie.thumbnailUrl} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-thumbnail.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                      <p className="text-lg opacity-90">{movie.originalName}</p>
                    </div>
                    {movie.trailerUrl && (
                      <button
                        onClick={() => openVideoPopup(movie.trailerUrl!, 'Trailer - ' + movie.title)}
                        className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Xem Trailer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Poster */}
              <div className="lg:col-span-1">
                <div className="aspect-2/3 rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                  <img 
                    src={movie.posterUrl || '/placeholder-poster.png'} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.png';
                    }}
                  />
                </div>
              </div>

              {/* Info Tabs */}
              <div className="lg:col-span-3">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-3 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Loại phim</label>
                          <p className="text-gray-800 font-medium">{getTypeText(movie.type)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Năm phát hành</label>
                          <p className="text-gray-800 font-medium">{movie.releaseYear}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Thời lượng</label>
                          <p className="text-gray-800 font-medium">{movie.duration}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                          <p className="text-gray-800 font-medium">{getStatusText(movie.status)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngôn ngữ</label>
                          <p className="text-gray-800 font-medium">{movie.lang}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Đạo diễn</label>
                          <p className="text-gray-800 font-medium">{movie.director}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Lượt xem</label>
                          <p className="text-gray-800 font-medium">{formatViewCount(movie.view)}</p>
                        </div>
                        {movie.totalEpisodes && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Tổng số tập</label>
                            <p className="text-gray-800 font-medium">{movie.totalEpisodes}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                          <p className="text-gray-800 font-medium">{formatDate(movie.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Cập nhật cuối</label>
                          <p className="text-gray-800 font-medium">{formatDate(movie.modifiedAt || movie.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'countries' && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Quốc gia sản xuất</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {movie.country && movie.country.length > 0 ? (
                          movie.country.map((country) => (
                            <div key={country.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="font-medium text-blue-800">{country.countryName}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 col-span-full">Chưa có thông tin quốc gia</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'genres' && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Thể loại</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.map((genre) => (
                            <span 
                              key={genre.id} 
                              className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {genre.genresName}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">Chưa có thông tin thể loại</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Mô tả</h4>
                  <p className="text-gray-600 leading-relaxed">{movie.description}</p>
                </div>

                {/* Rating Scores */}
                {((movie.tmdbScore ?? 0) > 0 || (movie.imdbScore ?? 0) > 0) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Điểm đánh giá</h4>
                    <div className="flex space-x-4">
                      {(movie.tmdbScore ?? 0) > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{movie.tmdbScore}</div>
                          <div className="text-sm text-blue-500">TMDB</div>
                        </div>
                      )}
                      {(movie.imdbScore ?? 0) > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">{movie.imdbScore}</div>
                          <div className="text-sm text-yellow-500">IMDB</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actors Section */}
            {movie.actors && movie.actors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Diễn viên</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.actors.map((movieActor) => (
                    <div key={movieActor.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        {movieActor.actor?.originName.charAt(0) || 'A'}
                      </div>
                      <p className="font-medium text-gray-800">{movieActor.actor?.originName || 'Unknown'}</p>
                      {movieActor.characterName && (
                        <p className="text-sm text-blue-600 mt-1">vai {movieActor.characterName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes Section */}
            {movie.episodes && movie.episodes.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tập phim ({movie.episodes.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {movie.episodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => openVideoPopup(episode.videoUrl, `Tập ${episode.episodeNumber}: ${episode.title}`)}
                      className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 text-center transition-colors group"
                    >
                      <div className="font-bold text-blue-700 group-hover:text-blue-800">
                        Tập {episode.episodeNumber}
                      </div>
                      <div className="text-xs text-blue-600 mt-1 truncate">
                        {episode.title}
                      </div>
                      <div className="text-xs text-blue-500 mt-1">
                        {episode.serverName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Popup */}
      <VideoPopup
        isOpen={videoPopup.isOpen}
        videoUrl={videoPopup.url}
        title={videoPopup.title}
        onClose={closeVideoPopup}
      />
    </>
  );
};

export default MovieDetailModal;