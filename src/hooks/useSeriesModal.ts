import { useState, useEffect, useCallback } from 'react';
import { Series, SeriesMovie } from '@/types/Series';
import { Movie } from '@/types/Movies';
import { validateImageFile, compressImage } from '@/utils/uploadUtils';
import { 
  validateSeriesName, 
  validateReleaseYear, 
  validateDescription 
} from '@/utils/seriesUtils';
import { useSeriesMovies } from '@/hooks/useSeriesMovies';
import { SeriesService } from '@/services/SeriesService';

interface FormErrors {
  name?: string;
  description?: string;
  status?: string;
  releaseYear?: string;
  posterUrl?: string;
  submit?: string;
}

export const useSeriesModal = (editingSeries: Series | null, isOpen: boolean) => {
  // Tab and form state
  const [activeTab, setActiveTab] = useState<'info' | 'movies'>('info');
  const [formData, setFormData] = useState<Omit<Series, 'id'>>({
    name: '',
    description: '',
    status: 'Ongoing',
    releaseYear: new Date().getFullYear().toString(),
    posterUrl: '',
    seriesMovies: []
  });

  // File and validation state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Series movies hook
  const {
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setSearchQuery,
    performSearch,
    clearSearch,
    moveSeriesMovie,
    removeSeriesMovie,
    addMovieToSeries
  } = useSeriesMovies();

  // Initialize form data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
      if (editingSeries) {
        setFormData({
          name: editingSeries.name,
          description: editingSeries.description,
          status: editingSeries.status,
          releaseYear: editingSeries.releaseYear,
          posterUrl: editingSeries.posterUrl || '',
          seriesMovies: editingSeries.seriesMovies || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'Ongoing',
          releaseYear: new Date().getFullYear().toString(),
          posterUrl: '',
          seriesMovies: []
        });
      }
      setPosterFile(null);
      setErrors({});
      setIsSubmitting(false);
      setUploadError('');
      // Reset drag state
      setDraggedIndex(null);
      setDragOverIndex(null);
      clearSearch();
    }
  }, [isOpen, editingSeries, clearSearch]);

  // Update search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const excludeMovieIds = (formData.seriesMovies ?? []).map(sm => sm.movieId);
      performSearch(searchQuery, excludeMovieIds);
    }
  }, [searchQuery, formData.seriesMovies, performSearch]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof Omit<Series, 'id' | 'seriesMovies'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Handle series movies change
  const handleSeriesMoviesChange = useCallback((movies: SeriesMovie[]) => {
    setFormData(prev => ({ ...prev, seriesMovies: movies }));
  }, []);

  // Handle poster change
  const handlePosterChange = useCallback(async (file: File | null, previewUrl: string) => {
    setUploadError('');

    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'File không hợp lệ');
        return;
      }

      try {
        let processedFile = file;
        if (file.size > 1024 * 1024) {
          processedFile = await compressImage(file, 800, 0.8);
        }

        setPosterFile(processedFile);
        setFormData(prev => ({ ...prev, posterUrl: previewUrl }));
      } catch (error) {
        setUploadError('Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } else {
      setPosterFile(null);
      setFormData(prev => ({ ...prev, posterUrl: '' }));
    }
  }, []);

  // Movie management handlers
  const handleAddMovie = useCallback((movie: Movie) => {
    const updatedMovies = addMovieToSeries(formData.seriesMovies || [], movie);
    handleSeriesMoviesChange(updatedMovies);
    clearSearch();
  }, [formData.seriesMovies, addMovieToSeries, handleSeriesMoviesChange, clearSearch]);

  const handleRemoveMovie = useCallback((index: number) => {
    const updatedMovies = removeSeriesMovie(formData.seriesMovies || [], index);
    handleSeriesMoviesChange(updatedMovies);
  }, [formData.seriesMovies, removeSeriesMovie, handleSeriesMoviesChange]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedMovies = moveSeriesMovie(formData.seriesMovies || [], draggedIndex, dropIndex);
    handleSeriesMoviesChange(updatedMovies);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, formData.seriesMovies, moveSeriesMovie, handleSeriesMoviesChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const nameValidation = validateSeriesName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.message;
    }

    const yearValidation = validateReleaseYear(formData.releaseYear);
    if (!yearValidation.isValid) {
      newErrors.releaseYear = yearValidation.message;
    }

    if (!formData.status) {
      newErrors.status = 'Vui lòng chọn trạng thái';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      status: 'Ongoing',
      releaseYear: new Date().getFullYear().toString(),
      posterUrl: '',
      seriesMovies: []
    });
    setPosterFile(null);
    setErrors({});
    setUploadError('');
    setActiveTab('info');
    setDraggedIndex(null);
    setDragOverIndex(null);
    clearSearch();
  }, [clearSearch]);

  // Computed values
  const canSwitchToMovies = () => formData.name.trim().length > 0;
  const isProcessing = isSubmitting || isUploading;

  return {
    // Form state
    activeTab,
    formData,
    posterFile,
    errors,
    isSubmitting,
    isUploading,
    uploadError,
    
    // Search state
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    
    // Drag state
    draggedIndex,
    dragOverIndex,
    
    // Computed
    canSwitchToMovies: canSwitchToMovies(),
    isProcessing,
    
    // Form actions
    setActiveTab,
    handleInputChange,
    handleSeriesMoviesChange,
    handlePosterChange,
    validateForm,
    resetForm,
    setIsSubmitting,
    setErrors,
    setUploadError,
    
    // Search actions
    setSearchQuery,
    performSearch,
    clearSearch,
    
    // Movie management actions
    handleAddMovie,
    handleRemoveMovie,
    
    // Drag and drop actions
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  };
};