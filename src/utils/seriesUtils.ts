import { Series } from '@/types/Series';

// Status color mappings
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'ongoing': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'hiatus': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get available series statuses
export const getSeriesStatuses = (): Array<{value: string, label: string}> => [
  { value: 'Ongoing', label: 'Đang phát sóng' },
  { value: 'Completed', label: 'Đã hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Hiatus', label: 'Tạm dừng' }
];

// Format release year
export const formatReleaseYear = (year: string): string => {
  return year || 'Chưa xác định';
};

// Format number of seasons
export const formatSeasons = (seasons: number): string => {
  if (seasons === 1) return '1 mùa';
  return `${seasons} mùa`;
};

// Format number of movies in series
export const formatMovieCount = (count: number): string => {
  if (count === 0) return 'Chưa có phim';
  if (count === 1) return '1 phim';
  return `${count} phim`;
};

// Format date
export const formatDate = (date: Date | string): string => {
  if (!date) return 'Chưa xác định';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Ngày không hợp lệ';
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

// Get rating color based on average rating
export const getRatingColor = (rating: number): string => {
  if (rating >= 8.5) return 'bg-green-100 text-green-800 border-green-600';
  if (rating >= 7.0) return 'bg-blue-100 text-blue-800 border-blue-600';
  if (rating >= 5.5) return 'bg-yellow-100 text-yellow-800 border-yellow-600';
  return 'bg-red-100 text-red-700 border-red-600';
};

// Calculate average rating from series movies
export const calculateAverageRating = (series: Series): number => {
  if (!series.seriesMovies || series.seriesMovies.length === 0) return 0;

  // Lọc các movie có ít nhất một điểm số hợp lệ (IMDb hoặc TMDb)
  const moviesWithValidRatings = series.seriesMovies.filter(sm => {
    const imdbScore = sm.movie?.imdbScore || 0;
    const tmdbScore = sm.movie?.tmdbScore || 0;
    return imdbScore > 0 || tmdbScore > 0; // Chỉ lấy movie có ít nhất một điểm số hợp lệ
  });

  if (moviesWithValidRatings.length === 0) return 0;

  // Tính tổng điểm trung bình của IMDb và TMDb cho các movie hợp lệ
  const totalRating = moviesWithValidRatings.reduce((sum, sm) => {
    const imdbScore = sm.movie?.imdbScore || 0;
    const tmdbScore = sm.movie?.tmdbScore || 0;

    // Tính trung bình của IMDb và TMDb (nếu cả hai đều tồn tại)
    const averageScore = imdbScore > 0 && tmdbScore > 0
      ? (imdbScore + tmdbScore) / 2
      : imdbScore > 0
      ? imdbScore
      : tmdbScore;

    return sum + averageScore;
  }, 0);

  // Tính điểm trung bình của series
  return Math.round((totalRating / moviesWithValidRatings.length) * 10) / 10;
};

// Calculate total episodes/movies in series
export const calculateTotalMovies = (series: Series): number => {
  return series.seriesMovies?.length || 0;
};

// Validation utilities
export const validateSeriesName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Tên series không được để trống' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Tên series phải có ít nhất 2 ký tự' };
  }
  
  if (name.trim().length > 200) {
    return { isValid: false, message: 'Tên series không được quá 200 ký tự' };
  }
  
  return { isValid: true };
};

export const validateReleaseYear = (year: string): { isValid: boolean; message?: string } => {
  if (!year || year.trim().length === 0) {
    return { isValid: false, message: 'Năm phát hành không được để trống' };
  }
  
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) {
    return { isValid: false, message: 'Năm phát hành phải là số' };
  }
  
  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear + 10) {
    return { isValid: false, message: `Năm phát hành phải từ 1900 đến ${currentYear + 10}` };
  }
  
  return { isValid: true };
};

export const validateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, message: 'Mô tả không được để trống' };
  }
  
  if (description.trim().length < 10) {
    return { isValid: false, message: 'Mô tả phải có ít nhất 10 ký tự' };
  }
  
  if (description.trim().length > 1000) {
    return { isValid: false, message: 'Mô tả không được quá 1000 ký tự' };
  }
  
  return { isValid: true };
};

// Search and filter utilities
export const filterSeriesByStatus = (seriesList: Series[], status: string): Series[] => {
  if (status === 'all') return seriesList;
  return seriesList.filter(series => series.status === status);
};

export const filterSeriesByYear = (seriesList: Series[], year: string): Series[] => {
  if (!year) return seriesList;
  return seriesList.filter(series => series.releaseYear === year);
};

export const searchSeries = (seriesList: Series[], query: string): Series[] => {
  if (!query.trim()) return seriesList;
  
  const searchTerm = query.toLowerCase();
  return seriesList.filter(series =>
    series.name.toLowerCase().includes(searchTerm) ||
    series.description.toLowerCase().includes(searchTerm)
  );
};

// Sort utilities
export type SeriesSortBy = 'id' | 'releaseYear' | 'movieCount' | 'averageRating';
export type SortOrder = 'asc' | 'desc';

export const sortSeries = (seriesList: Series[], sortBy: SeriesSortBy, order: SortOrder = 'asc'): Series[] => {
  const sorted = [...seriesList].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'releaseYear':
        aValue = parseInt(a.releaseYear) || 0;
        bValue = parseInt(b.releaseYear) || 0;
        break;
      case 'movieCount':
        aValue = calculateTotalMovies(a);
        bValue = calculateTotalMovies(b);
        break;
      case 'averageRating':
        aValue = calculateAverageRating(a);
        bValue = calculateAverageRating(b);
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string') {
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  return sorted;
};

// Pagination utilities
export const paginateSeries = (seriesList: Series[], page: number, itemsPerPage: number) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    data: seriesList.slice(startIndex, endIndex),
    totalPages: Math.ceil(seriesList.length / itemsPerPage),
    totalItems: seriesList.length,
    currentPage: page,
    itemsPerPage,
    hasNextPage: endIndex < seriesList.length,
    hasPrevPage: startIndex > 0
  };
};

// Series card utilities
export const truncateDescription = (description: string, maxLength: number = 150): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
};

export const getSeriesDisplayData = (series: Series) => {
  const movieCount = calculateTotalMovies(series);
  const averageRating = calculateAverageRating(series);
  
  return {
    ...series,
    movieCount,
    averageRating,
    formattedMovieCount: formatMovieCount(movieCount),
    formattedYear: formatReleaseYear(series.releaseYear),
    truncatedDescription: truncateDescription(series.description),
    statusColor: getStatusColor(series.status),
    ratingColor: getRatingColor(averageRating)
  };
};