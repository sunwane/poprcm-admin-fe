import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl: string;
}

interface SettingsState {
  profile: ProfileSettings;
}

export const useSettings = () => {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      avatarUrl: '',
    }
  });

  const [originalSettings, setOriginalSettings] = useState({
    profile: {
      name: '',
      email: '',
      avatarUrl: '',
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
          name: user.fullname || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
        }
      });
      setOriginalSettings({
        profile: {
          name: user.fullname || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
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
      // TODO: Gọi API để lưu thông tin profile
      console.log('Saving profile settings:', settings.profile);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditingProfile(false);
      // Cập nhật originalSettings với giá trị mới
      setOriginalSettings(settings);
      setMessage('Thông tin đã được lưu thành công!');
      setTimeout(() => setMessage(''), 5000);
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

  const handleRemoveAvatar = () => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, avatarUrl: '' }
    }));
    setAvatarFile(null);
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
      // TODO: Upload avatar nếu có file mới
      if (avatarFile) {
        console.log('Uploading avatar file:', avatarFile);
        // Mock upload API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setIsEditingAvatar(false);
      setAvatarFile(null);
      setMessage('Avatar đã được cập nhật!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật avatar!');
      setTimeout(() => setMessage(''), 3000);
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
  };
};