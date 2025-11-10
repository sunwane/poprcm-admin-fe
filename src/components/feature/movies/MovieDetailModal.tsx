import React, { useState } from 'react';
import { Movie } from '@/types/Movies';
import { getStatusText, getTypeText, formatViewCount, formatDate, getStatusColor } from '@/utils/movieUtils';
import VideoPopup from '@/components/feature/movies/VideoPopup';
import GradientAvatar from '@/components/ui/GradientAvatar';
import EpisodesSection from '@/components/feature/movies/EpisodesSection';
import { getRatingColor } from '@/utils/seriesUtils';

interface MovieDetailModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
}

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
        <div className="relative w-full max-w-5xl h-[90vh] overflow-y-auto rounded-xl shadow-lg bg-transparent m-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/20 rounded-full p-2 z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

            {/* Thumbnail Section */}
            {movie.thumbnailUrl && (
              <div className="relative aspect-video rounded-2xl bg-gray-100 shadow-lg mb-8">
                <img 
                  src={movie.thumbnailUrl || '/placeholder-thumnail.jpg'} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-thumnail.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />

                {/* Title and Basic Info */}
                <div className="absolute bottom-16 left-[280px] right-4 text-white">
                  <h1 className="text-4xl font-bold leading-tight max-w-[580px] mb-1">
                    {movie.title}
                  </h1>
                  {movie.originalName && (
                    <p className="text-xl text-gray-200">{movie.originalName}</p>
                  )}
                </div>

                {/* Trailer Button */}
                {movie.trailerUrl && (
                  <button
                    onClick={() => openVideoPopup(movie.trailerUrl!, 'Trailer - ' + movie.title)}
                    className="absolute bottom-18 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="2 4 20 16">
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.3" />
                      <path
                        d="M10.5 9.5C10.5 8.95 11.05 8.62 11.5 8.9L15 11.08C15.45 11.36 15.45 12.04 15 12.32L11.5 14.5C11.05 14.78 10.5 14.45 10.5 13.9V9.5Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Xem Trailer</span>
                  </button>
                )}
              </div>
            )}

            {/* Main Modal - White Background */}
            <div className="bg-white rounded-xl shadow-sm relative" style={{ marginTop: '-80px' }}>
              {/* Header Section - Poster + Title overlapping */}
              <div className="flex items-start p-6 pb-4 pt-1.5">
                {/* Poster overlapping thumbnail */}
                <div
                  className="w-56 shrink-0 aspect-2/3 rounded-xl overflow-hidden bg-gray-100 shadow-sm mr-8 relative -mt-34"
                >
                  <img
                    src={movie.posterUrl || '/placeholder-poster.png'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.png';
                    }}
                  />
                </div>
                
                <div>
                <div>
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
                    <div className='space-y-3'>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="text-sm font-bold text-yellow-500">Điểm IMDB</label>
                          <p className={`"text-white font-bold py-1 px-2 rounded-md w-fit ${getRatingColor(movie.imdbScore ?? 0)}"`}>{movie.imdbScore ?? 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-blue-700">Điểm TMDB</label>
                          <p className={`"text-white font-bold py-1 px-2 rounded-md w-fit ${getRatingColor(movie.tmdbScore ?? 0)}"`}>{movie.tmdbScore}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                          <p className={`"text-white font-bold w-fit ${getStatusColor(movie.status)}"`}>{getStatusText(movie.status)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Loại</label>
                          <p className="text-gray-800 font-medium">{getTypeText(movie.type)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Thời lượng</label>
                          <p className="text-gray-800 font-medium">{movie.duration}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Tổng số tập</label>
                          <p className="text-gray-800 font-medium">{movie.totalEpisodes? movie.totalEpisodes : "?"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Năm</label>
                          <p className="text-gray-800 font-medium">{movie.releaseYear}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngôn ngữ</label>
                          <p className="text-gray-800 font-medium">{movie.lang}</p>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-red-600">Lượt xem</label>
                          <p className="bg-linear-to-r from-orange-400 to-red-500 py-1 px-2 rounded-md w-fit text-white font-bold">{formatViewCount(movie.view)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                          <p className="text-gray-800 font-medium">{formatDate(movie.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                          <p className="text-gray-800 font-medium">{formatDate(movie.modifiedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'countries' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quốc gia sản xuất</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.country?.map((country) => (
                          <span 
                            key={country.id}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {country.countryName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'genres' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Thể loại</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres?.map((genre) => (
                          <span 
                            key={genre.id}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {genre.genresName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                  <div className='grid grid-cols-2 align-center mt-5 border-t pt-4 border-gray-200'>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Từ khóa</label>
                      <p className="text-gray-800 font-medium">{movie.slug}</p>
                    </div>
                    <div className=''>
                      <label className="text-sm font-medium text-gray-500">Đạo diễn</label>
                      <p className="text-gray-800 font-medium">{movie.director}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Mô tả</label>
                    <p className="text-gray-800 leading-relaxed">{movie.description}</p>
                  </div>
                </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-6 pb-6">
                {/* Actors Section */}
                {movie.actors && movie.actors.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Diễn viên</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {movie.actors.map((movieActor) => (
                        <div key={movieActor.id} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                          {movieActor.actor?.profilePath ? (
                            <img
                              src={movieActor.actor.profilePath}
                              alt={movieActor.actor.originName}
                              className="w-18 h-18 rounded-full object-cover mx-auto mb-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : (
                            <GradientAvatar
                              size='w-18 h-18 mx-auto mb-2'
                              initial={movieActor.actor?.originName?.charAt(0) || ''}
                            />
                          )}
                          <div className="hidden">
                            <GradientAvatar
                              size='w-18 h-18 mx-auto mb-2'
                              initial={movieActor.actor?.originName?.charAt(0) || ''}
                            />
                          </div>
                          <h4 className="font-medium text-gray-800 text-sm">{movieActor.actor?.originName}</h4>
                          {movieActor.characterName && (
                            <p className="text-gray-600 text-xs mt-1">{movieActor.characterName}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episodes Section */}
                {movie.episodes && movie.episodes.length > 0 && (
                  <div className="mt-8">
                    <EpisodesSection
                      episodes={movie.episodes}
                      onEpisodeClick={openVideoPopup}
                    />
                  </div>
                )}
              </div>
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