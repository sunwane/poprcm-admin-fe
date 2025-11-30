import { Country, ApiResponse } from '@/types/Country';
import { mockCountries } from '@/mocksData/mockCountries';

export class CountryService {
  private static countries: Country[] = [];
  private static isDataLoaded = false;
  private static readonly API_BASE_URL = 'http://localhost:8088/api/countries';

  // Kiểm tra service availability từ localStorage (giống AuthService)
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Lấy dữ liệu từ API lần đầu
  private static async loadCountriesFromApi(): Promise<void> {
    if (this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.countries = [...mockCountries];
      this.isDataLoaded = true;
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<Country[]> = await response.json();
      if (apiResponse.result && Array.isArray(apiResponse.result)) {
        this.countries = apiResponse.result;
        this.isDataLoaded = true;
      }
      
    } catch (error) {
      console.warn('Failed to load countries from API, using mock data:', error);
    }
  }

  // Lấy tất cả quốc gia
  static async getAllCountries(): Promise<Country[]> {
    await this.loadCountriesFromApi();
    return [...this.countries];
  }

  // Lấy quốc gia theo ID
  static async getCountryById(id: string): Promise<Country | null> {
    await this.loadCountriesFromApi();
    return this.countries.find(country => country.id === id) || null;
  }

    static async addCountry(countryData: Omit<Country, 'id'>): Promise<Country> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, adding country locally');
      await this.loadCountriesFromApi();
      const newCountry: Country = {
        id: (this.countries.length + 1).toString(),
        ...countryData
      };
      this.countries.push(newCountry);
      return newCountry;
    }
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(countryData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newCountry: Country = await response.json();
      // Refresh cache sau khi thêm thành công
      this.isDataLoaded = false;
      this.countries = [];
      return newCountry;
    } catch (error) {
      console.warn('Failed to add country via API, falling back to local add:', error);
      throw error;
    }
  }

  static async updateCountry(id: string, countryData: Partial<Country>): Promise<Country | null> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, updating country locally');
      await this.loadCountriesFromApi();
    
      const index = this.countries.findIndex(country => country.id === id);
      if (index === -1) return null;
      
      this.countries[index] = { ...this.countries[index], ...countryData };
      return this.countries[index];
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(countryData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedCountry: Country = await response.json();
      // Refresh cache sau khi cập nhật thành công
      this.isDataLoaded = false;
      this.countries = [];
      return updatedCountry;
    } catch (error) {
      console.warn('Failed to update country via API, falling back to local update:', error);
      throw error;
    }
  }

  // Xóa quốc gia (chỉ local)
  static async deleteCountry(id: string): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, deleting country locally');
      await this.loadCountriesFromApi();
      const initialLength = this.countries.length;
      this.countries = this.countries.filter(country => country.id !== id);
      return this.countries.length < initialLength;
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
      // Refresh cache sau khi xóa thành công
      this.isDataLoaded = false;
      this.countries = [];
      return true;
    } catch (error) {
      console.warn('Failed to delete country via API, falling back to local delete:', error);
      throw error;
    }
  }

  // Kiểm tra tên quốc gia đã tồn tại
  static async checkCountryNameExists(name: string, excludeId?: string): Promise<boolean> {
    await this.loadCountriesFromApi();
    
    return this.countries.some(country => 
      country.name.toLowerCase() === name.toLowerCase() && 
      country.id !== excludeId
    );
  }

  // Refresh data từ API
  static async refreshCountriesFromApi(): Promise<Country[]> {
    this.isDataLoaded = false;
    this.countries = [];
    return await this.getAllCountries();
  }

  // Sync countries từ localhost API
  static async syncCountries(): Promise<{
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
      await this.refreshCountriesFromApi();
      
      return {
        success: true,
        message: result.message || 'Countries synced successfully'
      };

    } catch (error) {
      console.error('Sync countries error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Lấy số lượng phim theo quốc gia (mock)
  static async getMovieCountByCountry(countryId: string): Promise<number> {
    const seed = parseInt(countryId) || 1;
    return Math.abs(Math.floor((Math.sin(seed * 2) * 10000) % 100) + Math.floor(Math.random() * 50));
  }

  // Lấy thống kê tổng quan
  static async getCountryStats(): Promise<{
    total: number;
    mostPopular: Country | null;
    leastPopular: Country | null;
    totalMovies: number;
    countriesWithMovies: number;
    avgMoviesPerCountry: number;
    fromApi: boolean;
  }> {
    await this.loadCountriesFromApi();
    const isApiUp = this.isServiceAvailable();
    
    const total = this.countries.length;
    const totalMovies = Math.floor(Math.random() * 2000) + 1000; // Tạm thời
    
    return {
      total,
      mostPopular: this.countries[0] || null,
      leastPopular: this.countries[this.countries.length - 1] || null,
      totalMovies,
      countriesWithMovies: Math.floor(total * 0.8), // 80% countries have movies
      avgMoviesPerCountry: total > 0 ? Math.round(totalMovies / total) : 0,
      fromApi: this.isDataLoaded && isApiUp
    };
  }

  // Search countries theo tên
  static async searchCountries(query: string): Promise<Country[]> {
    await this.loadCountriesFromApi();
    
    if (!query.trim()) return this.countries;
    
    const searchTerm = query.toLowerCase().trim();
    return this.countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm)
    );
  }
}