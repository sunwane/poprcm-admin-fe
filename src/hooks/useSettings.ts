import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/UserService';

interface ProfileSettings {
  fullName: string;
  userName: string;
  email: string;
  avatarUrl: string;
  gender: 'male' | 'female' | '';
}

export const useSettings = () => {
  const { user, setUser } = useAuth();
  
  const [settings, setSettings] = useState({
    profile: {
      fullName: '',
      userName: '',
      email: '',
      avatarUrl: '',
      gender: '' as 'male' | 'female' | '',
    }
  });

  const [originalSettings, setOriginalSettings] = useState({
    profile: {
      fullName: '',
      userName: '',
      email: '',
      avatarUrl: '',
      gender: '' as 'male' | 'female' | '',
    }
  });

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Initialize settings when user changes
  useEffect(() => {
    if (user) {
      setSettings({
        profile: {
          fullName: user.fullName || '',
          userName: user.userName || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
          gender: (user as any).gender || '',
        }
      });
      setOriginalSettings({
        profile: {
          fullName: user.fullName || '',
          userName: user.userName || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
          gender: (user as any).gender || '',
        }
      });
    }
  }, [user]);

  // Profile form handlers
  const updateProfileField = (field: keyof ProfileSettings, value: string) => {
    if (!isEditingProfile) return; // Chỉ cho phép update khi đang edit
    
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    // Khôi phục dữ liệu ban đầu
    setSettings(originalSettings);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      console.log('Saving profile settings:', settings.profile);

      const updatedUser = await UserService.updateProfile(user?.id || '', {
        userName: settings.profile.userName,
        fullName: settings.profile.fullName,
        gender: settings.profile.gender
      });
      
      if (updatedUser) {
        setIsEditingProfile(false);
        
        // Cập nhật originalSettings với giá trị mới
        setOriginalSettings(settings);
        
        // Cập nhật thông tin user trong localStorage
        const updatedUserData = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Cập nhật user state trong useAuth context
        setUser(updatedUserData);
        
        setMessage('Thông tin đã được lưu thành công!');
        
        // Reload trang sau 1.5 giây để người dùng thấy thông báo thành công
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage('Không thể lưu thông tin. Vui lòng thử lại!');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi lưu thông tin!');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Avatar handlers
  const handleAvatarChange = async (file: File | null, previewUrl: string) => {
    if (file) {
      setAvatarFile(file);
      setSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: previewUrl }
      }));
    } else {
      setAvatarFile(null);
      setSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: '' }
      }));
    }
  };

  const handleChangeAvatar = () => {
    setIsEditingAvatar(true);
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const success = await UserService.deleteAvatar(user.id);
        
        if (success) {
          setSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUrl: '' }
          }));
          setOriginalSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUrl: '' }
          }));
          
          // Cập nhật thông tin user trong localStorage
          const updatedUser = { ...user, avatarUrl: '' };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          
          setAvatarFile(null);
          setMessage('Avatar đã được xóa thành công!');
          
          // Reload trang sau 1.5 giây để người dùng thấy thông báo thành công
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setMessage('Không thể xóa avatar. Vui lòng thử lại!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi xóa avatar!');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAvatarEdit = () => {
    setIsEditingAvatar(false);
    setAvatarFile(null);
    // Khôi phục avatar ban đầu
    if (user?.avatarUrl) {
      setSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: user.avatarUrl || '' }
      }));
    }
  };

  const handleSaveAvatar = async () => {
    setLoading(true);
    try {
      if (avatarFile && user?.id) {
        console.log('Uploading avatar file:', avatarFile);
        const avatarUrl = await UserService.uploadAvatar(user.id, avatarFile);

        if (avatarUrl) {
          // Cập nhật settings với URL avatar mới
          setSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUrl }
          }));
          setOriginalSettings(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUrl }
          }));

          // Cập nhật thông tin user trong localStorage
          const updatedUser = { ...user, avatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setMessage('Avatar đã được tải lên thành công!');

          // Reload trang sau 1.5 giây để người dùng thấy thông báo thành công
          setTimeout(() => {
            window.location.reload();
          }, 1500);

        } else {
          setMessage('Không thể tải lên avatar. Vui lòng thử lại!');
          setTimeout(() => setMessage(''), 5000);
        }
      }

      setIsEditingAvatar(false);
      setAvatarFile(null);
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật avatar!');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Password modal handlers
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  // Clear message
  const clearMessage = () => {
    setMessage('');
  };

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const success = await UserService.changePassword(oldPassword, newPassword);
      
      if (success) {
        setMessage('Đổi mật khẩu thành công!');
        
        // Reload trang sau 1.5 giây để người dùng thấy thông báo thành công
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return true;
      } else {
        setMessage('Không thể đổi mật khẩu. Vui lòng thử lại!');
        setTimeout(() => setMessage(''), 5000);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi đổi mật khẩu!';
      setMessage(errorMessage);
      setTimeout(() => setMessage(''), 5000);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    settings,
    isEditingAvatar,
    isEditingProfile,
    avatarFile,
    loading,
    message,
    isPasswordModalOpen,
    user,

    // Profile handlers
    updateProfileField,
    handleEditProfile,
    handleCancelEditProfile,
    handleSaveProfile,

    // Avatar handlers
    handleAvatarChange,
    handleChangeAvatar,
    handleRemoveAvatar,
    handleCancelAvatarEdit,
    handleSaveAvatar,

    // Modal handlers
    openPasswordModal,
    closePasswordModal,

    // Utility
    clearMessage,
    changePassword,
  };
};