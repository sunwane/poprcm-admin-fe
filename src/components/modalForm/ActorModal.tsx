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
import Notification from '@/components/ui/Notification';

interface ActorModalProps {
  isOpen: boolean;
  editingActor: Actor | null;
  onClose: () => void;
  onSave: (actorData: Partial<Actor>) => Promise<{ success: boolean; error?: string }>;
  onUploadAvatar?: (actorId: string, file: File) => Promise<{ success: boolean; error?: string }>;
  onDeleteAvatar?: (actorId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ActorModal({ isOpen, editingActor, onClose, onSave, onUploadAvatar, onDeleteAvatar }: ActorModalProps) {
  const [formData, setFormData] = useState({
    originName: '',
    tmdbId: '',
    profilePath: '',
    gender: 'MALE',
    alsoKnownAs: [''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  
  // Notification states
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Reset form when modal opens/closes or editingActor changes
  useEffect(() => {
    if (isOpen) {
      if (editingActor) {
        setFormData({
          originName: editingActor.originName,
          tmdbId: editingActor.tmdbId || '',
          profilePath: editingActor.profilePath || '',
          gender: editingActor.gender,
          alsoKnownAs: editingActor.alsoKnownAs && editingActor.alsoKnownAs.length > 0 ? editingActor.alsoKnownAs : [''],
        });
      } else {
        setFormData({
          originName: '',
          tmdbId: '',
          profilePath: '',
          gender: 'MALE',
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

    if (file && editingActor && onUploadAvatar) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'File không hợp lệ');
        return;
      }

      try {
        setIsUploading(true);
        
        // Compress image if it's too large
        let processedFile = file;
        if (file.size > 1024 * 1024) {
          processedFile = await compressImage(file, 800, 0.8);
        }

        // Upload avatar immediately for existing actor
        const result = await onUploadAvatar(editingActor.id, processedFile);
        
        if (result.success) {
          setFormData(prev => ({ ...prev, profilePath: previewUrl }));
          setNotification({
            show: true,
            message: 'Tải ảnh lên thành công!',
            type: 'success'
          });
        } else {
          setUploadError(result.error || 'Không thể upload avatar');
          setNotification({
            show: true,
            message: result.error || 'Không thể upload avatar',
            type: 'error'
          });
        }
      } catch (error) {
        setUploadError('Không thể xử lý ảnh. Vui lòng thử lại.');
        setNotification({
          show: true,
          message: 'Không thể xử lý ảnh. Vui lòng thử lại.',
          type: 'error'
        });
      } finally {
        setIsUploading(false);
      }
    } else if (file) {
      // For new actor, just preview the image
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setUploadError(validation.error || 'File không hợp lệ');
        return;
      }

      try {
        // Compress image if it's too large
        let processedFile = file;
        if (file.size > 1024 * 1024) {
          processedFile = await compressImage(file, 800, 0.8);
        }

        setAvatarFile(processedFile);
        setFormData(prev => ({ ...prev, profilePath: previewUrl }));
      } catch (error) {
        setUploadError('Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } else {
      // Handle avatar deletion for existing actor
      if (editingActor && formData.profilePath && onDeleteAvatar) {
        try {
          setIsUploading(true);
          const result = await onDeleteAvatar(editingActor.id);
          
          if (result.success) {
            setFormData(prev => ({ ...prev, profilePath: '' }));
            setNotification({
              show: true,
              message: 'Xóa ảnh thành công!',
              type: 'success'
            });
          } else {
            setNotification({
              show: true,
              message: result.error || 'Không thể xóa avatar',
              type: 'error'
            });
          }
        } catch (error) {
          setNotification({
            show: true,
            message: 'Có lỗi xảy ra khi xóa avatar',
            type: 'error'
          });
        } finally {
          setIsUploading(false);
        }
      } else {
        setAvatarFile(null);
        setFormData(prev => ({ ...prev, profilePath: '' }));
      }
    }
  };

  // Upload avatar for new actors only (fallback method)
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

      // For new actor, upload avatar if there's a file
      if (!editingActor && avatarFile) {
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
        profilePath: editingActor ? undefined : finalFormData.profilePath, // Don't update profilePath for existing actor
        gender: finalFormData.gender,
        alsoKnownAs: finalFormData.alsoKnownAs.filter(name => name.trim().length > 0),
      };

      const result = await onSave(actorData);
      
      if (result.success) {
        setNotification({
          show: true,
          message: editingActor ? 'Cập nhật diễn viên thành công!' : 'Thêm diễn viên thành công!',
          type: 'success'
        });
        
        // Close modal after short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrors({ submit: result.error || 'Có lỗi xảy ra khi lưu diễn viên' });
        setNotification({
          show: true,
          message: result.error || 'Có lỗi xảy ra khi lưu diễn viên',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = 'Có lỗi xảy ra khi lưu diễn viên';
      setErrors({ submit: errorMessage });
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
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
                
                {/* Avatar Action Buttons */}
                <div className="mt-4 flex justify-center space-x-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          handleAvatarChange(file, previewUrl);
                        }
                      }}
                      disabled={isSubmitting || isUploading}
                    />
                    <span className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formData.profilePath ? 'Thay ảnh' : 'Thêm ảnh'}
                    </span>
                  </label>
                  
                  {formData.profilePath && (
                    <button
                      type="button"
                      onClick={() => handleAvatarChange(null, '')}
                      disabled={isSubmitting || isUploading}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa ảnh
                    </button>
                  )}
                </div>
                
                {isUploading && (
                  <div className="mt-3 text-blue-600 text-sm text-center flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Đang tải ảnh lên...
                  </div>
                )}
                
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
                        { value: 'MALE', label: 'Nam' },
                        { value: 'FEMALE', label: 'Nữ' },
                        { value: 'UNKNOWN', label: 'Không rõ' },
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
      
      {/* Notification */}
      <Notification
        isVisible={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        autoClose={true}
        autoCloseDelay={3000}
        position="bottom-right"
      />
    </div>
  );
}