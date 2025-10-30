import { useState, useEffect, useMemo } from 'react';
import { Country } from '@/types/Country';
import { CountryService } from '@/services/CountryService';
import { filterCountriesByName, sortCountries } from '@/utils/countryUtils';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [movieCounts, setMovieCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filter and sort countries
  const filteredCountries = useMemo(() => {
    let filtered = filterCountriesByName(countries, searchQuery);
    return sortCountries(filtered, sortBy, sortOrder);
  }, [countries, searchQuery, sortBy, sortOrder]);

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
      totalMovies,
      countriesWithMovies,
      avgMoviesPerCountry: countries.length > 0 ? Math.round(totalMovies / countries.length) : 0
    };
  }, [countries, movieCounts]);

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

  const handleSort = (field: 'name' | 'id') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
  };
};