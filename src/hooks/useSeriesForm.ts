import { useState, useEffect, useCallback } from 'react';
import { Series, SeriesMovie } from '@/types/Series';
import { validateImageFile, compressImage } from '@/utils/uploadUtils';
import { 
  validateSeriesName, 
  validateReleaseYear, 
  validateDescription 
} from '@/utils/seriesUtils';

interface FormErrors {
  name?: string;
  description?: string;
  status?: string;
  releaseYear?: string;
  posterUrl?: string;
  submit?: string;
}

export const useSeriesForm = (editingSeries: Series | null, isOpen: boolean) => {
  const [activeTab, setActiveTab] = useState<'info' | 'movies'>('info');
  const [formData, setFormData] = useState<Omit<Series, 'id'>>({
    name: '',
    description: '',
    status: 'Ongoing',
    releaseYear: new Date().getFullYear().toString(),
    posterUrl: '',
    seriesMovies: []
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Initialize form data
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
    }
  }, [isOpen, editingSeries]);

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
  }, []);

  const canSwitchToMovies = () => formData.name.trim().length > 0;
  const isProcessing = isSubmitting || isUploading;

  return {
    // State
    activeTab,
    formData,
    posterFile,
    errors,
    isSubmitting,
    isUploading,
    uploadError,
    
    // Computed
    canSwitchToMovies: canSwitchToMovies(),
    isProcessing,
    
    // Actions
    setActiveTab,
    handleInputChange,
    handleSeriesMoviesChange,
    handlePosterChange,
    validateForm,
    resetForm,
    setIsSubmitting,
    setErrors,
    
    // Setters for external use
    setUploadError
  };
};