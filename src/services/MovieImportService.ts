// Service for auto importing and updating movies

class MovieImportService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  async autoImportMovies(apiUrl?: string, count: number = 10): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/movies/auto-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header if needed
          // 'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          apiUrl: apiUrl || null,
          count
        }),
      });

      if (!response.ok) {
        throw new Error('Thêm phim tự động thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Auto import movies error:', error);
      throw error;
    }
  }

  async updateMovies(apiUrl?: string, count: number = 10): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/movies/auto-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header if needed
          // 'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          apiUrl: apiUrl || null,
          count
        }),
      });

      if (!response.ok) {
        throw new Error('Cập nhật phim tự động thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Auto update movies error:', error);
      throw error;
    }
  }

  async getImportStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/movies/import-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header if needed
          // 'Authorization': `Bearer ${getToken()}`
        },
      });

      if (!response.ok) {
        throw new Error('Lấy trạng thái import thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Get import status error:', error);
      throw error;
    }
  }
}

export default new MovieImportService();