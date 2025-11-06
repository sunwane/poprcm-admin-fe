import { useState, useEffect } from 'react';

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  color: string;
}

interface MovieStats {
  total: number;
  totalMovies: number;
  totalSeries: number;
  totalAnime: number;
  averageRating: number;
  ongoingSeries: number;
  completedMovies: number;
  trailerMovies: number;
  latestAddedDate: Date | null;
  moviesAddedOnLatestDate: number;
  latestUpdatedDate: Date | null;
  moviesUpdatedOnLatestDate: number;
}

export const useMovieStatsCard = (stats: MovieStats) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Tạo 12 stats cards
  const allStats: StatCard[] = [
    {
      id: 'total',
      label: 'Tổng phim',
      value: stats.total,
      color: 'text-blue-600',
    },
    {
      id: 'movies',
      label: 'Phim lẻ',
      value: stats.totalMovies,
      color: 'text-purple-600',
    },
    {
      id: 'series',
      label: 'Phim bộ',
      value: stats.totalSeries,
      color: 'text-green-600',
    },
    {
      id: 'anime',
      label: 'Hoạt hình',
      value: stats.totalAnime,
      color: 'text-orange-600',
    },
    {
      id: 'rating',
      label: 'Điểm trung bình',
      value: stats.averageRating.toFixed(1),
      color: 'text-yellow-600',
    },
    {
      id: 'ongoing',
      label: 'Đang chiếu',
      value: stats.ongoingSeries,
      color: 'text-red-600',
    },
    {
      id: 'completed',
      label: 'Hoàn thành',
      value: stats.completedMovies,
      color: 'text-teal-600',
    },
    {
      id: 'trailer',
      label: 'Vừa có trailer',
      value: stats.trailerMovies,
      color: 'text-gray-600',
    },
    {
      id: 'latest-added',
      label: 'Ngày thêm gần nhất',
      value: stats.latestAddedDate ? stats.latestAddedDate.toLocaleDateString('vi-VN') : 'N/A',
      color: 'text-indigo-600',
    },
    {
      id: 'added-today',
      label: 'Thêm mới hôm nay',
      value: stats.moviesAddedOnLatestDate,
      color: 'text-cyan-600',
    },
    {
      id: 'latest-updated',
      label: 'Ngày cập nhật gần nhất',
      value: stats.latestUpdatedDate ? stats.latestUpdatedDate.toLocaleDateString('vi-VN') : 'N/A',
      color: 'text-pink-600',
    },
    {
      id: 'updated-today',
      label: 'Cập nhật hôm nay',
      value: stats.moviesUpdatedOnLatestDate || 0,
      color: 'text-emerald-600',
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

  return {
    // State
    currentIndex,
    isAutoPlaying,
    allStats,
    currentCards,
    totalSlides,
    currentSlide,
    maxIndex,
    
    // Actions
    goNext,
    goPrev,
    goToSlide,
    setIsAutoPlaying,
    
    // Computed values
    totalCards,
    cardsPerView
  };
};