import { Genre } from '@/types/Genres';
import { mockGenres } from '@/mocksData/mockGenres';

export class GenresService {
  private static genres: Genre[] = [...mockGenres];

  // Lấy tất cả thể loại
  static async getAllGenres(): Promise<Genre[]> {
    // Simulate API delay
    return [...this.genres];
  }

  // Lấy thể loại theo ID
  static async getGenreById(id: number): Promise<Genre | null> {
    return this.genres.find(genre => genre.id === id) || null;
  }

  // Thêm thể loại mới
  static async addGenre(genreData: Omit<Genre, 'id'>): Promise<Genre> {
    
    const newGenre: Genre = {
      id: Math.max(...this.genres.map(g => g.id), 0) + 1,
      ...genreData
    };
    
    this.genres.push(newGenre);
    return newGenre;
  }

  // Cập nhật thể loại
  static async updateGenre(id: number, genreData: Partial<Genre>): Promise<Genre | null> {
    
    const index = this.genres.findIndex(genre => genre.id === id);
    if (index === -1) return null;
    
    this.genres[index] = { ...this.genres[index], ...genreData };
    return this.genres[index];
  }

  // Xóa thể loại
  static async deleteGenre(id: number): Promise<boolean> {
    
    const index = this.genres.findIndex(genre => genre.id === id);
    if (index === -1) return false;
    
    this.genres.splice(index, 1);
    return true;
  }

  // Kiểm tra tên thể loại đã tồn tại
  static async checkGenreNameExists(name: string, excludeId?: number): Promise<boolean> {
    
    return this.genres.some(genre => 
      genre.genresName.toLowerCase() === name.toLowerCase() && 
      genre.id !== excludeId
    );
  }

  // Lấy số lượng phim theo thể loại (tạm thời trả về random)
  static async getMovieCountByGenre(genreId: number): Promise<number> {
    // Tạm thời trả về số ngẫu nhiên, sau này sẽ thay bằng query thực tế
    return Math.floor(Math.random() * 50);
  }

  // Lấy thống kê tổng quan
  static async getGenreStats(): Promise<{
    total: number;
    mostPopular: Genre | null;
    leastPopular: Genre | null;
    totalMovies: number;
  }> {
    
    const total = this.genres.length;
    const totalMovies = Math.floor(Math.random() * 1000); // Tạm thời
    
    return {
      total,
      mostPopular: this.genres[0] || null,
      leastPopular: this.genres[this.genres.length - 1] || null,
      totalMovies
    };
  }
}