import React from 'react';
import { SeriesMovie } from '@/types/Series';
import { Movie } from '@/types/Movies';

interface SeriesMovieFormProps {
  seriesMovies: SeriesMovie[];
  onSeriesMoviesChange: (movies: SeriesMovie[]) => void;
  disabled?: boolean;
  // Search props
  searchQuery: string;
  searchResults: Movie[];
  isSearching: boolean;
  showSearchResults: boolean;
  onSearchQueryChange: (query: string) => void;
  onAddMovie: (movie: Movie) => void;
  onRemoveMovie: (index: number) => void;
  // Drag props
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd: () => void;
}

const SeriesMovieForm: React.FC<SeriesMovieFormProps> = ({ 
  seriesMovies, 
  disabled = false,
  // Search props
  searchQuery,
  searchResults,
  isSearching,
  showSearchResults,
  onSearchQueryChange,
  onAddMovie,
  onRemoveMovie,
  // Drag props
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-blue-800 mb-6">Quản lý phim trong series</h4>
      
      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Thêm phim vào series
        </label>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm phim để thêm vào series..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              disabled={disabled}
              className="w-full p-3 px-5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => onAddMovie(movie)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                >
                  <img
                    src={movie.posterUrl || '/placeholder-poster.png'}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{movie.title}</p>
                    <p className="text-sm text-gray-500 truncate">{movie.originalName}</p>
                    <p className="text-xs text-gray-400">{movie.releaseYear} • {movie.duration}</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-3 mt-1">
              <p className="text-gray-500 text-center">Không tìm thấy phim nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Movies List Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Danh sách phim trong series ({seriesMovies.length})
          </label>
          {seriesMovies.length > 0 && !disabled && (
            <span className="text-xs text-gray-500">Kéo để sắp xếp thứ tự</span>
          )}
        </div>

        {seriesMovies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-1 16h12L17 4M9 8v8m6-8v8" />
            </svg>
            <p className="text-sm mb-2">Chưa có phim nào trong series</p>
            <p className="text-xs text-gray-400">Sử dụng thanh tìm kiếm phía trên để thêm phim</p>
          </div>
        ) : (
          <div className="space-y-2">
            {seriesMovies.map((seriesMovie, index) => (
              <div
                key={seriesMovie.id}
                draggable={!disabled}
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, index)}
                onDragEnd={onDragEnd}
                className={`
                  bg-white border border-gray-200 rounded-lg p-3 flex items-center space-x-3 transition-all
                  ${disabled ? '' : 'cursor-move hover:shadow-md'}
                  ${draggedIndex === index ? 'opacity-50 transform rotate-1 shadow-lg' : ''}
                  ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 bg-blue-50' : ''}
                  ${disabled ? 'cursor-default' : ''}
                `}
              >
                {/* Drag Handle */}
                {!disabled && (
                  <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                )}

                {/* Season Number */}
                <div className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {seriesMovie.seasonNumber}
                </div>

                {/* Movie Poster */}
                <img
                  src={seriesMovie.movie?.posterUrl || '/placeholder-poster.png'}
                  alt={seriesMovie.movie?.title}
                  className="w-10 h-14 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-poster.png';
                  }}
                />

                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">
                    {seriesMovie.movie?.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {seriesMovie.movie?.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {seriesMovie.movie?.releaseYear} • {seriesMovie.movie?.duration}
                  </p>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    onClick={() => onRemoveMovie(index)}
                    className="text-red-500 hover:text-red-600 p-1 rounded transition-colors"
                    title="Xóa khỏi series"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesMovieForm;