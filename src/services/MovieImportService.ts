// Service for auto importing and updating movies

import { MoviesService } from "./MoviesService";

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

      await MoviesService.loadMoviesData(); // Refresh movie list after import
      return await response.json();
    } catch (error) {
      console.error('Auto import movies error:', error);
      throw error;
    }
  }

  async updateMovies(slug: string, maxPages: number = 5): Promise<any> {
    try {
      console.log('Starting auto update movies with slug:', slug, 'and maxPages:', maxPages);

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/movies/update-existing?slug=${slug}&maxPages=${maxPages}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
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