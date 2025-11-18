// Service for auto importing and updating movies

class MovieImportService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

  async autoImportMovies(slug: string, count: number = 10): Promise<any> {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/movies/add-new?slug=${slug}&moviesToAdd=${count}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
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

  async updateMovies(slug: string, maxPages: number = 5): Promise<any> {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/movies/update-existing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          slug: slug,
          maxPages: maxPages
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
}

export default new MovieImportService();