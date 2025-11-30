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

  // Load data from API or mock with pagination support
  private static async loadCountriesData(page: number = 0, size: number = 1000): Promise<Country[] | void> {
    // For paginated calls, don't use cache
    const isGettingAll = size >= 1000;
    if (isGettingAll && this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.countries = [...mockCountries];
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
        const mappedCountries = apiResponse.result.content.map((item: any) => ({
          id: item.id,
          name: item.name
        }));
        
        // For paginated calls, return the data directly without caching
        if (!isGettingAll) {
          return mappedCountries;
        }
        
        // For getting all countries, cache the data  
        this.countries = mappedCountries;
        this.isDataLoaded = true;
      } 
      // Handle direct array response (for getAllCountries compatibility)
      else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        const mappedCountries = apiResponse.result.map((item: any) => ({
          id: item.id,
          name: item.name
        }));
        
        // For getting all countries, cache the data
        this.countries = mappedCountries;
        this.isDataLoaded = true;
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load countries from API, using mock data:', error);
    }
  }

  // Deprecated - kept for backward compatibility
  private static async loadCountriesFromApi(): Promise<void> {
    await this.loadCountriesData();
  }

  // Get countries with pagination (similar to MoviesService)
  static async getCountriesPaginated(page: number = 0, size: number = 10): Promise<Country[]> {
    const result = await this.loadCountriesData(page, size);
    
    if (result) {
      // Paginated call returned data directly
      return result;
    }
    
    // Fallback to cached data with manual pagination
    if (this.countries.length === 0) {
      await this.loadCountriesData();
    }
    
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return this.countries.slice(startIndex, endIndex);
  }

  // Get total count of countries (for pagination calculation)
  static async getTotalCountriesCount(): Promise<number> {
    if (!this.isServiceAvailable()) {
      return mockCountries.length;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      // Get first page to check total from response metadata
      const response = await fetch(`${this.API_BASE_URL}/paginated?page=0&size=1`, {
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
        await this.loadCountriesData();
        return this.countries.length;
      } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        return apiResponse.result.length;
      }
      
      throw new Error('Cannot determine total count from API response');
      
    } catch (error) {
      console.warn('Failed to get total count from API, using mock data count:', error);
      return mockCountries.length;
    }
  }

  // Lấy tất cả quốc gia (giữ nguyên cho backward compatibility)
  static async getAllCountries(): Promise<Country[]> {
    await this.loadCountriesData();
    return [...this.countries];
  }

  // Lấy quốc gia theo ID
  static async getCountryById(id: string): Promise<Country | null> {
    await this.loadCountriesData();
    return this.countries.find(country => country.id === id) || null;
  }

    static async addCountry(countryData: Omit<Country, 'id'>): Promise<Country> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, adding country locally');
      await this.loadCountriesData();
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
      await this.loadCountriesData();
    
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
      await this.loadCountriesData();
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
    await this.loadCountriesData();
    
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



  // Search countries với API integration và pagination
  static async searchCountries(query: string, page: number = 0, size: number = 20): Promise<Country[]> {
    if (!query.trim()) {
      return await this.getCountriesPaginated(page, size);
    }

    if (!this.isServiceAvailable()) {
      // Mock data search với pagination
      await this.loadCountriesData();
      const searchTerm = query.toLowerCase().trim();
      const filtered = this.countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
      );
      const startIndex = page * size;
      const endIndex = startIndex + size;
      return filtered.slice(startIndex, endIndex);
    }

    try {
      // API call for search với pagination
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
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
          name: item.name
        }));
      } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        return apiResponse.result.map((item: any) => ({
          id: item.id,
          name: item.name
        }));
      }
      return [];
      
    } catch (error) {
      // Fallback to local search
      console.warn('Search API failed, falling back to local search:', error);
      await this.loadCountriesData();
      const searchTerm = query.toLowerCase().trim();
      const filtered = this.countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
      );
      const startIndex = page * size;
      const endIndex = startIndex + size;
      return filtered.slice(startIndex, endIndex);
    }
  }

  // Get total count for search results
  static async getSearchCountriesCount(query: string): Promise<number> {
    if (!query.trim()) {
      return await this.getTotalCountriesCount();
    }

    if (!this.isServiceAvailable()) {
      await this.loadCountriesData();
      const searchTerm = query.toLowerCase().trim();
      return this.countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
      ).length;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=0&size=1`, {
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
      
      if (apiResponse.result && apiResponse.result.totalElements !== undefined) {
        return apiResponse.result.totalElements;
      }
      
      // Fallback - get all search results to count
      const allResults = await this.searchCountries(query, 0, 1000);
      return allResults.length;
      
    } catch (error) {
      console.warn('Failed to get search count from API, using fallback:', error);
      await this.loadCountriesData();
      const searchTerm = query.toLowerCase().trim();
      return this.countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
      ).length;
    }
  }
}