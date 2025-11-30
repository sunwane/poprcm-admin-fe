import { useState, useEffect, useMemo } from 'react';
import { Genre } from '@/types/Genres';
import { GenresService } from '@/services/GenresService';
import { StatisticsService } from '@/services/StatisticsService';
import { filterGenresByName, sortGenres } from '@/utils/genresUtils';
import { useDebounce } from './useDebounce';

interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalGenresCount, setTotalGenresCount] = useState(0);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [realStatsData, setRealStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Debounced search query với 10 giây
  const debouncedSearchQuery = useDebounce(searchQuery, 10000);
  // Search states
  const [isSearching, setIsSearching] = useState(false);
  // CẬP NHẬT: Thêm 'movieCount' vào sortBy type
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'movieCount'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Track search pending state
  useEffect(() => {
    setIsSearching(searchQuery !== debouncedSearchQuery);
  }, [searchQuery, debouncedSearchQuery]);

  // Load real genre stats and movie counts from StatisticsService
  const loadRealGenreStats = async () => {
    try {
      const genreStats = await StatisticsService.getGenreStats();
      if (genreStats) {
        setRealStatsData(genreStats);
        
        // Convert genre stats to movieCounts format
        const counts: Record<string, number> = {};
        genreStats.forEach(genre => {
          counts[genre.id] = genre.totalMovies;
        });
        setMovieCounts(counts);
      }
    } catch (error) {
      console.warn('Failed to load real genre stats:', error);
    }
  };

  // Load genres with search support
  const loadGenresWithSearch = async () => {
    try {
      setLoading(true);
      
      // Convert 1-based currentPage to 0-based page for API
      const page = currentPage - 1;
      
      if (debouncedSearchQuery.trim()) {
        // Search mode
        const genresData = await GenresService.searchGenres(debouncedSearchQuery, page, itemsPerPage);
        setGenres(genresData);
        
        // Get total count for search results
        const total = await GenresService.getSearchGenresCount(debouncedSearchQuery);
        setTotalGenresCount(total);
      } else {
        // Normal mode
        const genresData = await GenresService.getGenresPaginated(page, itemsPerPage);
        setGenres(genresData);
        
        const total = await GenresService.getTotalGenresCount();
        setTotalGenresCount(total);
      }

      // Load real stats data in parallel
      await loadRealGenreStats();
      
    } catch (error) {
      console.error('Error loading genres:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load genres on mount and when pagination/search changes
  useEffect(() => {
    loadGenresWithSearch();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Filter and sort genres - CẬP NHẬT: Thêm sort theo movieCount
  const filteredGenres = useMemo(() => {
    let filtered = filterGenresByName(genres, searchQuery);
    
    // Sort với movieCounts
    return [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.genresName.toLowerCase();
          bValue = b.genresName.toLowerCase();
          break;
        case 'id':
          aValue = parseInt(a.id) || 0;
          bValue = parseInt(b.id) || 0;
          break;
        case 'movieCount':
          aValue = movieCounts[a.id] || 0;
          bValue = movieCounts[b.id] || 0;
          break;
        default:
          aValue = parseInt(a.id) || 0;
          bValue = parseInt(b.id) || 0;
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });
  }, [genres, searchQuery, sortBy, sortOrder, movieCounts]);

  // For server-side pagination, genres are already paginated
  const paginatedGenres = filteredGenres;

  // Pagination info - use total count from server
  const totalPages = Math.ceil(totalGenresCount / itemsPerPage);

  // Reset to first page when debounced search query changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);

  // Reset to first page when filters change and reload data
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on page 1, manually reload
      loadGenresWithSearch();
    }
  }, [sortBy, sortOrder]);

  // Calculate stats (use real data from StatisticsService when available)
  const stats = useMemo(() => {
    const total = totalGenresCount; // Use server total
    
    // Use real stats if available
    if (realStatsData && Array.isArray(realStatsData)) {
      const totalMovies = realStatsData.reduce((sum, genre) => sum + genre.totalMovies, 0);
      const genresWithMovies = realStatsData.filter(genre => genre.totalMovies > 0).length;
      const genresWithoutMovies = total - genresWithMovies;
      
      return {
        total,
        genresWithMovies,
        genresWithoutMovies,
        avgMoviesPerGenre: total > 0 ? Math.round(totalMovies / total) : 0,
        fromApi: true, // Real data from Statistics API
        filteredCount: filteredGenres.length,
        currentPageCount: genres.length,
        totalPages,
        totalMovies // Add total movies from real data
      };
    }
    
    // Fallback to mock calculation
    const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
    const genresWithMovies = Object.values(movieCounts).filter(count => count > 0).length;
    const genresWithoutMovies = total - genresWithMovies;
    
    return {
      total,
      genresWithMovies,
      genresWithoutMovies,
      avgMoviesPerGenre: total > 0 ? Math.round(totalMovies / total) : 0,
      fromApi: false, // Mock data
      filteredCount: filteredGenres.length,
      currentPageCount: genres.length,
      totalPages,
      totalMovies // Add total movies
    };
  }, [genres, filteredGenres, movieCounts, totalGenresCount, totalPages, realStatsData]);

  // Actions
  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await GenresService.deleteGenre(id);
        setGenres(genres.filter(genre => genre.id !== id));
        // Remove from movieCounts
        const newMovieCounts = { ...movieCounts };
        delete newMovieCounts[id];
        setMovieCounts(newMovieCounts);
      } catch (error) {
        console.error('Error deleting genre:', error);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingGenre(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGenre(null);
  };

  const handleSaveGenre = async (genreData: Partial<Genre>) => {
    try {
      console.log('Saving genre data:', genreData);

      // Validate genresName
      if (!genreData.id || genreData.id.trim() === '') {
        showNotification('Từ khóa không được để trống', 'error');
        return;
      }
      
      // Validate genresName
      if (!genreData.genresName || genreData.genresName.trim() === '') {
        showNotification('Tên thể loại không được để trống', 'error');
        return;
      }
      
      if (editingGenre) {
        // Update existing genre
        console.log('Updating genre:', editingGenre.id, genreData);
        await GenresService.updateGenre(editingGenre.id, genreData);
      } else {
        // Add new genre
        console.log('Adding new genre:', genreData);
        const genreToAdd: Genre = {
          id: genreData.id || 'temp-id-' + Date.now(),
          genresName: genreData.genresName.trim(),
        };
        await GenresService.addGenre(genreToAdd);
      }
      
      // Reload toàn bộ dữ liệu từ server để đảm bảo tính nhất quán
      console.log('Reloading genres...');
      await loadGenresWithSearch();
      
      // Show success notification
      showNotification(
        editingGenre ? 'Cập nhật thể loại thành công!' : 'Thêm thể loại thành công!',
        'success'
      );

      handleCloseModal();
    } catch (error) {
      console.error('Error saving genre:', error);
      showNotification('Có lỗi xảy ra khi lưu thể loại', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // CẬP NHẬT: Thêm 'movieCount' vào handleSort
  const handleSort = (field: 'name' | 'id' | 'movieCount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Sync methods (giống useCountries)
  const showNotification = (message: string, type: NotificationState['type'] = 'info') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const syncGenres = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      showNotification('Đang đồng bộ dữ liệu thể loại...', 'info');

      const result = await GenresService.syncGenres();

      if (result.success) {
        showNotification('Đồng bộ thành công! Dữ liệu đã được cập nhật.', 'success');
        
        // Refresh data after sync
        const newGenres = await GenresService.refreshGenresFromApi();
        setGenres(newGenres);
        
        return true;
      } else {
        showNotification(
          result.message || 'Đồng bộ thất bại. Vui lòng thử lại.',
          'error'
        );
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đồng bộ';
      showNotification(message, 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // State
    genres,
    movieCounts,
    loading,
    showModal,
    editingGenre,
    searchQuery,
    debouncedSearchQuery,
    isSearching,
    sortBy,
    sortOrder,
    filteredGenres,
    paginatedGenres,
    stats,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveGenre,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    
    // Sync functionality
    isSyncing,
    notification,
    showNotification,
    hideNotification,
    syncGenres,
  };
};