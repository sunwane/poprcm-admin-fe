import { Genre, ApiResponse } from '@/types/Genres';
import { mockGenres } from '@/mocksData/mockGenres';

export class GenresService {
  private static genres: Genre[] = [];
  private static isDataLoaded = false;
  private static readonly API_BASE_URL = 'http://localhost:8088/api/genres';

  // Kiểm tra service availability từ localStorage (giống AuthService)
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Lấy dữ liệu từ API lần đầu
  private static async loadGenresFromApi(): Promise<void> {
    if (this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.genres = [...mockGenres];
      this.isDataLoaded = true;
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<Genre[]> = await response.json();
      
      // Chuyển đổi từ GenreResponse sang Genre (nếu cần)
      if (apiResponse.result && Array.isArray(apiResponse.result)) {
        this.genres = apiResponse.result.map(item => ({
          id: item.id,
          genresName: item.genresName
        }));
        this.isDataLoaded = true;
        console.log('Loaded genres from API:', this.genres.length);
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load genres from API, using mock data:', error);
      // Fallback to mock data nếu API fail
      this.genres = [...mockGenres];
      this.isDataLoaded = true;
    }
  }

  // Lấy tất cả thể loại
  static async getAllGenres(): Promise<Genre[]> {
    await this.loadGenresFromApi();
    return [...this.genres];
  }

  // Lấy thể loại theo ID
  static async getGenreById(id: string): Promise<Genre | null> {
    await this.loadGenresFromApi();
    return this.genres.find(genre => genre.id === id) || null;
  }

  // Thêm thể loại mới (chỉ local - không gửi lên API)
  static async addGenre(genreData: Omit<Genre, 'id'>): Promise<Genre> {
    await this.loadGenresFromApi();
    
    const newGenre: Genre = {
      id: (Math.max(...this.genres.map(g => Number(g.id)), 0) + 1).toString(),
      ...genreData
    };
    
    this.genres.push(newGenre);
    return newGenre;
  }

  // Cập nhật thể loại (chỉ local)
  static async updateGenre(id: string, genreData: Partial<Genre>): Promise<Genre | null> {
    await this.loadGenresFromApi();
    
    const index = this.genres.findIndex(genre => genre.id === id);
    if (index === -1) return null;
    
    this.genres[index] = { ...this.genres[index], ...genreData };
    return this.genres[index];
  }

  // Xóa thể loại (chỉ local)
  static async deleteGenre(id: string): Promise<boolean> {
    await this.loadGenresFromApi();
    
    const index = this.genres.findIndex(genre => genre.id === id);
    if (index === -1) return false;
    
    this.genres.splice(index, 1);
    return true;
  }

  // Kiểm tra tên thể loại đã tồn tại
  static async checkGenreNameExists(name: string, excludeId?: string): Promise<boolean> {
    await this.loadGenresFromApi();
    
    return this.genres.some(genre => 
      genre.genresName.toLowerCase() === name.toLowerCase() && 
      genre.id !== excludeId
    );
  }

  // Refresh data từ API
  static async refreshGenresFromApi(): Promise<Genre[]> {
    this.isDataLoaded = false;
    this.genres = [];
    return await this.getAllGenres();
  }

  // Sync genres từ localhost API
  static async syncGenres(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!this.isServiceAvailable()) {
      return {
        success: false,
        message: 'API service is not available. Please try again later.'
      };
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
      });

      console.log('Auth Token used for sync:', localStorage.getItem("authToken"));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<string> = await response.json();

      // Refresh local data after sync
      await this.refreshGenresFromApi();
      
      return {
        success: true,
        message: result.message || 'Genres synced successfully'
      };

    } catch (error) {
      console.error('Sync genres error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Lấy số lượng phim theo thể loại (API khác hoặc mock)
  static async getMovieCountByGenre(genreId: string): Promise<number> {
    const seed = parseInt(genreId) || 1;
    return Math.abs(Math.floor((Math.sin(seed) * 10000) % 50) + Math.floor(Math.random() * 20));
  }

  // Lấy thống kê tổng quan
  static async getGenreStats(): Promise<{
    total: number;
    mostPopular: Genre | null;
    leastPopular: Genre | null;
    totalMovies: number;
    fromApi: boolean;
  }> {
    await this.loadGenresFromApi();
    const isApiUp = this.isServiceAvailable();
    
    const total = this.genres.length;
    const totalMovies = Math.floor(Math.random() * 1000) + 500; // Tạm thời
    
    return {
      total,
      mostPopular: this.genres[0] || null,
      leastPopular: this.genres[this.genres.length - 1] || null,
      totalMovies,
      fromApi: this.isDataLoaded && isApiUp
    };
  }

  // Lấy genres theo slug (nếu cần sau này)
  static async getGenreBySlug(slug: string): Promise<Genre | null> {
    await this.loadGenresFromApi();
    // Tạm thời return null vì chưa lưu slug trong Genre type
    return null;
  }

  // Search genres theo tên
  static async searchGenres(query: string): Promise<Genre[]> {
    await this.loadGenresFromApi();
    
    if (!query.trim()) return this.genres;
    
    const searchTerm = query.toLowerCase().trim();
    return this.genres.filter(genre => 
      genre.genresName.toLowerCase().includes(searchTerm)
    );
  }
}