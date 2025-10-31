import { useState, useEffect, useMemo } from 'react';
import { Actor, FilterGender, SortBy } from '@/types/Actor';
import { ActorService } from '@/services/ActorService';
import { filterActorsByQuery, sortActors } from '@/utils/actorUtils';

export const useActors = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [filterGender, setFilterGender] = useState<FilterGender>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting states
  const [sortBy, setSortBy] = useState<SortBy>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load actors on mount
  useEffect(() => {
    const loadActors = async () => {
      try {
        const actorsData = await ActorService.getAllActors();
        setActors(actorsData);
        
        // Load movie counts for each actor
        const counts: Record<string, number> = {};
        for (const actor of actorsData) {
          counts[actor.id] = await ActorService.getMovieCountByActor(actor.id);
        }
        setMovieCounts(counts);
      } catch (error) {
        console.error('Error loading actors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActors();
  }, []);

  // Filter and sort actors
  const filteredActors = useMemo(() => {
    let filtered = actors.filter(actor => {
      const genderMatch = filterGender === 'all' || actor.gender.toLowerCase() === filterGender;
      const searchMatch = searchQuery === '' || 
        actor.originName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        actor.tmdbId.includes(searchQuery) ||
        actor.alsoKnownAs.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()));
      return genderMatch && searchMatch;
    });

    // Apply sorting
    return sortActors(filtered, movieCounts, sortBy, sortOrder);
  }, [actors, filterGender, searchQuery, sortBy, sortOrder, movieCounts]);

  // Paginated actors
  const paginatedActors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredActors.slice(startIndex, endIndex);
  }, [filteredActors, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredActors.length / itemsPerPage);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGender, searchQuery, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalMovies = Object.values(movieCounts).reduce((sum, count) => sum + count, 0);
    return {
      total: actors.length,
      male: actors.filter(a => a.gender.toLowerCase() === 'male').length,
      female: actors.filter(a => a.gender.toLowerCase() === 'female').length,
      unknown: actors.filter(a => a.gender.toLowerCase() === 'unknown').length,
      avgMoviesPerActor: actors.length > 0 ? Math.round(totalMovies / actors.length) : 0
    };
  }, [actors, movieCounts]);

  // Actions
  const handleEdit = (actor: Actor) => {
    setEditingActor(actor);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) {
      try {
        await ActorService.deleteActor(id);
        setActors(actors.filter(actor => actor.id !== id));
        // Remove from movieCounts
        const newMovieCounts = { ...movieCounts };
        delete newMovieCounts[id];
        setMovieCounts(newMovieCounts);
      } catch (error) {
        console.error('Error deleting actor:', error);
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
          setActors(actors.map(actor => 
            actor.id === editingActor.id ? updatedActor : actor
          ));
        }
      } else {
        // Add new actor
        const newActor = await ActorService.addActor(actorData as Omit<Actor, 'id'>);
        setActors([...actors, newActor]);
        // Initialize movie count for new actor
        setMovieCounts(prev => ({ ...prev, [newActor.id]: 0 }));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving actor:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    // State
    actors,
    movieCounts,
    loading,
    showModal,
    editingActor,
    filterGender,
    searchQuery,
    filteredActors,
    paginatedActors,
    stats,
    
    // Sorting
    sortBy,
    sortOrder,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveActor,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    setFilterGender,
    setSearchQuery,
  };
};