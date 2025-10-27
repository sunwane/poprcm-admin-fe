import React, { useState, useEffect } from 'react';
import { User } from '@/types/User';
import AvatarUpload from '@/components/ui/AvatarUpload';
import AvatarService from '@/services/AvatarService';
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
        ? await AvatarService.uploadAvatar(file)
        : await AvatarService.fakeUploadAvatar(file);
      
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
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-(--text-title)">
            {/* {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'} */}
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
          {/* Avatar Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2 text-center">
              Avatar
            </label>
            <AvatarUpload
              currentAvatar={formData.avatarUrl}
              onAvatarChange={handleAvatarChange}
              size="lg"
              disabled={isUploading}
            />
            {uploadError && (
              <div className="mt-2 text-red-600 text-sm text-center">
                {uploadError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-600">*</span>
              </label>
              <FormInput type='text'
                name="username"
                placeholder="Username"
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
              <FormInput type='text'
                name="fullname"
                placeholder="Họ và tên"
                value={formData.fullname}
                onChange={handleInputChange}
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <FormInput 
                type='email'
                name="email"
                placeholder="Email"
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
                filter={formData.gender} // Giá trị hiện tại của gender
                onChange={(value: string) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
                options={[
                  {value:'male', label:'Nam'},
                  {value:'female', label:'Nữ'},
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <FormSelect
                filter={formData.role} // Giá trị hiện tại của gender
                onChange={(value: string) => setFormData(prev => ({ ...prev, role: value as 'ADMIN' | 'USER' }))}
                options={[
                  {value:'ADMIN', label:'Admin'},
                  {value:'USER', label:'User'},
                ]}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button 
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
              disabled={isUploading}
            >
              Hủy
            </button>
            <div className="flex-1 w-full">
              <GradientButton disabled={isUploading}>
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tải lên...
                  </>
                ) : (
                  // editingUser ? 'Cập nhật' : 'Thêm mới'
                  'Thêm mới'
                )}
              </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}