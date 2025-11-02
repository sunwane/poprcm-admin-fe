import { Movie } from '@/types/Movies';

// Format movie title
export const formatMovieTitle = (title: string): string => {
  return title.trim();
};

// Format movie duration
export const formatDuration = (duration: string): string => {
  return duration.trim();
};

// Validate movie title
export const validateMovieTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Tên phim không được để trống' };
  }
  
  if (title.trim().length < 2) {
    return { isValid: false, error: 'Tên phim phải có ít nhất 2 ký tự' };
  }
  
  if (title.trim().length > 200) {
    return { isValid: false, error: 'Tên phim không được vượt quá 200 ký tự' };
  }
  
  return { isValid: true };
};

// Validate original name
export const validateOriginalName = (originalName: string): { isValid: boolean; error?: string } => {
  if (!originalName || originalName.trim().length === 0) {
    return { isValid: false, error: 'Tên gốc không được để trống' };
  }
  
  if (originalName.trim().length < 2) {
    return { isValid: false, error: 'Tên gốc phải có ít nhất 2 ký tự' };
  }
  
  if (originalName.trim().length > 200) {
    return { isValid: false, error: 'Tên gốc không được vượt quá 200 ký tự' };
  }
  
  return { isValid: true };
};

// Validate release year
export const validateReleaseYear = (year: number): { isValid: boolean; error?: string } => {
  const currentYear = new Date().getFullYear();
  
  if (!year || isNaN(year)) {
    return { isValid: false, error: 'Năm phát hành không hợp lệ' };
  }
  
  if (year < 1900) {
    return { isValid: false, error: 'Năm phát hành không được nhỏ hơn 1900' };
  }
  
  if (year > currentYear + 5) {
    return { isValid: false, error: `Năm phát hành không được lớn hơn ${currentYear + 5}` };
  }
  
  return { isValid: true };
};

// Validate rating
export const validateRating = (rating: number): { isValid: boolean; error?: string } => {
  if (rating < 0 || rating > 10) {
    return { isValid: false, error: 'Đánh giá phải từ 0 đến 10' };
  }
  
  return { isValid: true };
};

// Validate total episodes for series
export const validateTotalEpisodes = (totalEpisodes: number | undefined, type: string): { isValid: boolean; error?: string } => {
  if (type === 'Series' || type === 'Phim bộ') {
    if (!totalEpisodes || totalEpisodes < 1) {
      return { isValid: false, error: 'Phim bộ phải có ít nhất 1 tập' };
    }
    
    if (totalEpisodes > 10000) {
      return { isValid: false, error: 'Số tập không được vượt quá 10000' };
    }
  }
  
  return { isValid: true };
};

// Sort movies
export const sortMovies = (
  movies: Movie[], 
  sortBy: 'id' | 'title' | 'releaseYear' | 'view' | 'createdAt' = 'id', 
  order: 'asc' | 'desc' = 'asc'
): Movie[] => {
  return [...movies].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'releaseYear':
        aValue = a.releaseYear;
        bValue = b.releaseYear;
        break;
      case 'view':
        aValue = a.view;
        bValue = b.view;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = Number(a.id);
        bValue = Number(b.id);
    }
    
    if (order === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
};

// Filter movies by search query
export const filterMoviesByQuery = (movies: Movie[], searchQuery: string): Movie[] => {
  if (!searchQuery.trim()) return movies;
  
  const query = searchQuery.toLowerCase().trim();
  return movies.filter(movie => 
    movie.title.toLowerCase().includes(query) ||
    movie.originalName.toLowerCase().includes(query) ||
    movie.director.toLowerCase().includes(query)
  );
};

// Filter movies by release year
export const filterMoviesByYear = (movies: Movie[], year: number | null): Movie[] => {
  if (!year) return movies;
  
  return movies.filter(movie => movie.releaseYear === year);
};

// Filter movies by type
export const filterMoviesByType = (movies: Movie[], type: string): Movie[] => {
  if (!type || type === 'all') return movies;
  
  return movies.filter(movie => movie.type === type);
};

// Filter movies by status
export const filterMoviesByStatus = (movies: Movie[], status: string): Movie[] => {
  if (!status || status === 'all') return movies;
  
  return movies.filter(movie => movie.status === status);
};

// Filter movies by language
export const filterMoviesByLang = (movies: Movie[], lang: string): Movie[] => {
  if (!lang || lang === 'all') return movies;
  
  return movies.filter(movie => movie.lang === lang);
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'hoàn thành':
      return 'text-green-700 bg-green-100';
    case 'ongoing':
    case 'đang chiếu':
      return 'text-blue-700 bg-blue-100';
    case 'hiatus':
    case 'tạm dừng':
      return 'text-yellow-700 bg-yellow-100';
    case 'cancelled':
    case 'đã hủy':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// Get status text in Vietnamese
export const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Hoàn thành';
    case 'ongoing':
      return 'Đang chiếu';
    case 'hiatus':
      return 'Tạm dừng';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

// Get type color
export const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'movie':
    case 'phim lẻ':
      return 'text-purple-700 bg-purple-100';
    case 'series':
    case 'phim bộ':
      return 'text-blue-700 bg-blue-100';
    case 'hoathinh':
    case 'hoạt hình':
      return 'text-pink-700 bg-pink-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// Get type text in Vietnamese
export const getTypeText = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'movie':
      return 'Phim lẻ';
    case 'series':
      return 'Phim bộ';
    case 'hoathinh':
      return 'Hoạt hình';
    default:
      return type;
  }
};

// Get language color
export const getLangColor = (lang: string): string => {
  switch (lang.toLowerCase()) {
    case 'vietsub':
      return 'text-green-700 bg-green-100';
    case 'thuyết minh':
    case 'thuyet minh':
      return 'text-blue-700 bg-blue-100';
    case 'lồng tiếng':
    case 'long tieng':
      return 'text-orange-700 bg-orange-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// Format view count
export const formatViewCount = (viewCount: number): string => {
  if (viewCount >= 1000000) {
    return (viewCount / 1000000).toFixed(1) + 'M';
  } else if (viewCount >= 1000) {
    return (viewCount / 1000).toFixed(1) + 'K';
  }
  return viewCount.toString();
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

// Get available movie types
export const getMovieTypes = (): Array<{value: string, label: string}> => [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'Movie', label: 'Phim lẻ' },
  { value: 'Series', label: 'Phim bộ' },
  { value: 'hoathinh', label: 'Hoạt hình' }
];

// Get available movie statuses
export const getMovieStatuses = (): Array<{value: string, label: string}> => [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Ongoing', label: 'Đang chiếu' },
  { value: 'Hiatus', label: 'Tạm dừng' },
  { value: 'Cancelled', label: 'Đã hủy' }
];

// Get available languages
export const getMovieLanguages = (): Array<{value: string, label: string}> => [
  { value: 'all', label: 'Tất cả ngôn ngữ' },
  { value: 'Vietsub', label: 'Vietsub' },
  { value: 'Thuyết minh', label: 'Thuyết minh' },
  { value: 'Lồng tiếng', label: 'Lồng tiếng' }
];

// Get country names from movie
export const getCountryNames = (movie: Movie): string => {
  return movie.country.map(country => country.countryName).join(', ');
};

// Get genre names from movie
export const getGenreNames = (movie: Movie): string => {
  return movie.genres.map(genre => genre.genresName).join(', ');
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate movie slug
export const generateMovieSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Check if movie is series
export const isSeriesMovie = (movie: Movie): boolean => {
  return movie.type === 'Series' || movie.type === 'Phim bộ';
};

// Check if movie has episodes
export const hasEpisodes = (movie: Movie): boolean => {
  return movie.episodes !== undefined && movie.episodes.length > 0;
};