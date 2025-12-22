import { 
  DashboardStats, 
  EntityStatsResponse, 
  CountryStatsDetail, 
  GenreStatsDetail,
  ApiResponse,
} from '../types/Statistics';
import HttpInterceptor from './HttpInterceptor';

export class StatisticsService {
  private static readonly API_BASE_URL = 'http://localhost:8088/api/statistics';
  private static dashboardStatsCache: DashboardStats | null = null;
  private static entityStatsCache: Map<string, EntityStatsResponse> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Kiểm tra service availability từ localStorage
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Kiểm tra cache có hợp lệ không
  private static isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  // Lấy auth token
  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Lấy thống kê dashboard tổng quan
   * @param month - Tháng theo format YYYY-MM (optional, default = tháng hiện tại)
   */
  static async getDashboardStats(month?: string): Promise<DashboardStats | null> {
    const cacheKey = `dashboard-${month || 'current'}`;
    
    // Kiểm tra cache trước
    if (this.isCacheValid(cacheKey) && this.dashboardStatsCache) {
      console.log('Using cached dashboard stats');
      return this.dashboardStatsCache;
    }

    if (!this.isServiceAvailable()) {
      console.info('Statistics API not available');
      return null;
    }

    try {
      const url = month 
        ? `${this.API_BASE_URL}/dashboard?month=${month}`
        : `${this.API_BASE_URL}/dashboard`;

      const response = await HttpInterceptor.fetchWithAuth(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Dashboard API failed: ${response.status} ${response.statusText}`);
      }

      const apiResponse: ApiResponse<DashboardStats> = await response.json();
      
      if (!apiResponse.result) {
        throw new Error('Invalid dashboard stats response');
      }

      // Cache kết quả
      this.dashboardStatsCache = apiResponse.result;
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      console.log('Dashboard stats loaded successfully from API');
      return apiResponse.result;

    } catch (error) {
      console.warn('Failed to load dashboard stats from API:', error);
      return null;
    }
  }

  /**
   * Lấy thống kê chi tiết theo loại entity
   * @param entityType - Loại entity: "country", "genre", "user", "movie", "series", "actor"
   */
  static async getEntityStats(entityType: string): Promise<EntityStatsResponse | null> {
    const cacheKey = `entity-${entityType}`;
    
    // Kiểm tra cache trước
    if (this.isCacheValid(cacheKey)) {
      const cached = this.entityStatsCache.get(entityType);
      if (cached) {
        console.log(`Using cached ${entityType} stats`);
        return cached;
      }
    }

    if (!this.isServiceAvailable()) {
      console.info('Statistics API not available');
      return null;
    }

    try {
      const response = await HttpInterceptor.fetchWithAuth(`${this.API_BASE_URL}/details/${entityType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Entity stats API failed: ${response.status} ${response.statusText}`);
      }

      const apiResponse: ApiResponse<EntityStatsResponse> = await response.json();
      
      if (!apiResponse.result) {
        throw new Error(`Invalid ${entityType} stats response`);
      }

      // Cache kết quả
      this.entityStatsCache.set(entityType, apiResponse.result);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      console.log(`${entityType} stats loaded successfully from API`);
      return apiResponse.result;

    } catch (error) {
      console.warn(`Failed to load ${entityType} stats from API:`, error);
      return null;
    }
  }

  /**
   * Lấy thống kê countries chi tiết
   */
  static async getCountryStats(): Promise<CountryStatsDetail[] | null> {
    const entityStats = await this.getEntityStats('country');
    return entityStats?.countries || null;
  }

  /**
   * Lấy thống kê genres chi tiết
   */
  static async getGenreStats(): Promise<GenreStatsDetail[] | null> {
    const entityStats = await this.getEntityStats('genre');
    return entityStats?.genres || null;
  }

  /**
   * Lấy tổng số lượng từ dashboard stats (thay thế getTotalCount)
   */
  static async getTotalCounts(): Promise<{
    totalCountries: number;
    totalGenres: number;
    totalMovies: number;
    totalUsers: number;
    totalSeries: number;
    totalActors: number;
  } | null> {
    const dashboardStats = await this.getDashboardStats();
    
    if (!dashboardStats) {
      return null;
    }

    return {
      totalCountries: dashboardStats.totalCountries,
      totalGenres: dashboardStats.totalGenres,
      totalMovies: dashboardStats.totalMovies,
      totalUsers: dashboardStats.totalUsers,
      totalSeries: dashboardStats.totalSeries,
      totalActors: dashboardStats.totalActors
    };
  }

  /**
   * Clear cache cho một entity cụ thể hoặc toàn bộ
   */
  static clearCache(entityType?: string): void {
    if (entityType) {
      this.entityStatsCache.delete(entityType);
      this.cacheExpiry.delete(`entity-${entityType}`);
      console.log(`Cleared cache for ${entityType}`);
    } else {
      this.dashboardStatsCache = null;
      this.entityStatsCache.clear();
      this.cacheExpiry.clear();
      console.log('Cleared all statistics cache');
    }
  }

  /**
   * Refresh thống kê - xóa cache và tải lại
   */
  static async refreshStats(entityType?: string): Promise<void> {
    this.clearCache(entityType);
    
    if (entityType) {
      await this.getEntityStats(entityType);
    } else {
      await this.getDashboardStats();
    }
  }

  /**
   * Kiểm tra kết nối API statistics
   */
  static async checkApiHealth(): Promise<boolean> {
    try {
      const authToken = this.getAuthToken();
      if (!authToken) {
        return false;
      }

      const response = await fetch(`${this.API_BASE_URL}/dashboard`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.warn('Statistics API health check failed:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin về việc có nên sử dụng Statistics API hay không
   * Giúp các service khác quyết định có bypass getTotalCount API calls hay không
   */
  static async shouldUseStatisticsForCounts(): Promise<boolean> {
    // Nếu service không available, return false
    if (!this.isServiceAvailable()) {
      return false;
    }

    // Kiểm tra có cache dashboard stats không
    if (this.dashboardStatsCache && this.isCacheValid('dashboard-current')) {
      return true;
    }

    // Thử lấy dashboard stats
    try {
      const stats = await this.getDashboardStats();
      return stats !== null;
    } catch (error) {
      console.warn('Statistics Service not usable for counts:', error);
      return false;
    }
  }
}