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
    <div className="bg-white rounded-xl shadow-sm pt-4 pb-3 px-5 mb-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-2">
        {currentCards.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow-sm border border-gray-100 py-4 px-5">
            <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation and Indicators */}
      <div className="grid grid-cols-3 items-center gap-4 bg-gray-50 py-1 px-3 rounded-md">

        {/* Slide Info */}
        <div className="flex justify-left items-center">
          <div className="text-sm text-gray-500">
            Slide {currentSlide + 1} / {totalSlides}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center items-center space-x-1.5">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end items-center space-x-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang trước"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Auto-play Button */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2 rounded-md transition-colors ${
              isAutoPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={isAutoPlaying ? 'Tắt tự động chuyển' : 'Bật tự động chuyển'}
          >
            {isAutoPlaying ? (
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={6}
                  d="M8 6v12m8-12v12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3l14 9-14 9V3z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang tiếp theo"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default MovieStatsCard;