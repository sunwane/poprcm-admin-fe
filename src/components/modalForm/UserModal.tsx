import React, { useState, useEffect } from 'react';
import { User } from '@/types/User';
import AvatarUpload from '@/components/ui/AvatarUpload';
import AvatarService from '@/services/UploadService';
import { validateImageFile, compressImage } from '@/utils/uploadUtils';
import GradientButton from '../ui/GradientButton';
import FormSelect from '../ui/FormSelect';
import FormInput from '../ui/FormInput';

interface UserModalProps {
  isOpen: boolean;
  // editingUser: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

export default function UserModal({ isOpen, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    gender: 'male' as 'male' | 'female',
    role: 'USER',
    avatarUrl: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Update form data when editing user
  useEffect(() => {
    // if (editingUser) {
    //   setFormData({
    //     username: editingUser.username,
    //     fullname: editingUser.fullname,
    //     email: editingUser.email,
    //     gender: editingUser.gender as 'male' | 'female',
    //     role: editingUser.role?.valueOf() || 'USER',
    //     avatarUrl: editingUser.avatarUrl || '',
    //   });
    // } else {
      setFormData({
        username: '',
        fullname: '',
        email: '',
        gender: 'male',
        role: 'USER',
        avatarUrl: '',
      });
    // }
    setAvatarFile(null);
    setUploadError('');
  // }, [editingUser, isOpen]);
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }) );
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
        setFormData(prev => ({ ...prev, avatarUrl: previewUrl })); // Cập nhật URL preview
      } catch (error) {
        setUploadError('Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } else {
      setAvatarFile(null);
      setFormData(prev => ({ ...prev, avatarUrl: '' })); // Xóa URL preview nếu không có file
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    
    try {
      let finalFormData = { ...formData };

      // Upload avatar if there's a new file
      if (avatarFile) {
        try {
          const uploadedUrl = await uploadAvatar(avatarFile);
          finalFormData.avatarUrl = uploadedUrl;
        } catch (error) {
          setUploadError(error instanceof Error ? error.message : 'Lỗi upload avatar');
          return;
        }
      }

      onSave(finalFormData);

      // Reset form after save
      setFormData({
        username: '',
        fullname: '',
        email: '',
        gender: 'male',
        role: 'USER',
        avatarUrl: '',
      });
      setAvatarFile(null);
      setUploadError('');
    } catch (error) {
      console.error('Error saving user:', error);
      setUploadError('Có lỗi xảy ra khi lưu thông tin người dùng');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setFormData({
      username: '',
      fullname: '',
      email: '',
      gender: 'male',
      role: 'USER',
      avatarUrl: '',
    });
    setAvatarFile(null);
    setUploadError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-blue-600">
            Thêm người dùng mới
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
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
                  Avatar người dùng
                </label>
                <div className="flex justify-center">
                  <AvatarUpload
                    currentAvatar={formData.avatarUrl}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    disabled={isUploading}
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
                <h4 className="text-lg font-semibold text-blue-800 mb-6">Thông tin cá nhân</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-600">*</span>
                    </label>
                    <FormInput 
                      type='text'
                      name="username"
                      placeholder="Nhập username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <FormInput 
                      type='text'
                      name="fullname"
                      placeholder="Nhập họ và tên"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <FormInput 
                      type='email'
                      name="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <FormSelect
                      filter={formData.gender}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
                      options={[
                        {value:'male', label:'Nam'},
                        {value:'female', label:'Nữ'},
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <FormSelect
                      filter={formData.role}
                      onChange={(value: string) => setFormData(prev => ({ ...prev, role: value as 'ADMIN' | 'USER' }))}
                      options={[
                        {value:'ADMIN', label:'Quản trị viên'},
                        {value:'USER', label:'Người dùng'},
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <div className='flex-1'>
              <button 
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium w-full"
              disabled={isUploading}
            >
              Hủy bỏ
            </button>
            </div>
            <div className='flex-1'>
              <GradientButton 
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Thêm người dùng'
                )}
              </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}