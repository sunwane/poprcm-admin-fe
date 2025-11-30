import { useState, useEffect, useMemo } from 'react';
import { Country } from '@/types/Country';
import { CountryService } from '@/services/CountryService';
import { StatisticsService } from '@/services/StatisticsService';
import { filterCountriesByName, sortCountries } from '@/utils/countryUtils';
import { useConfirmModal } from './useConfirmModal';
import { useDebounce } from './useDebounce';

interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [totalCountriesCount, setTotalCountriesCount] = useState(0);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [realStatsData, setRealStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
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

  // Confirm modal
  const confirmModal = useConfirmModal();
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Load countries with pagination (similar to useMovies)
  const loadCountriesWithPagination = async () => {
    try {
      setLoading(true);
      
      // Convert 1-based currentPage to 0-based page for API
      const page = currentPage - 1;
      
      // Get paginated countries
      const countriesData = await CountryService.getCountriesPaginated(page, itemsPerPage);
      setCountries(countriesData);
      
      // Get total count for pagination calculation
      const total = await CountryService.getTotalCountriesCount();
      setTotalCountriesCount(total);
      
      // Load movie counts for each country
      const counts: Record<string, number> = {};
      for (const country of countriesData) {
        counts[country.id] = await CountryService.getMovieCountByCountry(country.id);
      }
      setMovieCounts(counts);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load real country stats and movie counts from StatisticsService
  const loadRealCountryStats = async () => {
    try {
      const countryStats = await StatisticsService.getCountryStats();
      if (countryStats) {
        console.log('Loaded real country stats from API:', countryStats);
        setRealStatsData(countryStats);
        
        // Convert country stats to movieCounts format
        const counts: Record<string, number> = {};
        countryStats.forEach(country => {
          counts[country.id] = country.totalMovies;
        });
        setMovieCounts(counts);
      }
    } catch (error) {
      console.warn('Failed to load real country stats:', error);
    }
  };

  // Track search pending state
  useEffect(() => {
    setIsSearching(searchQuery !== debouncedSearchQuery);
  }, [searchQuery, debouncedSearchQuery]);

  // Load countries with search support
  const loadCountriesWithSearch = async () => {
    try {
      setLoading(true);
      
      // Convert 1-based currentPage to 0-based page for API
      const page = currentPage - 1;
      
      let countriesData: Country[];
      
      if (debouncedSearchQuery.trim()) {
        // Search mode
        countriesData = await CountryService.searchCountries(debouncedSearchQuery, page, itemsPerPage);
        
        // Get total count for search results
        const total = await CountryService.getSearchCountriesCount(debouncedSearchQuery);
        setTotalCountriesCount(total);
      } else {
        // Normal mode
        countriesData = await CountryService.getCountriesPaginated(page, itemsPerPage);
        
        const total = await CountryService.getTotalCountriesCount();
        setTotalCountriesCount(total);
      }
      
      setCountries(countriesData);
      
      // Try to load real stats first, fallback to mock if needed
      await loadRealCountryStats();
      
      // If no real stats loaded, use mock movie counts
      const currentRealStats = realStatsData;
      if (!currentRealStats) {
        const counts: Record<string, number> = {};
        for (const country of countriesData) {
          counts[country.id] = await CountryService.getMovieCountByCountry(country.id);
        }
        setMovieCounts(counts);
      }
      
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load countries on mount and when pagination/search changes
  useEffect(() => {
    loadCountriesWithSearch();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Filter and sort countries - CẬP NHẬT: Thêm sort theo movieCount
  const filteredCountries = useMemo(() => {
    let filtered = filterCountriesByName(countries, searchQuery);
    
    // Sort với movieCounts
    return [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
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
  }, [countries, searchQuery, sortBy, sortOrder, movieCounts]);

  // For server-side pagination, countries are already paginated
  const paginatedCountries = filteredCountries;

  // Pagination info - use total count from server
  const totalPages = Math.ceil(totalCountriesCount / itemsPerPage);

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
      loadCountriesWithSearch();
    }
  }, [sortBy, sortOrder]);

  // Calculate stats (use real data from StatisticsService when available)
  const stats = useMemo(() => {
    const total = totalCountriesCount; // Use server total
    
    // Use real stats if available
    if (realStatsData && Array.isArray(realStatsData)) {
      const totalMovies = realStatsData.reduce((sum, country) => sum + country.totalMovies, 0);
      const countriesWithMovies = realStatsData.filter(country => country.totalMovies > 0).length;
      
      return {
        total,
        countriesWithMovies,
        avgMoviesPerCountry: total > 0 ? Math.round(totalMovies / total) : 0,
        fromApi: true, // Real data from Statistics API
        filteredCount: filteredCountries.length,
        currentPageCount: countries.length,
        totalPages,
        totalMovies // Add total movies from real data
      };
    }
    
    // Fallback to mock calculation
    const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
    const countriesWithMovies = Object.values(movieCounts).filter(count => count > 0).length;
    
    return {
      total,
      countriesWithMovies,
      avgMoviesPerCountry: total > 0 ? Math.round(totalMovies / total) : 0,
      fromApi: false, // Mock data
      filteredCount: filteredCountries.length,
      currentPageCount: countries.length,
      totalPages,
      totalMovies // Add total movies
    };
  }, [countries, filteredCountries, movieCounts, totalCountriesCount, totalPages, realStatsData]);

  // Actions
  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmModal.openConfirm({
      title: 'Xóa quốc gia',
      message: 'Bạn có chắc chắn muốn xóa quốc gia này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy bỏ',
      confirmButtonType: 'danger'
    });

    if (confirmed) {
      try {
        confirmModal.setLoadingState(true);
        await CountryService.deleteCountry(id);
        
        // Reload data
        await loadCountriesWithSearch();
      } catch (error) {
        console.error('Error deleting country:', error);
      } finally {
        confirmModal.setLoadingState(false);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCountry(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
  };

  const handleSaveCountry = async (countryData: Partial<Country>) => {
    try {
      if (editingCountry) {
        // Update existing country
        console.log('Updating country:', editingCountry.id, countryData);
        await CountryService.updateCountry(editingCountry.id, countryData);
      } else {
        // Add new country
        console.log('Adding new country:', countryData);
        await CountryService.addCountry(countryData as Omit<Country, 'id'>);
      }

      // Reload toàn bộ dữ liệu từ server để đảm bảo tính nhất quán
      console.log('Reloading countries...');
      await loadCountriesWithSearch();
      
      showNotification(
        editingCountry ? 'Cập nhật quốc gia thành công!' : 'Thêm quốc gia thành công!',
        'success'
      );

      handleCloseModal();
    } catch (error) {
      console.error('Error saving country:', error);
      showNotification('Có lỗi xảy ra khi lưu quốc gia', 'error');
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

  // Sync methods từ useCountrySync
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

  const syncCountries = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      showNotification('Đang đồng bộ dữ liệu quốc gia...', 'info');

      const result = await CountryService.syncCountries();

      if (result.success) {
        showNotification('Đồng bộ thành công! Dữ liệu đã được cập nhật.', 'success');
        
        // Refresh data after sync
        const newCountries = await CountryService.refreshCountriesFromApi();
        setCountries(newCountries);
        
        // Reload movie counts
        const counts: Record<string, number> = {};
        for (const country of newCountries) {
          counts[country.id] = await CountryService.getMovieCountByCountry(country.id);
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
    countries,
    movieCounts,
    loading,
    showModal,
    editingCountry,
    searchQuery,
    debouncedSearchQuery,
    isSearching,
    sortBy,
    sortOrder,
    filteredCountries,
    paginatedCountries,
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
    handleSaveCountry,
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
    syncCountries,

    // Confirm modal
    confirmModal,
  };
};