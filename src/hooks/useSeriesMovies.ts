import { useState, useCallback } from 'react';
import { Movie } from '@/types/Movies';
import { SeriesMovie } from '@/types/Series';
import { MoviesService } from '@/services/MoviesService';
import { useDebounce } from '@/hooks/useDebounce'; // Tạo hook debounce nếu chưa có

export const useSeriesMovies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search movies with debouncing
  const searchMovies = useCallback(async (query: string, excludeMovieIds: number[] = []) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await MoviesService.searchMovies(query);
      const filteredResults = results.filter(movie => !excludeMovieIds.includes(movie.id));
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
      setShowSearchResults(false);
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

  // Remove movie from series
  const removeSeriesMovie = useCallback((movies: SeriesMovie[], index: number): SeriesMovie[] => {
    const updatedMovies = movies.filter((_, i) => i !== index);
    return reorderSeriesMovies(updatedMovies);
  }, [reorderSeriesMovies]);

  // Add movie to series
  const addMovieToSeries = useCallback((
    movies: SeriesMovie[],
    movie: Movie
  ): SeriesMovie[] => {
    const newSeriesMovie = createSeriesMovie(movie, movies.length + 1);
    return [...movies, newSeriesMovie];
  }, [createSeriesMovie]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  // Manual search trigger with exclude list
  const performSearch = useCallback(async (query: string, excludeMovieIds: number[] = []) => {
    await searchMovies(query, excludeMovieIds);
  }, [searchMovies]);

  return {
    // Search state
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    debouncedSearchQuery,

    // Search actions
    setSearchQuery,
    performSearch,
    clearSearch,

    // Series movie operations
    createSeriesMovie,
    reorderSeriesMovies,
    moveSeriesMovie,
    removeSeriesMovie,
    addMovieToSeries,
  };
};