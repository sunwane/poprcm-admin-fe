import { useState, useEffect, useMemo } from 'react';
import { Movie } from '@/types/Movies';
import { MoviesService } from '@/services/MoviesService';
import { 
  filterMoviesByQuery, 
  filterMoviesByYear, 
  filterMoviesByType, 
  filterMoviesByStatus, 
  filterMoviesByLang,
  sortMovies 
} from '@/utils/movieUtils';

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Movie Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'releaseYear' | 'view' | 'createdAt' | 'modifiedAt' | 'rating'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load movies on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const moviesData = await MoviesService.getAllMovies();
        setMovies(moviesData);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMovies();
  }, []);

  // Apply all filters and sorting
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = filterMoviesByQuery(movies, searchQuery);
    
    if (yearFilter) {
      filtered = filterMoviesByYear(filtered, yearFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filterMoviesByType(filtered, typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filterMoviesByStatus(filtered, statusFilter);
    }
    
    if (langFilter !== 'all') {
      filtered = filterMoviesByLang(filtered, langFilter);
    }
    
    return sortMovies(filtered, sortBy, sortOrder);
  }, [movies, searchQuery, yearFilter, typeFilter, statusFilter, langFilter, sortBy, sortOrder]);

  // Paginated movies
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedMovies.slice(startIndex, endIndex);
  }, [filteredAndSortedMovies, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedMovies.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter, typeFilter, statusFilter, langFilter, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = movies.length;
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
      filteredCount: filteredAndSortedMovies.length
    };
  }, [movies, filteredAndSortedMovies]);

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

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        await MoviesService.deleteMovie(id);
        setMovies(movies.filter(movie => movie.id !== id));
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Có lỗi xảy ra khi xóa phim');
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
        const updatedMovie = await MoviesService.updateMovie(editingMovie.id, movieData);
        if (updatedMovie) {
          setMovies(movies.map(movie => 
            movie.id === editingMovie.id ? updatedMovie : movie
          ));
        }
      } else {
        // Add new movie
        const newMovie = await MoviesService.addMovie(movieData as Omit<Movie, 'id' | 'createdAt' | 'modifiedAt' | 'slug'>);
        setMovies([...movies, newMovie]);
      }
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
  };

  // Increment view count
  const handleIncrementView = async (id: number) => {
    try {
      const updatedMovie = await MoviesService.incrementViewCount(id);
      if (updatedMovie) {
        setMovies(movies.map(movie => 
          movie.id === id ? updatedMovie : movie
        ));
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  return {
    // State
    movies,
    loading,
    showModal,
    editingMovie,
    viewMode,
    
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
  };
};