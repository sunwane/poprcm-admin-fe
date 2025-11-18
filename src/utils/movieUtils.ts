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

// Thêm hàm tính điểm trung bình cho movie
const getMovieRating = (movie: Movie): number => {
  const imdbScore = movie.imdbScore || 0;
  const tmdbScore = movie.tmdbScore || 0;

  // Nếu cả hai điểm đều không hợp lệ, trả về -1 để xếp xuống dưới cùng
  if (imdbScore === 0 && tmdbScore === 0) return -1;

  // Tính trung bình của IMDb và TMDb (nếu cả hai đều hợp lệ)
  if (imdbScore > 0 && tmdbScore > 0) {
    return (imdbScore + tmdbScore) / 2;
  }

  // Nếu chỉ có IMDb hoặc TMDb hợp lệ, lấy điểm đó
  return imdbScore > 0 ? imdbScore : tmdbScore;
};

export const sortMovies = (
  movies: Movie[], 
  sortBy: 'id' | 'title' | 'releaseYear' | 'view' | 'createdAt' | 'modifiedAt' | 'rating', 
  sortOrder: 'asc' | 'desc'
): Movie[] => {
  return [...movies].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
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
      case 'modifiedAt':
        aValue = new Date(a.modifiedAt);
        bValue = new Date(b.modifiedAt);
        break;
      case 'rating':
        aValue = getMovieRating(a);
        bValue = getMovieRating(b);
        
        // Xử lý đặc biệt cho rating: những movie không có điểm (-1) sẽ được xếp xuống dưới cùng
        if (aValue === -1 && bValue === -1) return 0;
        if (aValue === -1) return sortOrder === 'asc' ? 1 : 1;
        if (bValue === -1) return sortOrder === 'asc' ? -1 : -1;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Filter movies by search query
export const filterMoviesByQuery = (movies: Movie[], searchQuery: string): Movie[] => {
  if (!searchQuery.trim()) return movies;
  
  const query = searchQuery.toLowerCase().trim();
  return movies.filter(movie => 
    (movie.title?.toLowerCase().includes(query)) ||
    (movie.originalName?.toLowerCase().includes(query)) ||
    (movie.director?.toLowerCase().includes(query))
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
export const getStatusColor = (status: string | null | undefined): string => {
  if (!status) {
    // Trả về màu mặc định nếu status không hợp lệ
    return 'text-gray-700 bg-gray-100';
  }

  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-green-700 bg-green-100';
    case 'ongoing':
      return 'text-blue-700 bg-blue-100';
    case 'hiatus':
    case 'trailer':
      return 'text-yellow-700 bg-yellow-100';
    case 'cancelled':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// Get status text in Vietnamese
export const getStatusText = (status: string | null | undefined): string => {
  if (!status) {
    // Trả về text mặc định nếu status không hợp lệ
    return 'Unknown';
  }

  switch (status.toLowerCase()) {
    case 'completed':
      return 'Completed';
    case 'ongoing':
      return 'Ongoing';
    case 'hiatus':
      return 'Hiatus';
    case 'trailer':
      return 'Trailer';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

// Get type color
export const getTypeColor = (type: string | null | undefined): string => {
  if (!type) {
    return 'text-gray-700 bg-gray-100';
  }

  switch (type.toLowerCase()) {
    case 'single':
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
export const getTypeText = (type: string | null | undefined): string => {
  if (!type) {
    return 'Unknown';
  }

  switch (type.toLowerCase()) {
    case 'single':
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
export const getLangColor = (lang: string | null | undefined): string => {
  if (!lang) {
    return 'text-gray-700 bg-gray-100';
  }

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
  { value: 'single', label: 'Phim lẻ' },
  { value: 'series', label: 'Phim bộ' },
  { value: 'hoathinh', label: 'Hoạt hình' }
];

// Get available movie statuses
export const getMovieStatuses = (): Array<{value: string, label: string}> => [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'cancelled', label: 'Đã hủy' }
];

// Get available languages
export const getMovieLanguages = (): Array<{value: string, label: string}> => [
  { value: 'all', label: 'Tất cả ngôn ngữ' },
  { value: 'Vietsub', label: 'Vietsub' },
  { value: 'Thuyết minh', label: 'Thuyết minh' },
  { value: 'Lồng tiếng', label: 'Lồng tiếng' },
  { value: 'Raw', label: 'Raw' },
  { value: 'Thuyết minh + Vietsub', label: 'Thuyết minh + Vietsub' }
];

// Get country names from movie
export const getCountryNames = (movie: Movie): string => {
  return movie.country.map(country => country.name).join(', ');
};

// Get genre names from movie
export const getGenreNames = (movie: Movie): string => {
  return movie.genres.map(genre => genre.genresName).join(', ');
};

// Truncate text
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate movie slug
export const generateMovieSlug = (title: string | null | undefined): string => {
  if (!title) return '';
  
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