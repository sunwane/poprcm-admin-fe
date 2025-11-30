import { useState, useEffect, useMemo } from 'react';
import { Actor, FilterGender, SortBy } from '@/types/Actor';
import { ActorService } from '@/services/ActorService';
import { filterActorsByQuery, sortActors } from '@/utils/actorUtils';
import { useConfirmModal } from './useConfirmModal';
import { useDebounce } from './useDebounce';

export const useActors = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [filterGender, setFilterGender] = useState<FilterGender>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats states 
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    unknown: 0,
    avgMoviesPerActor: 0,
    filteredCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Sorting states
  const [sortBy, setSortBy] = useState<SortBy>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 10000);

  // Confirm modal
  const confirmModal = useConfirmModal();

  // Load actors function with pagination
  const loadActors = async (page: number = 0, search?: string, gender?: string) => {
    try {
      setLoading(true);
      const response = await ActorService.getActorsPaginated(page, itemsPerPage, search, gender);
      setActors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
      // Load movie counts for each actor
      const counts: Record<string, number> = {};
      for (const actor of response.content) {
        counts[actor.id] = await ActorService.getMovieCountByActor(actor.id);
      }
      setMovieCounts(counts);
    } catch (error) {
      console.error('Error loading actors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load real actor stats
  const loadRealActorStats = async () => {
    try {
      setLoadingStats(true);
      
      // Try to get statistics from StatisticsService first
      const { StatisticsService } = await import('@/services/StatisticsService');
      const actorStats = await StatisticsService.getEntityStats('actors');
      
      if (actorStats && actorStats.total !== undefined) {
        const breakdown = actorStats.breakdown || {};
        setStats({
          total: actorStats.total,
          male: breakdown['MALE'] || breakdown['Male'] || breakdown['male'] || 0,
          female: breakdown['FEMALE'] || breakdown['Female'] || breakdown['female'] || 0,
          unknown: breakdown['UNKNOWN'] || breakdown['Unknown'] || breakdown['unknown'] || 0,
          avgMoviesPerActor: Math.round(actorStats.avgMoviesPerEntity || 0),
          filteredCount: totalElements
        });
      } else {
        // Fallback to service-specific API or calculate from current data
        const totalCount = await ActorService.getTotalActorsCount();
        const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
        
        setStats({
          total: totalCount,
          male: actors.filter(a => a.gender.toUpperCase() === 'MALE').length,
          female: actors.filter(a => a.gender.toUpperCase() === 'FEMALE').length,
          unknown: actors.filter(a => a.gender.toUpperCase() === 'UNKNOWN').length,
          avgMoviesPerActor: totalCount > 0 ? Math.round(totalMovies / totalCount) : 0,
          filteredCount: totalElements
        });
      }
    } catch (error) {
      console.error('Error loading real actor stats:', error);
      // Fallback to calculated stats from current data
      const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
      setStats({
        total: actors.length,
        male: actors.filter(a => a.gender.toUpperCase() === 'MALE').length,
        female: actors.filter(a => a.gender.toUpperCase() === 'FEMALE').length,
        unknown: actors.filter(a => a.gender.toUpperCase() === 'UNKNOWN').length,
        avgMoviesPerActor: actors.length > 0 ? Math.round(totalMovies / actors.length) : 0,
        filteredCount: totalElements
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadActors(currentPage - 1, debouncedSearchQuery, filterGender);
  }, [currentPage, itemsPerPage, debouncedSearchQuery, filterGender]);

  // Load real stats after actors are loaded
  useEffect(() => {
    if (!loading && actors.length > 0) {
      loadRealActorStats();
    }
  }, [loading, actors, movieCounts, totalElements]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery, filterGender]);

  // Update filtered count in stats when totalElements changes
  useEffect(() => {
    setStats(prevStats => ({
      ...prevStats,
      filteredCount: totalElements
    }));
  }, [totalElements]);

  // Actions
  const handleEdit = (actor: Actor) => {
    setEditingActor(actor);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmModal.openConfirm({
      title: 'Xóa diễn viên',
      message: 'Bạn có chắc chắn muốn xóa diễn viên này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy bỏ',
      confirmButtonType: 'danger'
    });

    if (confirmed) {
      try {
        confirmModal.setLoadingState(true);
        await ActorService.deleteActor(id);
        
        // Reload current page data
        await loadActors(currentPage - 1, debouncedSearchQuery, filterGender);
      } catch (error) {
        console.error('Error deleting actor:', error);
      } finally {
        confirmModal.setLoadingState(false);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingActor(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingActor(null);
  };

  const handleSaveActor = async (actorData: Partial<Actor>) => {
    try {
      if (editingActor) {
        // Update existing actor
        const updatedActor = await ActorService.updateActor(editingActor.id, actorData);
        if (updatedActor) {
          // Reload current page to reflect changes
          await loadActors(currentPage - 1, debouncedSearchQuery, filterGender);
          // Reload stats
          await loadRealActorStats();
        }
      } else {
        // Add new actor
        await ActorService.addActor(actorData as Omit<Actor, 'id'>);
        // Reload current page to reflect changes
        await loadActors(currentPage - 1, debouncedSearchQuery, filterGender);
        // Reload stats
        await loadRealActorStats();
      }
      handleCloseModal();
      return { success: true };
    } catch (error) {
      console.error('Error saving actor:', error);
      return { success: false, error: 'Có lỗi xảy ra khi lưu diễn viên' };
    }
  };

  // Handle avatar upload separately
  const handleUploadAvatar = async (actorId: string, file: File) => {
    try {
      const updatedActor = await ActorService.uploadActorAvatar(actorId, file);
      if (updatedActor) {
        // Update actor in current list if it exists
        setActors(prevActors => 
          prevActors.map(actor => 
            actor.id === actorId ? updatedActor : actor
          )
        );
        return { success: true };
      }
      return { success: false, error: 'Không thể upload avatar' };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: 'Có lỗi xảy ra khi upload avatar' };
    }
  };

  // Handle avatar deletion separately  
  const handleDeleteAvatar = async (actorId: string) => {
    try {
      const updatedActor = await ActorService.deleteActorAvatar(actorId);
      if (updatedActor) {
        // Update actor in current list if it exists
        setActors(prevActors => 
          prevActors.map(actor => 
            actor.id === actorId ? updatedActor : actor
          )
        );
        return { success: true };
      }
      return { success: false, error: 'Không thể xóa avatar' };
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return { success: false, error: 'Có lỗi xảy ra khi xóa avatar' };
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle sorting - Note: This is client-side sorting on current page only
  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterGender('ALL');
  };

  // Apply client-side filtering and sorting to current page actors
  const filteredAndSortedActors = useMemo(() => {
    let filtered = [...actors];
    
    // Apply gender filter on current page if not 'ALL'
    if (filterGender && filterGender !== 'ALL') {
      filtered = actors.filter(actor => 
        actor.gender.toUpperCase() === filterGender.toUpperCase()
      );
    }
    
    // Apply sorting
    return sortActors(filtered, movieCounts, sortBy, sortOrder);
  }, [actors, filterGender, movieCounts, sortBy, sortOrder]);

  return {
    // State
    actors: filteredAndSortedActors,
    movieCounts,
    loading,
    loadingStats,
    showModal,
    editingActor,
    filterGender,
    searchQuery,
    debouncedSearchQuery,
    stats,
    
    // Sorting
    sortBy,
    sortOrder,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    totalElements,
    
    // Actions
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveActor,
    handleUploadAvatar,
    handleDeleteAvatar,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    setFilterGender,
    setSearchQuery,
    loadRealActorStats,

    // Confirm modal
    confirmModal,
  };
};