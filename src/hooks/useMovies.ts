import { useState, useEffect, useMemo } from 'react';
import { Movie, MovieFilterRequest } from '@/types/Movies';
import { MoviesService } from '@/services/MoviesService';
import { 
  filterMoviesByQuery, 
  filterMoviesByYear, 
  filterMoviesByType, 
  filterMoviesByStatus, 
  filterMoviesByLang,
  sortMovies 
} from '@/utils/movieUtils';
import { useDebounce } from '@/hooks/useDebounce';
import { useConfirmModal } from './useConfirmModal';

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Movie Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Sorting
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'releaseYear' | 'view' | 'createdAt' | 'modifiedAt' | 'rating'>('id');

  // Confirm modal
  const confirmModal = useConfirmModal();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load movies with pagination and filters
  const loadMoviesWithPagination = async () => {
    try {
      setLoading(true);
      
      // Convert 1-based currentPage to 0-based page for API
      const page = currentPage - 1;
      
      // Prepare filter object
      const filter = {
        types: typeFilter !== 'all' ? [typeFilter] : undefined,
        statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
        languages: langFilter !== 'all' ? [langFilter] : undefined,
        releaseYear: yearFilter || undefined,
        sortBy: sortBy === 'view' ? 'views' : sortBy === 'modifiedAt' ? 'updatedAt' : sortBy,
        sortDirection: sortOrder
      };
      
      // Get movies with filters
      const { movies: moviesData, totalElements } = await MoviesService.getMoviesWithFilter(
        filter, page, itemsPerPage
      );
      
      setMovies(moviesData);
      setTotalMoviesCount(totalElements);
      
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change (not pagination)
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, langFilter, yearFilter ?? null, sortBy, sortOrder]);

  // Load movies on mount and when pagination or filters change
  useEffect(() => {
    loadMoviesWithPagination();
  }, [currentPage, itemsPerPage, typeFilter, statusFilter, langFilter, yearFilter ?? null, sortBy, sortOrder]);

  // Search movies when debounced query changes
  useEffect(() => {
    const searchMovies = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Prepare filter for search
        const filter = {
          types: typeFilter !== 'all' ? [typeFilter] : undefined,
          statuses: statusFilter !== 'all' ? [statusFilter] : undefined,
          languages: langFilter !== 'all' ? [langFilter] : undefined,
          releaseYear: yearFilter || undefined,
          sortBy: sortBy === 'view' ? 'views' : sortBy === 'modifiedAt' ? 'updatedAt' : sortBy,
          sortDirection: sortOrder
        };
        
        const { movies: results } = await MoviesService.searchMoviesWithFilter(
          debouncedSearchQuery, filter, 0, 100 // Get more results for search
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching movies:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchMovies();
  }, [
    debouncedSearchQuery, 
    typeFilter, 
    statusFilter, 
    langFilter, 
    yearFilter ?? null, // Ensure consistent value for null/undefined
    sortBy, 
    sortOrder
  ]);

  // Movies are already filtered and sorted by server, just apply search if needed
  const filteredAndSortedMovies = useMemo(() => {
    // If searching, use search results, otherwise use server-filtered movies
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults;
    }
    
    // If there's a search query but no results yet, apply client-side search to current movies
    if (searchQuery.trim()) {
      return filterMoviesByQuery(movies, searchQuery);
    }
    
    // Otherwise, use movies as-is (already filtered by server)
    return movies;
  }, [movies, searchQuery, searchResults]);

  // For server-side pagination, movies are already paginated
  const paginatedMovies = filteredAndSortedMovies;

  // Pagination info - use total count from server
  const totalPages = Math.ceil(totalMoviesCount / itemsPerPage);

  // Reset to first page when filters change and reload data
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on page 1, manually reload
      loadMoviesWithPagination();
    }
  }, [yearFilter ?? null, typeFilter, statusFilter, langFilter, sortBy, sortOrder]);

  // Calculate stats (for current page movies, with total from server)
  const stats = useMemo(() => {
    const total = totalMoviesCount; // Use server total
    const totalMovies = movies.filter(m => m.type === 'Movie').length;
    const totalSeries = movies.filter(m => m.type === 'Series').length;
    const totalAnime = movies.filter(m => m.type === 'hoathinh').length;
    const totalViews = movies.reduce((sum, movie) => sum + movie.view, 0);
    const ongoingSeries = movies.filter(m => m.status === 'ongoing').length;
    const completedMovies = movies.filter(m => m.status === 'completed').length;
    const trailerMovies = movies.filter(m => m.status === 'trailer').length;
    
    // Tính trung bình điểm IMDb và TMDb
    const validRatings = movies
      .map(movie => {
        const imdbScore = movie.imdbScore || 0;
        const tmdbScore = movie.tmdbScore || 0;

        // Nếu cả hai điểm đều không hợp lệ, bỏ qua movie này
        if (imdbScore === 0 && tmdbScore === 0) return null;

        // Tính trung bình của IMDb và TMDb (nếu cả hai đều hợp lệ)
        if (imdbScore > 0 && tmdbScore > 0) {
          return (imdbScore + tmdbScore) / 2;
        }

        // Nếu chỉ có IMDb hoặc TMDb hợp lệ, lấy điểm đó
        return imdbScore > 0 ? imdbScore : tmdbScore;
      })
      .filter(score => score !== null); // Loại bỏ các giá trị null

    const averageRating =
      validRatings.length > 0
        ? validRatings.reduce((sum, score) => sum + (score || 0), 0) /
          validRatings.length
        : 0;

    const latestAddedDate = movies.reduce((latest, movie) => {
      return new Date(movie.createdAt) > new Date(latest) ? movie.createdAt : latest;
    }, movies[0]?.createdAt || null);

    const latestUpdatedDate = movies.reduce((latest, movie) => {
      return new Date(movie.modifiedAt) > new Date(latest) ? movie.modifiedAt : latest;
    }, movies[0]?.modifiedAt || null);

      // Đếm số lượng movie được thêm vào ngày cuối cùng
    const moviesAddedOnLatestDate = movies.filter(movie => { movie.createdAt === latestAddedDate}).length;
    const moviesUpdatedOnLatestDate = movies.filter(movie => { movie.modifiedAt === latestUpdatedDate}).length;

    return {
      total,
      totalMovies,
      totalSeries,
      totalAnime,
      totalViews,
      ongoingSeries,
      completedMovies,
      trailerMovies,
      latestAddedDate,
      latestUpdatedDate,
      moviesAddedOnLatestDate,
      moviesUpdatedOnLatestDate,
      averageRating: Math.round(averageRating * 10) / 10,
      filteredCount: filteredAndSortedMovies.length,
      currentPageCount: movies.length,
      totalPages
    };
  }, [movies, filteredAndSortedMovies, totalMoviesCount, totalPages]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const years = [...new Set(movies.map(m => m.releaseYear))].sort((a, b) => b - a);
    const types = [...new Set(movies.map(m => m.type))];
    const statuses = [...new Set(movies.map(m => m.status))];
    const languages = [...new Set(movies.map(m => m.lang))];
    
    return { years, types, statuses, languages };
  }, [movies]);

  // Actions
  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmModal.openConfirm({
      title: 'Xóa phim',
      message: 'Bạn có chắc chắn muốn xóa phim này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy bỏ',
      confirmButtonType: 'danger'
    });

    if (confirmed) {
      try {
        confirmModal.setLoadingState(true);
        await MoviesService.deleteMovie(id);
        // Reload current page data
        await loadMoviesWithPagination();
      } catch (error) {
        console.error('Error deleting movie:', error);
        // TODO: Thay thế alert bằng notification system
        alert('Có lỗi xảy ra khi xóa phim');
      } finally {
        confirmModal.setLoadingState(false);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMovie(null);
  };

  // Movie Detail Modal handlers
  const openDetailModal = (movie: Movie) => {
    console.log('Opening detail modal for movie:', movie);
    setSelectedMovie(movie);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMovie(null);
  };

  const handleSaveMovie = async (movieData: Partial<Movie>) => {
    try {
      if (editingMovie) {
        // Update existing movie
        await MoviesService.updateMovie(editingMovie.id, movieData);
      } else {
        // Add new movie
        await MoviesService.addMovie(movieData as Omit<Movie, 'id' | 'createdAt' | 'modifiedAt' | 'slug'>);
      }
      
      // Reload current page data
      await loadMoviesWithPagination();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Có lỗi xảy ra khi lưu phim');
    }
  };

  const handleViewModeToggle = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSort = (field: 'id' | 'title' | 'releaseYear' | 'view' | 'createdAt' | 'modifiedAt' | 'rating') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setYearFilter(null);
    setTypeFilter('all');
    setStatusFilter('all');
    setLangFilter('all');
    setSortBy('id');
    setSortOrder('asc');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Increment view count
  const handleIncrementView = async (id: string) => {
    try {
      await MoviesService.incrementViewCount(id);
      // Reload current page to reflect updated view count
      await loadMoviesWithPagination();
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  return {
    // Data
    movies,
    loading,
    showModal,
    editingMovie,
    viewMode,
    
    // Search
    isSearching,
    
    // Movie Detail Modal state
    isDetailModalOpen,
    selectedMovie,
    
    // Filters and search
    searchQuery,
    yearFilter,
    typeFilter,
    statusFilter,
    langFilter,
    
    // Sorting
    sortBy,
    sortOrder,
    
    // Processed data
    filteredAndSortedMovies,
    paginatedMovies,
    stats,
    filterOptions,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveMovie,
    handleViewModeToggle,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    handleIncrementView,
    
    // Movie Detail Modal actions
    openDetailModal,
    closeDetailModal,
    
    // Setters
    setSearchQuery,
    setYearFilter,
    setTypeFilter,
    setStatusFilter,
    setLangFilter,
    setSortBy,
    setSortOrder,
    setViewMode,

    // Confirm modal
    confirmModal,
  };
};