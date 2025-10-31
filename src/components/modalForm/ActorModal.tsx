import React, { useState, useEffect } from 'react';
import { Actor } from '@/types/Actor';
import { validateActorName, validateTmdbId, formatActorName } from '@/utils/actorUtils';
import { validateImageFile, compressImage } from '@/utils/uploadUtils';
import { ActorService } from '@/services/ActorService';
import AvatarUpload from '@/components/ui/AvatarUpload';
import AvatarService from '@/services/UploadService';
import GradientButton from '@/components/ui/GradientButton';
import FormSelect from '@/components/ui/FormSelect';
import FormInput from '@/components/ui/FormInput';

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
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

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
      setAvatarFile(null);
      setUploadError('');
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

  const handleAvatarChange = async (file: File | null, previewUrl: string) => {
    setUploadError('');

    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'File không hợp lệ');
        return;
      }

      try {
        // Compress image if it's too large
        let processedFile = file;
        if (file.size > 1024 * 1024) { // Nếu file > 1MB, nén ảnh
          processedFile = await compressImage(file, 800, 0.8);
        }

        setAvatarFile(processedFile); // Lưu file để upload sau
        setFormData(prev => ({ ...prev, profilePath: previewUrl })); // Cập nhật URL preview
      } catch (error) {
        setUploadError('Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } else {
      setAvatarFile(null);
      setFormData(prev => ({ ...prev, profilePath: '' })); // Xóa URL preview nếu không có file
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      // Use real service for production, fake for development
      const uploadedUrl = process.env.NODE_ENV === 'production' 
        ? await AvatarService.uploadImage(file)
        : await AvatarService.fakeUploadImage(file);
      
      return uploadedUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError('');

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      let finalFormData = { ...formData };

      // Upload avatar if there's a new file
      if (avatarFile) {
        try {
          const uploadedUrl = await uploadAvatar(avatarFile);
          finalFormData.profilePath = uploadedUrl;
        } catch (error) {
          setUploadError(error instanceof Error ? error.message : 'Lỗi upload ảnh');
          setIsSubmitting(false);
          return;
        }
      }

      const actorData = {
        originName: formatActorName(finalFormData.originName.trim()),
        tmdbId: finalFormData.tmdbId.trim(),
        profilePath: finalFormData.profilePath,
        gender: finalFormData.gender,
        alsoKnownAs: finalFormData.alsoKnownAs.filter(name => name.trim().length > 0),
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
    if (!isSubmitting && !isUploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-blue-600">
            {editingActor ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting || isUploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Avatar Section - Left Side */}
            <div className="lg:w-2/5 flex flex-col items-center">
              <div className="bg-gray-50 rounded-xl p-6 w-full">
                <label className="block text-sm font-medium text-gray-800 mb-4 text-center">
                  Ảnh diễn viên
                </label>
                <div className="flex justify-center">
                  <AvatarUpload
                    currentAvatar={formData.profilePath}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    disabled={isSubmitting || isUploading}
                  />
                </div>
                {uploadError && (
                  <div className="mt-4 text-red-600 text-sm text-center">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields - Right Side */}
            <div className="lg:w-2/3">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-6">Thông tin diễn viên</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Actor Name Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên diễn viên <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      type="text"
                      name="originName"
                      placeholder="Nhập tên diễn viên..."
                      value={formData.originName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting || isUploading}
                    />
                  </div>

                  {/* TMDB ID Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TMDB ID <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      type="text"
                      name="tmdbId"
                      placeholder="Nhập TMDB ID..."
                      value={formData.tmdbId}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting || isUploading}
                    />
                  </div>

                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      filter={formData.gender}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, gender: value }))}
                      options={[
                        { value: 'male', label: 'Nam' },
                        { value: 'female', label: 'Nữ' },
                        { value: 'unknown', label: 'Không rõ' },
                      ]}
                    />
                  </div>

                  {/* Also Known As Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên khác (Also Known As)
                    </label>
                    {formData.alsoKnownAs.map((name, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <FormInput
                          type="text"
                          placeholder="Nhập tên khác..."
                          value={name}
                          onChange={(e) => handleAlsoKnownAsChange(index, e.target.value)}
                          disabled={isSubmitting || isUploading}
                          name = {`alsoKnownAs-${index}`}
                        />
                        {formData.alsoKnownAs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAlsoKnownAs(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                            disabled={isSubmitting || isUploading}
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
                      disabled={isSubmitting || isUploading}
                    >
                      + Thêm tên khác
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 text-red-600 text-sm text-center">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex-1">
              <button 
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium w-full"
                disabled={isSubmitting || isUploading}
              >
                Hủy bỏ
              </button>
            </div>
            <div className="flex-1">
              <GradientButton 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
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