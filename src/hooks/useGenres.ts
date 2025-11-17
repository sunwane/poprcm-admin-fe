import { useState, useEffect, useMemo } from 'react';
import { Genre } from '@/types/Genres';
import { GenresService } from '@/services/GenresService';
import { filterGenresByName, sortGenres } from '@/utils/genresUtils';

interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await GenresService.getAllGenres();
        
        // Kiểm tra xem có đang dùng API hay không (đơn giản)
        setGenres(genresData);
        
        // Load movie counts for each genre
        const counts: Record<string, number> = {};
        for (const genre of genresData) {
          counts[genre.id] = await GenresService.getMovieCountByGenre(genre.id);
        }
        setMovieCounts(counts);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGenres();
  }, []);

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

  // Paginated genres
  const paginatedGenres = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGenres.slice(startIndex, endIndex);
  }, [filteredGenres, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
    const genresWithMovies = Object.values(movieCounts).filter(count => count > 0).length;
    const genresWithoutMovies = genres.length - genresWithMovies;
    
    return {
      total: genres.length,
      genresWithMovies,
      genresWithoutMovies,
      avgMoviesPerGenre: genres.length > 0 ? Math.round(totalMovies / genres.length) : 0,
      fromApi: localStorage.getItem('serviceAvailable')
    };
  }, [genres, movieCounts, localStorage.getItem('serviceAvailable')]);

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
      if (editingGenre) {
        // Update existing genre
        const updatedGenre = await GenresService.updateGenre(editingGenre.id, genreData);
        if (updatedGenre) {
          setGenres(genres.map(genre => 
            genre.id === editingGenre.id ? updatedGenre : genre
          ));
        }
      } else {
        // Add new genre
        const newGenre = await GenresService.addGenre(genreData as Omit<Genre, 'id'>);
        setGenres([...genres, newGenre]);
        // Initialize movie count for new genre
        setMovieCounts(prev => ({ ...prev, [newGenre.id]: 0 }));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving genre:', error);
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
        
        // Reload movie counts
        const counts: Record<string, number> = {};
        for (const genre of newGenres) {
          counts[genre.id] = await GenresService.getMovieCountByGenre(genre.id);
        }
        setMovieCounts(counts);
        
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