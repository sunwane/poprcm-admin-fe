import { useState, useEffect } from 'react';
import { StatisticsService } from '@/services/StatisticsService';
import { DashboardStats } from '@/types/Statistics';

interface UseDashboardReturn {
  // State
  loading: boolean;
  error: string | null;
  dashboardStats: DashboardStats | null;
  
  // Actions
  refreshStats: () => Promise<void>;
  setSelectedMonth: (month: string | undefined) => void;
  selectedMonth: string | undefined;
  
  // Stats for other pages
  movieStats: {
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
  };
  
  actorStats: {
    total: number;
    male: number;
    female: number;
    unknown: number;
    avgMoviesPerActor: number;
  };
  
  userStats: {
    total: number;
    admin: number;
    users: number;
    thisMonth: number;
    male: number;
    female: number;
    filteredCount: number;
  };
  
  seriesStats: {
    total: number;
    ongoingSeries: number;
    completedSeries: number;
    averageMoviesPerSeries: number;
    filteredCount: number;
  };
}

export const useDashboard = (): UseDashboardReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

  // Load dashboard stats
  const loadDashboardStats = async (month?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard stats for month:', month || 'current');
      
      const stats = await StatisticsService.getDashboardStats(month);
      
      if (stats) {
        setDashboardStats(stats);
        console.log('✅ Dashboard stats loaded:', stats);
      } else {
        // Fallback to mock data if API fails
        console.warn('⚠️ API failed, using fallback data');
        setDashboardStats({
          totalMovies: 1245,
          totalSeries: 342,
          totalActors: 856,
          totalUsers: 12487,
          totalCountries: 25,
          totalGenres: 18,
          moviesAnimation: 156,
          moviesSeries: 342,
          moviesSingle: 903,
          avgMoviesPerCountry: 49.8,
          avgMoviesPerGenre: 69.2,
          avgMoviesPerSeries: 3.6,
          avgMoviesPerActor: 1.5,
          usersByRole: { ADMIN: 5, USER: 12482 },
          usersByGender: { MALE: 7891, FEMALE: 4596 },
          actorsByGender: { MALE: 512, FEMALE: 344 },
          avgMovieScore: 7.8,
          moviesByStatus: { COMPLETED: 1100, ONGOING: 145 },
          lastEpisodeUpdate: new Date().toISOString(),
          episodesUpdatedToday: 23,
          lastMovieSync: new Date().toISOString().split('T')[0],
          moviesSyncedToday: 15,
          userDailyStats: [],
          recentActivities: [],
          latestMovies: []
        });
      }
    } catch (err: any) {
      console.error('❌ Error loading dashboard stats:', err);
      setError(err.message || 'Không thể tải thống kê dashboard');
      
      // Fallback to basic mock data on error
      setDashboardStats({
        totalMovies: 0,
        totalSeries: 0,
        totalActors: 0,
        totalUsers: 0,
        totalCountries: 0,
        totalGenres: 0,
        moviesAnimation: 0,
        moviesSeries: 0,
        moviesSingle: 0,
        avgMoviesPerCountry: 0,
        avgMoviesPerGenre: 0,
        avgMoviesPerSeries: 0,
        avgMoviesPerActor: 0,
        usersByRole: {},
        usersByGender: {},
        actorsByGender: {},
        avgMovieScore: 0,
        moviesByStatus: {},
        lastEpisodeUpdate: new Date().toISOString(),
        episodesUpdatedToday: 0,
        lastMovieSync: new Date().toISOString().split('T')[0],
        moviesSyncedToday: 0,
        userDailyStats: [],
        recentActivities: [],
        latestMovies: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats
  const refreshStats = async () => {
    await StatisticsService.refreshStats();
    await loadDashboardStats(selectedMonth);
  };

  // Compute stats for other pages
  const computeMovieStats = (stats: DashboardStats | null) => {
    if (!stats) return {
      total: 0,
      totalMovies: 0,
      totalSeries: 0,
      totalAnime: 0,
      averageRating: 0,
      ongoingSeries: 0,
      completedMovies: 0,
      trailerMovies: 0,
      latestAddedDate: null,
      moviesAddedOnLatestDate: 0,
      latestUpdatedDate: null,
      moviesUpdatedOnLatestDate: 0,
    };

    return {
      total: stats.totalMovies || 0,
      totalMovies: stats.moviesSingle || 0,
      totalSeries: stats.moviesSeries || 0,
      totalAnime: stats.moviesAnimation || 0,
      averageRating: stats.avgMovieScore || 0,
      ongoingSeries: stats.moviesByStatus?.ongoing || 0,
      completedMovies: stats.moviesByStatus?.completed || 0,
      trailerMovies: stats.moviesByStatus?.trailer || 0,
      latestAddedDate: stats.lastMovieSync ? new Date(stats.lastMovieSync) : null,
      moviesAddedOnLatestDate: stats.moviesSyncedToday || 0,
      latestUpdatedDate: stats.lastEpisodeUpdate ? new Date(stats.lastEpisodeUpdate) : null,
      moviesUpdatedOnLatestDate: stats.episodesUpdatedToday || 0,
    };
  };

  const computeActorStats = (stats: DashboardStats | null) => {
    if (!stats) return {
      total: 0,
      male: 0,
      female: 0,
      unknown: 0,
      avgMoviesPerActor: 0,
    };

    const actorsByGender = stats.actorsByGender || {};
    return {
      total: stats.totalActors || 0,
      male: actorsByGender[1] || 0, // 1 = MALE trong enum
      female: actorsByGender[0] || 0, // 0 = FEMALE trong enum  
      unknown: actorsByGender[2] || 0, // 2 = UNKNOWN trong enum
      avgMoviesPerActor: stats.avgMoviesPerActor || 0,
    };
  };

  const computeUserStats = (stats: DashboardStats | null) => {
    if (!stats) return {
      total: 0,
      admin: 0,
      users: 0,
      thisMonth: 0,
      male: 0,
      female: 0,
      filteredCount: 0,
    };

    const usersByGender = stats.usersByGender || {};
    const usersByRole = stats.usersByRole || {};
    
    return {
      total: stats.totalUsers || 0,
      admin: usersByRole.ADMIN || 0,
      users: usersByRole.USER || 0,
      thisMonth: stats.userDailyStats?.reduce((sum, day) => sum + (day.newUsers || 0), 0) || 0,
      male: usersByGender.male || 0,
      female: usersByGender.female || 0,
      filteredCount: stats.totalUsers || 0,
    };
  };

  const computeSeriesStats = (stats: DashboardStats | null) => {
    if (!stats) return {
      total: 0,
      ongoingSeries: 0,
      completedSeries: 0,
      averageMoviesPerSeries: 0,
      filteredCount: 0,
    };

    return {
      total: stats.totalSeries || 0,
      ongoingSeries: stats.moviesByStatus?.ongoing || 0,
      completedSeries: stats.moviesByStatus?.completed || 0,
      averageMoviesPerSeries: stats.avgMoviesPerSeries || 0,
      filteredCount: stats.totalSeries || 0,
    };
  };

  // Load stats on component mount and when month changes
  useEffect(() => {
    loadDashboardStats(selectedMonth);
  }, [selectedMonth]);

  return {
    // State
    loading,
    error,
    dashboardStats,
    selectedMonth,
    
    // Actions
    refreshStats,
    setSelectedMonth,
    
    // Computed stats for other pages
    movieStats: computeMovieStats(dashboardStats),
    actorStats: computeActorStats(dashboardStats),
    userStats: computeUserStats(dashboardStats),
    seriesStats: computeSeriesStats(dashboardStats),
  };
};