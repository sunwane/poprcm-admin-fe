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

  // Load data from API or mock with pagination support
  private static async loadGenresData(page: number = 0, size: number = 1000): Promise<Genre[] | void> {
    // For paginated calls, don't use cache
    const isGettingAll = size >= 1000;
    if (isGettingAll && this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.genres = [...mockGenres];
      this.isDataLoaded = true;
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/paginated?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<any> = await response.json();
      
      // Handle paginated response
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        const mappedGenres = apiResponse.result.content.map((item: any) => ({
          id: item.id,
          genresName: item.genresName
        }));
        
        // For paginated calls, return the data directly without caching
        if (!isGettingAll) {
          return mappedGenres;
        }
        
        // For getting all genres, cache the data
        this.genres = mappedGenres;
        this.isDataLoaded = true;
      } 
      // Handle direct array response (non-paginated)
      else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        const mappedGenres = apiResponse.result.map((item: any) => ({
          id: item.id,
          genresName: item.genresName
        }));
        
        // For paginated calls, return paginated mock data
        if (!isGettingAll) {
          const startIndex = page * size;
          const endIndex = startIndex + size;
          return mappedGenres.slice(startIndex, endIndex);
        }
        
        // For getting all genres, cache the data
        this.genres = mappedGenres;
        this.isDataLoaded = true;
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load genres from API, using mock data:', error);
      // Fallback to mock data nếu API fail
      const fallbackGenres = [...mockGenres];
      
      // For paginated calls, return paginated mock data
      if (!isGettingAll) {
        const startIndex = page * size;
        const endIndex = startIndex + size;
        return fallbackGenres.slice(startIndex, endIndex);
      }
      
      // For getting all genres, cache the data
      this.genres = fallbackGenres;
      this.isDataLoaded = true;
    }
  }

  // Get genres with pagination
  static async getGenresPaginated(page: number = 0, size: number = 10): Promise<Genre[]> {
    const result = await this.loadGenresData(page, size);
    
    if (result) {
      // Paginated call returned data directly
      return result;
    }
    
    // Fallback to cached data with manual pagination
    if (this.genres.length === 0) {
      await this.loadGenresData();
    }
    
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return this.genres.slice(startIndex, endIndex);
  }

  // Get total count of genres (for pagination calculation)
  static async getTotalGenresCount(): Promise<number> {
    if (!this.isServiceAvailable()) {
      return mockGenres.length;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      // Get first page to check total from response metadata
      const response = await fetch(`${this.API_BASE_URL}?page=0&size=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<any> = await response.json();
      
      // Check if API response has total count metadata
      if (apiResponse.result && apiResponse.result.totalElements !== undefined) {
        return apiResponse.result.totalElements;
      } else if (apiResponse.result && apiResponse.result.content) {
        // If no total metadata, get all data to count
        await this.loadGenresData();
        return this.genres.length;
      } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        // Direct array response, return length
        return apiResponse.result.length;
      }
      
      throw new Error('Cannot determine total count from API response');
      
    } catch (error) {
      console.warn('Failed to get total count from API, using mock data count:', error);
      return mockGenres.length;
    }
  }

  // Lấy tất cả thể loại (giữ nguyên cho backward compatibility)
  static async getAllGenres(): Promise<Genre[]> {
    await this.loadGenresData();
    return [...this.genres];
  }

  // Lấy thể loại theo ID
  static async getGenreById(id: string): Promise<Genre | null> {
    await this.loadGenresData();
    return this.genres.find(genre => genre.id === id) || null;
  }

  // Thêm thể loại mới
  static async addGenre(genreData: Genre): Promise<Genre> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, adding genre locally');
      await this.loadGenresData();

      this.genres.push(genreData);
      return genreData;
    }
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(genreData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      
      
      // Update local cache
      await this.loadGenresData();
      this.genres.push(genreData);
      return genreData;
    } catch (error) {
      console.warn('Failed to add genre via API, falling back to local add:', error);
      throw error;
    }
  }

  // Cập nhật thể loại
  static async updateGenre(id: string, genreData: Partial<Genre>): Promise<Genre | null> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, updating genre locally');
      await this.loadGenresData();
    
      const index = this.genres.findIndex(genre => genre.id === id);
      if (index === -1) return null;
      
      this.genres[index] = { ...this.genres[index], ...genreData };
      return this.genres[index];
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(genreData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      console.log('API response for update genre:', apiResponse);
      
      // Update local cache
      await this.loadGenresData();
      const index = this.genres.findIndex(genre => genre.id === id);
      if (index !== -1) {
        this.genres[index] = genreData as Genre;
      }
      return this.genres[index];
    } catch (error) {
      console.warn('Failed to update genre via API, falling back to local update:', error);
      throw error;
    }
  }

  // Xóa thể loại
  static async deleteGenre(id: string): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, deleting genre locally');
      await this.loadGenresData();
      const initialLength = this.genres.length;
      this.genres = this.genres.filter(genre => genre.id !== id);
      return this.genres.length < initialLength;
    }
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update local cache
      await this.loadGenresData();
      const initialLength = this.genres.length;
      this.genres = this.genres.filter(genre => genre.id !== id);
      return this.genres.length < initialLength;
    } catch (error) {
      console.warn('Failed to delete genre via API, falling back to local delete:', error);
      throw error;
    }
  }

  // Kiểm tra tên thể loại đã tồn tại
  static async checkGenreNameExists(name: string, excludeId?: string): Promise<boolean> {
    await this.loadGenresData();
    
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

  // Lấy thống kê tổng quan
  static async getGenreStats(): Promise<{
    total: number;
    mostPopular: Genre | null;
    leastPopular: Genre | null;
    totalMovies: number;
    fromApi: boolean;
  }> {
    await this.loadGenresData();
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
    await this.loadGenresData();
    // Tạm thời return null vì chưa lưu slug trong Genre type
    return null;
  }

  // Search genres với API integration
  static async searchGenres(query: string): Promise<Genre[]> {
    if (!query.trim()) {
      return await this.getAllGenres();
    }

    if (!this.isServiceAvailable()) {
      // Mock data search
      await this.loadGenresData();
      const searchTerm = query.toLowerCase().trim();
      return this.genres.filter(genre => 
        genre.genresName.toLowerCase().includes(searchTerm)
      );
    }

    try {
      // API call for search
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<any> = await response.json();
      
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        return apiResponse.result.content.map((item: any) => ({
          id: item.id,
          genresName: item.genresName
        }));
      } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        return apiResponse.result.map((item: any) => ({
          id: item.id,
          genresName: item.genresName
        }));
      }
      return [];
      
    } catch (error) {
      // Fallback to local search
      console.warn('Search API failed, falling back to local search:', error);
      await this.loadGenresData();
      const searchTerm = query.toLowerCase().trim();
      return this.genres.filter(genre => 
        genre.genresName.toLowerCase().includes(searchTerm)
      );
    }
  }
}