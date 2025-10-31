import React, { useState, useEffect } from 'react';
import { Actor } from '@/types/Actor';
import { validateActorName, validateTmdbId, formatActorName } from '@/utils/actorUtils';
import { ActorService } from '@/services/ActorService';
import GradientButton from '@/components/ui/GradientButton';

interface ActorModalProps {
  isOpen: boolean;
  editingActor: Actor | null;
  onClose: () => void;
  onSave: (actorData: Partial<Actor>) => void;
}

export default function ActorModal({ isOpen, editingActor, onClose, onSave }: ActorModalProps) {
  const [formData, setFormData] = useState({
    originName: '',
    tmdbId: '',
    profilePath: '',
    gender: 'male',
    alsoKnownAs: [''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editingActor changes
  useEffect(() => {
    if (isOpen) {
      if (editingActor) {
        setFormData({
          originName: editingActor.originName,
          tmdbId: editingActor.tmdbId,
          profilePath: editingActor.profilePath,
          gender: editingActor.gender,
          alsoKnownAs: editingActor.alsoKnownAs.length > 0 ? editingActor.alsoKnownAs : [''],
        });
      } else {
        setFormData({
          originName: '',
          tmdbId: '',
          profilePath: '',
          gender: 'male',
          alsoKnownAs: [''],
        });
      }
      setErrors({});
    }
  }, [isOpen, editingActor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAlsoKnownAsChange = (index: number, value: string) => {
    const newAlsoKnownAs = [...formData.alsoKnownAs];
    newAlsoKnownAs[index] = value;
    setFormData(prev => ({ ...prev, alsoKnownAs: newAlsoKnownAs }));
  };

  const addAlsoKnownAs = () => {
    setFormData(prev => ({ 
      ...prev, 
      alsoKnownAs: [...prev.alsoKnownAs, ''] 
    }));
  };

  const removeAlsoKnownAs = (index: number) => {
    if (formData.alsoKnownAs.length > 1) {
      const newAlsoKnownAs = formData.alsoKnownAs.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, alsoKnownAs: newAlsoKnownAs }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validate actor name
    const nameValidation = validateActorName(formData.originName);
    if (!nameValidation.isValid) {
      newErrors.originName = nameValidation.error || 'Tên diễn viên không hợp lệ';
    } else {
      // Check if actor name already exists
      const nameExists = await ActorService.checkActorNameExists(
        formData.originName.trim(),
        editingActor?.id
      );
      if (nameExists) {
        newErrors.originName = 'Tên diễn viên đã tồn tại';
      }
    }

    // Validate TMDB ID
    const tmdbValidation = validateTmdbId(formData.tmdbId);
    if (!tmdbValidation.isValid) {
      newErrors.tmdbId = tmdbValidation.error || 'TMDB ID không hợp lệ';
    } else {
      // Check if TMDB ID already exists
      const tmdbExists = await ActorService.checkTmdbIdExists(
        formData.tmdbId.trim(),
        editingActor?.id
      );
      if (tmdbExists) {
        newErrors.tmdbId = 'TMDB ID đã tồn tại';
      }
    }

    // Validate profile path (optional but should be URL if provided)
    if (formData.profilePath.trim() && !formData.profilePath.startsWith('http')) {
      newErrors.profilePath = 'Profile path phải là URL hợp lệ';
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

      const actorData = {
        originName: formatActorName(formData.originName.trim()),
        tmdbId: formData.tmdbId.trim(),
        profilePath: formData.profilePath.trim(),
        gender: formData.gender,
        alsoKnownAs: formData.alsoKnownAs.filter(name => name.trim().length > 0),
      };

      onSave(actorData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu diễn viên' });
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
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-600">
            {editingActor ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actor Name Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên diễn viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="originName"
                placeholder="Nhập tên diễn viên..."
                value={formData.originName}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                  errors.originName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.originName && (
                <div className="mt-2 text-red-600 text-sm">
                  {errors.originName}
                </div>
              )}
            </div>

            {/* TMDB ID Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TMDB ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tmdbId"
                placeholder="Nhập TMDB ID..."
                value={formData.tmdbId}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                  errors.tmdbId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.tmdbId && (
                <div className="mt-2 text-red-600 text-sm">
                  {errors.tmdbId}
                </div>
              )}
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                required
                disabled={isSubmitting}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="unknown">Không rõ</option>
              </select>
            </div>

            {/* Profile Path Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Path (URL ảnh)
              </label>
              <input
                type="url"
                name="profilePath"
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={formData.profilePath}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                  errors.profilePath ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.profilePath && (
                <div className="mt-2 text-red-600 text-sm">
                  {errors.profilePath}
                </div>
              )}
            </div>

            {/* Also Known As Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên khác (Also Known As)
              </label>
              {formData.alsoKnownAs.map((name, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nhập tên khác..."
                    value={name}
                    onChange={(e) => handleAlsoKnownAsChange(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    disabled={isSubmitting}
                  />
                  {formData.alsoKnownAs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAlsoKnownAs(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                      disabled={isSubmitting}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAlsoKnownAs}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                + Thêm tên khác
              </button>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 text-red-600 text-sm text-center">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4 mt-8">
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
                    editingActor ? 'Cập nhật' : 'Thêm mới'
                )}
            </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}