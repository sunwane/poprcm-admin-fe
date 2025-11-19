import React, { useState, useEffect } from 'react';
import { useSeriesMovies } from '@/hooks/useSeriesMovies';
import { SeriesMovie } from '@/types/Series';

interface SeriesMovieManagerProps {
  seriesId: string;
  currentMovies: SeriesMovie[];
  onMoviesChange: (movies: SeriesMovie[]) => void;
}

export const SeriesMovieManager: React.FC<SeriesMovieManagerProps> = ({
  seriesId,
  currentMovies,
  onMoviesChange
}) => {
  const {
    // Search state
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    searchPagination,

    // API operation states
    isAddingMovie,
    isRemovingMovie,

    // Search actions
    setSearchQuery,
    performSearch,
    clearSearch,
    loadMoreResults,
    goToPage,

    // Local operations
    removeSeriesMovie,
    addMovieToSeries,

    // API operations
    addMovieToSeriesAPI,
    removeMovieFromSeriesAPI,
  } = useSeriesMovies();

  const [localMovies, setLocalMovies] = useState<SeriesMovie[]>(currentMovies);

  // Sync with parent component
  useEffect(() => {
    setLocalMovies(currentMovies);
  }, [currentMovies]);

  // Get excluded movie IDs to prevent duplicates in search
  const excludedMovieIds = localMovies.map(sm => sm.movieId);

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query, excludedMovieIds);
    } else {
      clearSearch();
    }
  };

  // Handle adding movie to series
  const handleAddMovie = async (movieId: string) => {
    try {
      const result = await addMovieToSeriesAPI(seriesId, movieId, localMovies.length + 1);
      
      if (result.success && result.series) {
        // Update with API response
        const updatedMovies = result.series.seriesMovies || [];
        setLocalMovies(updatedMovies);
        onMoviesChange(updatedMovies);
        clearSearch();
      } else {
        console.error('Failed to add movie:', result.message);
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  // Handle removing movie from series
  const handleRemoveMovie = async (movieId: string, index: number) => {
    try {
      const result = await removeMovieFromSeriesAPI(seriesId, movieId.toString());
      
      if (result.success) {
        // Update local state
        const updatedMovies = removeSeriesMovie(localMovies, index);
        setLocalMovies(updatedMovies);
        onMoviesChange(updatedMovies);
      } else {
        console.error('Failed to remove movie:', result.message);
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error('Error removing movie:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tìm kiếm phim để thêm vào series
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nhập tên phim..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {movie.posterUrl && (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{movie.title}</h4>
                        <p className="text-sm text-gray-500">{movie.releaseYear} • {movie.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMovie(movie.id)}
                      disabled={isAddingMovie}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingMovie ? 'Đang thêm...' : 'Thêm'}
                    </button>
                  </div>
                ))}
                
                {/* Pagination */}
                {searchPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-t">
                    <div className="text-sm text-gray-600">
                      Hiển thị {searchResults.length} / {searchPagination.totalElements} phim
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(searchPagination.page - 1, excludedMovieIds)}
                        disabled={searchPagination.page === 0 || isSearching}
                        className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-gray-600">
                        {searchPagination.page + 1} / {searchPagination.totalPages}
                      </span>
                      <button
                        onClick={() => goToPage(searchPagination.page + 1, excludedMovieIds)}
                        disabled={searchPagination.page >= searchPagination.totalPages - 1 || isSearching}
                        className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}

                {/* Load More Button for infinite scroll alternative */}
                {searchPagination.hasMore && (
                  <div className="p-3 text-center border-t">
                    <button
                      onClick={() => loadMoreResults(excludedMovieIds)}
                      disabled={isSearching}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Đang tải...' : 'Tải thêm'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Không tìm thấy phim nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Movies in Series */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Danh sách phim trong series ({localMovies.length})
        </label>
        {localMovies.length > 0 ? (
          <div className="space-y-2">
            {localMovies.map((seriesMovie, index) => (
              <div
                key={seriesMovie.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {seriesMovie.seasonNumber}
                  </div>
                  {seriesMovie.movie?.posterUrl && (
                    <img
                      src={seriesMovie.movie.posterUrl}
                      alt={seriesMovie.movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {seriesMovie.movie?.title || 'Unknown Movie'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Phần {seriesMovie.seasonNumber} • {seriesMovie.movie?.releaseYear} • {seriesMovie.movie?.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMovie(seriesMovie.movieId, index)}
                  disabled={isRemovingMovie}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRemovingMovie ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg border-dashed">
            Chưa có phim nào trong series này
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesMovieManager;