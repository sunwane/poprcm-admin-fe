import React, { useState, useEffect } from 'react';
import { Country } from '@/types/Country';
import { validateCountryName, formatCountryName } from '@/utils/countryUtils';
import { CountryService } from '@/services/CountryService';
import GradientButton from '@/components/ui/GradientButton';

interface CountryModalProps {
  isOpen: boolean;
  editingCountry: Country | null;
  onClose: () => void;
  onSave: (countryData: Partial<Country>) => void;
}

export default function CountryModal({ isOpen, editingCountry, onClose, onSave }: CountryModalProps) {
  const [formData, setFormData] = useState({
    countryName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editingCountry changes
  useEffect(() => {
    if (isOpen) {
      if (editingCountry) {
        setFormData({
          countryName: editingCountry.countryName,
        });
      } else {
        setFormData({
          countryName: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingCountry]);

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

    // Validate country name
    const nameValidation = validateCountryName(formData.countryName);
    if (!nameValidation.isValid) {
      newErrors.countryName = nameValidation.error || 'Tên quốc gia không hợp lệ';
    } else {
      // Check if country name already exists
      const exists = await CountryService.checkCountryNameExists(
        formData.countryName.trim(),
        editingCountry?.id
      );
      if (exists) {
        newErrors.countryName = 'Tên quốc gia đã tồn tại';
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

      const countryData = {
        countryName: formatCountryName(formData.countryName.trim()),
      };

      onSave(countryData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu quốc gia' });
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
            {editingCountry ? 'Chỉnh sửa quốc gia' : 'Thêm quốc gia mới'}
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
          {/* Country Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="countryName"
              placeholder="Nhập tên quốc gia..."
              value={formData.countryName}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                errors.countryName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={isSubmitting}
            />
            {errors.countryName && (
              <div className="mt-2 text-red-600 text-sm">
                {errors.countryName}
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
                        editingCountry ? 'Cập nhật' : 'Thêm mới'
                    )}
                </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}