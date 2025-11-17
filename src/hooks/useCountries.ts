import { useState, useEffect, useMemo } from 'react';
import { Country } from '@/types/Country';
import { CountryService } from '@/services/CountryService';
import { filterCountriesByName, sortCountries } from '@/utils/countryUtils';

interface NotificationState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
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

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await CountryService.getAllCountries();
        
        setCountries(countriesData);
        
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
    
    loadCountries();
  }, []);

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

  // Paginated countries
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCountries.slice(startIndex, endIndex);
  }, [filteredCountries, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
    const countriesWithMovies = Object.values(movieCounts).filter(count => count > 0).length;
    
    return {
      total: countries.length,
      countriesWithMovies,
      avgMoviesPerCountry: countries.length > 0 ? Math.round(totalMovies / countries.length) : 0,
      fromApi: localStorage.getItem('serviceAvailable')
    };
  }, [countries, movieCounts, localStorage.getItem('serviceAvailable')]);

  // Actions
  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa quốc gia này?')) {
      try {
        await CountryService.deleteCountry(id);
        setCountries(countries.filter(country => country.id !== id));
        // Remove from movieCounts
        const newMovieCounts = { ...movieCounts };
        delete newMovieCounts[id];
        setMovieCounts(newMovieCounts);
      } catch (error) {
        console.error('Error deleting country:', error);
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
        const updatedCountry = await CountryService.updateCountry(editingCountry.id, countryData);
        if (updatedCountry) {
          setCountries(countries.map(country => 
            country.id === editingCountry.id ? updatedCountry : country
          ));
        }
      } else {
        // Add new country
        const newCountry = await CountryService.addCountry(countryData as Omit<Country, 'id'>);
        setCountries([...countries, newCountry]);
        // Initialize movie count for new country
        setMovieCounts(prev => ({ ...prev, [newCountry.id]: 0 }));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving country:', error);
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
  };
};