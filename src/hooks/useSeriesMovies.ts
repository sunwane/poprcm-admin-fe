import { useState, useCallback } from 'react';
import { Movie } from '@/types/Movies';
import { SeriesMovie } from '@/types/Series';
import { MoviesService } from '@/services/MoviesService';
import { SeriesService } from '@/services/SeriesService';
import { useDebounce } from '@/hooks/useDebounce';

// Hook to manage series movies, searching, adding, removing, and reordering

export const useSeriesMovies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Pagination state for search results
  const [searchPagination, setSearchPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
    hasMore: false
  });
  
  // Loading states for API operations
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [isRemovingMovie, setIsRemovingMovie] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search movies with pagination support
  const searchMovies = useCallback(async (
    query: string, 
    excludeMovieIds: string[] = [], 
    page: number = 0, 
    size: number = 10,
    loadMore: boolean = false
  ) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchPagination({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
        hasMore: false
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await MoviesService.searchMovies(query);
      const filteredResults = results.filter(movie => !excludeMovieIds.includes(movie.id));
      
      // Simulate pagination on client side since API returns all results
      const totalElements = filteredResults.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);
      
      if (loadMore && page > 0) {
        // Append to existing results for infinite scroll
        setSearchResults(prevResults => [...prevResults, ...paginatedResults]);
      } else {
        // Replace results for new search
        setSearchResults(paginatedResults);
      }
      
      setSearchPagination({
        page,
        size,
        totalPages,
        totalElements,
        hasMore: endIndex < totalElements
      });
      
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchPagination({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
        hasMore: false
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Create new series movie
  const createSeriesMovie = useCallback((movie: Movie, seasonNumber: number): SeriesMovie => {
    return {
      id: `temp-${Date.now()}`,
      movieId: movie.id,
      seriesId: 'temp',
      seasonNumber,
      movie
    };
  }, []);

  // Reorder series movies and update season numbers
  const reorderSeriesMovies = useCallback((movies: SeriesMovie[]): SeriesMovie[] => {
    return movies.map((movie, index) => ({
      ...movie,
      seasonNumber: index + 1
    }));
  }, []);

  // Move movie in series
  const moveSeriesMovie = useCallback((
    movies: SeriesMovie[],
    fromIndex: number,
    toIndex: number
  ): SeriesMovie[] => {
    const newMovies = [...movies];
    const draggedMovie = newMovies[fromIndex];

    newMovies.splice(fromIndex, 1);
    newMovies.splice(toIndex, 0, draggedMovie);

    return reorderSeriesMovies(newMovies);
  }, [reorderSeriesMovies]);

  // Remove movie from series (local operation - for drag & drop)
  const removeSeriesMovie = useCallback((movies: SeriesMovie[], index: number): SeriesMovie[] => {
    const updatedMovies = movies.filter((_, i) => i !== index);
    return reorderSeriesMovies(updatedMovies);
  }, [reorderSeriesMovies]);

  // Add movie to series (local operation - for drag & drop)
  const addMovieToSeries = useCallback((
    movies: SeriesMovie[],
    movie: Movie
  ): SeriesMovie[] => {
    const newSeriesMovie = createSeriesMovie(movie, movies.length + 1);
    return [...movies, newSeriesMovie];
  }, [createSeriesMovie]);

  // Add movie to series via API
  const addMovieToSeriesAPI = useCallback(async (
    seriesId: string, 
    movieId: string, 
    seasonNumber: number = 1
  ): Promise<{ success: boolean; series?: any; message: string }> => {
    setIsAddingMovie(true);
    try {
      const result = await SeriesService.addMovieToSeries(seriesId, movieId, seasonNumber);
      
      if (result.success) {
        console.log('Movie added to series successfully:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding movie to series:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi khi thêm phim vào series'
      };
    } finally {
      setIsAddingMovie(false);
    }
  }, []);

  // Remove movie from series via API
  const removeMovieFromSeriesAPI = useCallback(async (
    seriesId: string, 
    movieId: string
  ): Promise<{ success: boolean; series?: any; message: string }> => {
    setIsRemovingMovie(true);
    try {
      const result = await SeriesService.removeMovieFromSeries(seriesId, movieId);
      
      if (result.success) {
        console.log('Movie removed from series successfully:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error removing movie from series:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi khi xóa phim khỏi series'
      };
    } finally {
      setIsRemovingMovie(false);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchPagination({
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
      hasMore: false
    });
  }, []);

  // Manual search trigger with exclude list
  const performSearch = useCallback(async (
    query: string, 
    excludeMovieIds: string[] = [], 
    page: number = 0, 
    size: number = 10
  ) => {
    await searchMovies(query, excludeMovieIds, page, size);
  }, [searchMovies]);

  // Load more search results (for infinite scroll)
  const loadMoreResults = useCallback(async (excludeMovieIds: string[] = []) => {
    if (!searchQuery.trim() || !searchPagination.hasMore || isSearching) return;
    
    const nextPage = searchPagination.page + 1;
    await searchMovies(searchQuery, excludeMovieIds, nextPage, searchPagination.size, true);
  }, [searchQuery, searchPagination, isSearching, searchMovies]);

  // Change page size
  const changePageSize = useCallback(async (newSize: number, excludeMovieIds: string[] = []) => {
    if (!searchQuery.trim()) return;
    
    setSearchPagination(prev => ({ ...prev, size: newSize, page: 0 }));
    await searchMovies(searchQuery, excludeMovieIds, 0, newSize);
  }, [searchQuery, searchMovies]);

  // Go to specific page
  const goToPage = useCallback(async (page: number, excludeMovieIds: string[] = []) => {
    if (!searchQuery.trim() || page < 0 || page >= searchPagination.totalPages) return;
    
    await searchMovies(searchQuery, excludeMovieIds, page, searchPagination.size);
  }, [searchQuery, searchPagination.totalPages, searchPagination.size, searchMovies]);

  return {
    // Search state
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    debouncedSearchQuery,
    searchPagination,

    // API operation states
    isAddingMovie,
    isRemovingMovie,

    // Search actions
    setSearchQuery,
    performSearch,
    clearSearch,
    loadMoreResults,
    changePageSize,
    goToPage,

    // Local series movie operations (for UI state management)
    createSeriesMovie,
    reorderSeriesMovies,
    moveSeriesMovie,
    removeSeriesMovie,
    addMovieToSeries,

    // API operations
    addMovieToSeriesAPI,
    removeMovieFromSeriesAPI,
  };
};