import React from 'react';
import { useMovieStatsCard } from '@/hooks/useMovieStatsCard';

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
  const {
    currentIndex,
    isAutoPlaying,
    currentCards,
    totalSlides,
    currentSlide,
    maxIndex,
    goNext,
    goPrev,
    goToSlide,
    setIsAutoPlaying
  } = useMovieStatsCard(stats);

  return (
    <div className="relative mb-6">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        {/* Slide Indicators */}
        <div className="flex justify-center mt-4 ml-2 space-x-2">
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
            </div>
            <div className="text-gray-600 text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieStatsCard;