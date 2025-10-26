import React, { useState, useEffect } from 'react';
import { Genre } from '@/types/Genres';
import { validateGenreName, formatGenreName } from '@/utils/genresUtils';
import { GenresService } from '@/services/GenresService';
import GradientButton from '@/components/ui/GradientButton';

interface GenreModalProps {
  isOpen: boolean;
  editingGenre: Genre | null;
  onClose: () => void;
  onSave: (genreData: Partial<Genre>) => void;
}

export default function GenreModal({ isOpen, editingGenre, onClose, onSave }: GenreModalProps) {
  const [formData, setFormData] = useState({
    genresName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editingGenre changes
  useEffect(() => {
    if (isOpen) {
      if (editingGenre) {
        setFormData({
          genresName: editingGenre.genresName,
        });
      } else {
        setFormData({
          genresName: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingGenre]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validate genre name
    const nameValidation = validateGenreName(formData.genresName);
    if (!nameValidation.isValid) {
      newErrors.genresName = nameValidation.error || 'Tên thể loại không hợp lệ';
    } else {
      // Check if genre name already exists
      const exists = await GenresService.checkGenreNameExists(
        formData.genresName.trim(),
        editingGenre?.id
      );
      if (exists) {
        newErrors.genresName = 'Tên thể loại đã tồn tại';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const genreData = {
        genresName: formatGenreName(formData.genresName.trim()),
      };

      onSave(genreData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu thể loại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-600">
            {editingGenre ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Genre Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thể loại <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="genresName"
              placeholder="Nhập tên thể loại..."
              value={formData.genresName}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                errors.genresName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {errors.genresName && (
              <div className="mt-2 text-red-600 text-sm">
                {errors.genresName}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4">
            <button 
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 shadow-md"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <div className="flex-1">
              <GradientButton 
                disabled={isSubmitting} 
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  editingGenre ? 'Cập nhật' : 'Thêm mới'
                )}
              </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}