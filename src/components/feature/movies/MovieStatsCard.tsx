import React, { useState, useEffect } from 'react';

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  color: string;
  icon?: string;
}

interface MovieStatsCardProps {
  stats: {
    total: number;
    totalMovies: number;
    totalSeries: number;
    totalAnime: number;
    averageRating: number;
    ongoingSeries: number;
    completedMovies: number;
    hiatusMovies: number;
    latestAddedDate: Date | null;
    moviesAddedOnLatestDate: number;
    latestUpdatedDate: Date | null;
    moviesUpdatedOnLatestDate: number;
  };
}

const MovieStatsCard: React.FC<MovieStatsCardProps> = ({ stats }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Tạo 12 stats cards
  const allStats: StatCard[] = [
    {
      id: 'total',
      label: 'Tổng phim',
      value: stats.total,
      color: 'text-blue-600',
      icon: '🎬'
    },
    {
      id: 'movies',
      label: 'Phim lẻ',
      value: stats.totalMovies,
      color: 'text-purple-600',
      icon: '🎭'
    },
    {
      id: 'series',
      label: 'Phim bộ',
      value: stats.totalSeries,
      color: 'text-green-600',
      icon: '📺'
    },
    {
      id: 'anime',
      label: 'Hoạt hình',
      value: stats.totalAnime,
      color: 'text-orange-600',
      icon: '🎨'
    },
    {
      id: 'rating',
      label: 'Điểm trung bình',
      value: stats.averageRating.toFixed(1),
      color: 'text-yellow-600',
      icon: '⭐'
    },
    {
      id: 'ongoing',
      label: 'Đang chiếu',
      value: stats.ongoingSeries,
      color: 'text-red-600',
      icon: '📡'
    },
    {
      id: 'completed',
      label: 'Hoàn thành',
      value: stats.completedMovies,
      color: 'text-teal-600',
      icon: '✅'
    },
    {
      id: 'hiatus',
      label: 'Tạm dừng',
      value: stats.hiatusMovies,
      color: 'text-gray-600',
      icon: '⏸️'
    },
    {
      id: 'latest-added',
      label: 'Ngày thêm gần nhất',
      value: stats.latestAddedDate ? stats.latestAddedDate.toLocaleDateString('vi-VN') : 'N/A',
      color: 'text-indigo-600',
      icon: '📅'
    },
    {
      id: 'added-today',
      label: 'Thêm mới hôm nay',
      value: stats.moviesAddedOnLatestDate,
      color: 'text-cyan-600',
      icon: '🆕'
    },
    {
      id: 'latest-updated',
      label: 'Ngày cập nhật gần nhất',
      value: stats.latestUpdatedDate ? stats.latestUpdatedDate.toLocaleDateString('vi-VN') : 'N/A',
      color: 'text-pink-600',
      icon: '🔄'
    },
    {
      id: 'updated-today',
      label: 'Cập nhật hôm nay',
      value: stats.moviesUpdatedOnLatestDate || 0,
      color: 'text-emerald-600',
      icon: '🔁'
    }
  ];

  const totalCards = allStats.length;
  const cardsPerView = 4;
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + cardsPerView;
        return nextIndex >= totalCards ? 0 : nextIndex;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalCards, cardsPerView]);

  const goNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => Math.min(prev + cardsPerView, maxIndex));
  };

  const goPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => Math.max(prev - cardsPerView, 0));
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index * cardsPerView);
  };

  const currentCards = allStats.slice(currentIndex, currentIndex + cardsPerView);
  const totalSlides = Math.ceil(totalCards / cardsPerView);
  const currentSlide = Math.floor(currentIndex / cardsPerView);

  return (
    <div className="relative mb-6">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Thống kê tổng quan</h2>
        
        <div className="flex items-center space-x-2">
          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isAutoPlaying 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title={isAutoPlaying ? 'Tắt tự động chuyển' : 'Bật tự động chuyển'}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goNext}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 transition-all duration-500 ease-in-out">
        {currentCards.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              {stat.icon && (
                <div className="text-2xl opacity-70">
                  {stat.icon}
                </div>
              )}
            </div>
            <div className="text-gray-600 text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide 
                ? 'bg-blue-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Progress bar for auto-play */}
      {isAutoPlaying && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all ease-linear"
            style={{ 
              width: '100%',
              animation: 'progress 10s linear infinite'
            }}
            key={currentIndex} // Reset animation on slide change
          />
        </div>
      )}
    </div>
  );
};

export default MovieStatsCard;