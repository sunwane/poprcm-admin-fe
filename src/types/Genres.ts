export interface Genre {
  id: string;
  genresName: string;
  movieCount?: number; // CẬP NHẬT: Thêm thuộc tính movieCount
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result: T;
}