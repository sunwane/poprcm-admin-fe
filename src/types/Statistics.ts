// Types cho Statistics API responses
export interface DashboardStats {
  // Tổng quan
  totalMovies: number;
  totalUsers: number;
  totalCountries: number;
  totalGenres: number;
  totalSeries: number;
  totalActors: number;

  // Phim theo định dạng
  moviesAnimation: number;
  moviesSeries: number;
  moviesSingle: number;

  // Trung bình
  avgMoviesPerCountry: number;
  avgMoviesPerGenre: number;
  avgMoviesPerSeries: number;
  avgMoviesPerActor: number;

  // Thống kê user
  usersByRole: { [key: string]: number };
  usersByGender: { [key: string]: number };

  // Thống kê actor
  actorsByGender: { [key: string]: number };

  // Thống kê phim
  avgMovieScore: number;
  moviesByStatus: { [key: string]: number };

  // Hoạt động gần đây
  lastEpisodeUpdate: string;
  episodesUpdatedToday: number;
  lastMovieSync: string;
  moviesSyncedToday: number;

  // Biểu đồ user theo ngày
  userDailyStats: UserDailyStats[];

  // Hoạt động mới nhất
  recentActivities: RecentActivity[];

  // 3 phim mới nhất
  latestMovies: any[];
}

export interface UserDailyStats {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface RecentActivity {
  type: string; // WATCH, FAVORITE, COMMENT
  userName?: string;
  userAvatar?: string;
  movieTitle?: string;
  movieId?: string;
  episodeTitle?: string;
  content?: string; // Nội dung comment nếu có
  timestamp: string;
}

// Entity Stats Response
export interface EntityStatsResponse {
  entityType: string; // "country", "genre", "user", "movie", "series", "actor"
  
  // Cho country & genre (danh sách chi tiết)
  countries?: CountryStatsDetail[];
  genres?: GenreStatsDetail[];
  
  // Cho user, movie, series, actor (thống kê tổng quan)
  total?: number;
  avgMoviesPerEntity?: number;
  breakdown?: { [key: string]: number };
  lastUpdate?: string;
}

export interface CountryStatsDetail {
  id: string;
  name: string;
  code?: string;
  totalMovies: number;
  moviesSeries: number;
  moviesSingle: number;
  moviesAnimation: number;
  lastUpdate?: string;
}

export interface GenreStatsDetail {
  id: string;
  genresName: string;
  totalMovies: number;
  moviesSeries: number;
  moviesSingle: number;
  moviesAnimation: number;
  lastUpdate?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  result: T;
  message?: string;
  status?: string;
}

// Statistics Service error type
export interface StatisticsError {
  message: string;
  code?: string;
  details?: any;
}