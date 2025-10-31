import { useState, useEffect, useCallback, useMemo } from 'react';
import { Series } from '@/types/Series';
import { SeriesService } from '@/services/SeriesService';
import { 
  sortSeries, 
  paginateSeries, 
  filterSeriesByStatus, 
  filterSeriesByYear,
  searchSeries,
  SeriesSortBy,
  SortOrder
} from '@/utils/seriesUtils';

interface UseSeriesOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  initialSortBy?: SeriesSortBy;
  initialSortOrder?: SortOrder;
}

export const useSeries = (options: UseSeriesOptions = {}) => {
  const {
    initialPage = 1,
    initialItemsPerPage = 12,
    initialSortBy = 'name',
    initialSortOrder = 'asc'
  } = options;

  // State management
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sort state
  const [sortBy, setSortBy] = useState<SeriesSortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    ongoingSeries: 0,
    completedSeries: 0,
    totalSeasons: 0,
    totalMovies: 0,
    filteredCount: 0
  });

  // Load initial data
  const loadSeries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [seriesData, statsData] = await Promise.all([
        SeriesService.getAllSeries(),
        SeriesService.getSeriesStats()
      ]);
      
      setSeries(seriesData);
      setStats(prev => ({ ...prev, ...statsData }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
      console.error('Error loading series:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  // Memoized filtered and sorted series
  const filteredAndSortedSeries = useMemo(() => {
    let filtered = [...series];
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchSeries(filtered, searchQuery);
    }
    
    // Apply status filter
    filtered = filterSeriesByStatus(filtered, statusFilter);
    
    // Apply year filter
    if (yearFilter) {
      filtered = filterSeriesByYear(filtered, yearFilter);
    }
    
    // Apply sorting
    filtered = sortSeries(filtered, sortBy, sortOrder);
    
    return filtered;
  }, [series, searchQuery, statusFilter, yearFilter, sortBy, sortOrder]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    return paginateSeries(filteredAndSortedSeries, currentPage, itemsPerPage);
  }, [filteredAndSortedSeries, currentPage, itemsPerPage]);

  // Update filtered count when filtered data changes
  useEffect(() => {
    setStats(prev => ({ ...prev, filteredCount: filteredAndSortedSeries.length }));
  }, [filteredAndSortedSeries.length]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, yearFilter, sortBy, sortOrder, itemsPerPage]);

  // Filter options
  const filterOptions = useMemo(async () => {
    try {
      const [years, statuses] = await Promise.all([
        SeriesService.getUniqueReleaseYears(),
        SeriesService.getUniqueStatuses()
      ]);
      
      return { years, statuses };
    } catch (err) {
      console.error('Error loading filter options:', err);
      return { years: [], statuses: [] };
    }
  }, []);

  // Event handlers
  const handleEdit = (series: Series) => {
    setEditingSeries(series);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa series này?')) return;
    
    try {
      await SeriesService.deleteSeries(id);
      await loadSeries(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa series');
    }
  };

  const handleOpenAddModal = () => {
    setEditingSeries(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSeries(null);
  };

  const handleSaveSeries = async (seriesData: Omit<Series, 'id' | 'seriesMovies'>) => {
    try {
      if (editingSeries) {
        await SeriesService.updateSeries(editingSeries.id, seriesData);
      } else {
        await SeriesService.addSeries(seriesData);
      }
      
      await loadSeries(); // Reload data
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu series');
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleViewModeToggle = (mode: 'table' | 'grid') => {
    setViewMode(mode);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSort = (field: SeriesSortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setYearFilter('');
    setStatusFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Bulk operations
  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${ids.length} series đã chọn?`)) return;
    
    try {
      await SeriesService.bulkDeleteSeries(ids);
      await loadSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa series');
    }
  };

  const handleBulkUpdateStatus = async (ids: string[], status: string) => {
    try {
      await SeriesService.bulkUpdateStatus(ids, status);
      await loadSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái');
    }
  };

  // Refresh data
  const refreshData = () => {
    loadSeries();
  };

  return {
    // Data
    series: filteredAndSortedSeries,
    paginatedSeries: paginationData.data,
    stats: {
      ...stats,
      filteredCount: filteredAndSortedSeries.length
    },
    
    // State
    loading,
    error,
    
    // Modal state
    showModal,
    editingSeries,
    
    // View state
    viewMode,
    
    // Filter state
    searchQuery,
    yearFilter,
    statusFilter,
    
    // Sort state
    sortBy,
    sortOrder,
    
    // Pagination state
    currentPage,
    totalPages: paginationData.totalPages,
    itemsPerPage,
    
    // Options
    filterOptions,
    
    // Event handlers
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveSeries,
    handleViewModeToggle,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    
    // Bulk operations
    handleBulkDelete,
    handleBulkUpdateStatus,
    
    // Filter setters
    setSearchQuery,
    setYearFilter,
    setStatusFilter,
    
    // Utils
    refreshData,
    setError
  };
};