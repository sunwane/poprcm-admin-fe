export interface Country {
  id: string;
  name: string;
  movieCount?: number;
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result: T;
}