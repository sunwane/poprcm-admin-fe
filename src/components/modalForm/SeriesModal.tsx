import React, { useState, useEffect } from 'react';
import { Series } from '@/types/Series';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import GradientButton from '@/components/ui/GradientButton';
import { 
  validateSeriesName, 
  validateReleaseYear, 
  validateNumberOfSeasons, 
  validateDescription 
} from '@/utils/seriesUtils';

interface SeriesModalProps {
  isOpen: boolean;
  editingSeries: Series | null;
  onClose: () => void;
  onSave: (seriesData: Omit<Series, 'id' | 'seriesMovies'>) => Promise<void>;
}

interface FormData {
  name: string;
  description: string;
  status: string;
  releaseYear: string;
  numberOfSeasons: number;
  posterUrl: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  status?: string;
  releaseYear?: string;
  numberOfSeasons?: string;
  posterUrl?: string;
  submit?: string;
}

const SeriesModal: React.FC<SeriesModalProps> = ({
  isOpen,
  editingSeries,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'Ongoing',
    releaseYear: new Date().getFullYear().toString(),
    numberOfSeasons: 1,
    posterUrl: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editingSeries changes
  useEffect(() => {
    if (isOpen) {
      if (editingSeries) {
        setFormData({
          name: editingSeries.name,
          description: editingSeries.description,
          status: editingSeries.status,
          releaseYear: editingSeries.releaseYear,
          numberOfSeasons: editingSeries.numberOfSeasons,
          posterUrl: editingSeries.posterUrl
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'Ongoing',
          releaseYear: new Date().getFullYear().toString(),
          numberOfSeasons: 1,
          posterUrl: ''
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editingSeries]);

  // Status options
  const statusOptions = [
    { value: 'Ongoing', label: 'Đang phát sóng' },
    { value: 'Completed', label: 'Đã hoàn thành' },
    { value: 'Cancelled', label: 'Đã hủy' },
    { value: 'Hiatus', label: 'Tạm dừng' }
  ];

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const nameValidation = validateSeriesName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    // Validate description
    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.message;
    }

    // Validate release year
    const yearValidation = validateReleaseYear(formData.releaseYear);
    if (!yearValidation.isValid) {
      newErrors.releaseYear = yearValidation.message;
    }

    // Validate number of seasons
    const seasonsValidation = validateNumberOfSeasons(formData.numberOfSeasons);
    if (!seasonsValidation.isValid) {
      newErrors.numberOfSeasons = seasonsValidation.message;
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = 'Vui lòng chọn trạng thái';
    }

    // Validate poster URL (optional but should be valid if provided)
    if (formData.posterUrl && formData.posterUrl.trim()) {
      try {
        new URL(formData.posterUrl);
      } catch {
        newErrors.posterUrl = 'URL poster không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        releaseYear: formData.releaseYear,
        numberOfSeasons: formData.numberOfSeasons,
        posterUrl: formData.posterUrl.trim() || ''
      });
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu series' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {editingSeries ? 'Chỉnh sửa Series' : 'Thêm Series mới'}
            </h3>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Series Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Series *
              </label>
              <FormInput
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên series..."
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả series..."
                rows={4}
                disabled={isSubmitting}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Row 1: Status and Release Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <FormSelect
                  filter={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm phát hành *
                </label>
                <FormInput
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={(e) => handleInputChange('releaseYear', e.target.value)}
                  type="number"
                  placeholder="2024"
                  disabled={isSubmitting}
                />
                {errors.releaseYear && (
                  <p className="text-red-500 text-sm mt-1">{errors.releaseYear}</p>
                )}
              </div>
            </div>

            {/* Number of Seasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số mùa *
              </label>
              <FormInput
                name="numberOfSeasons"
                value={formData.numberOfSeasons.toString()}
                onChange={(e) => handleInputChange('numberOfSeasons', parseInt(e.target.value) || 1)}
                type="number"
                placeholder="1"
                disabled={isSubmitting}
              />
              {errors.numberOfSeasons && (
                <p className="text-red-500 text-sm mt-1">{errors.numberOfSeasons}</p>
              )}
            </div>

            {/* Poster URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Poster
              </label>
              <FormInput
                name="posterUrl"
                value={formData.posterUrl}
                onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                type="url"
                placeholder="https://example.com/poster.jpg"
                disabled={isSubmitting}
              />
              {errors.posterUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.posterUrl}</p>
              )}
            </div>

            {/* Poster Preview */}
            {formData.posterUrl && !errors.posterUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem trước Poster
                </label>
                <div className="w-32 h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={formData.posterUrl}
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      setErrors(prev => ({ ...prev, posterUrl: 'Không thể tải hình ảnh từ URL này' }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-br from-blue-400 to-blue-800 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-indigo-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  editingSeries ? 'Cập nhật' : 'Thêm mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;