'use client';

import { useState } from 'react';
import GradientAvatar from '@/components/ui/GradientAvatar';

export default function Settings() {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Admin User',
      email: 'admin@poprcm.com',
      phone: '0901234567',
      avatar: '',
      bio: 'Quản trị viên hệ thống POPRCM'
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings[section as keyof typeof settings]);
    // Implement save logic here
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    console.log('Changing password...');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Đổi mật khẩu thành công!');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header với Tab Toggle */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Cài đặt tài khoản</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và mật khẩu</p>
        </div>
        
        {/* Tab Toggle - Horizontal */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            👤 Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            🔒 Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* Content - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-6">Thông tin cá nhân</h2>
            
            {/* Avatar Section */}
            <div className="flex items-center mb-8">
              <GradientAvatar initial="A" />
              <div className="ml-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-3">
                  Thay đổi ảnh
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                  Xóa ảnh
                </button>
              </div>
            </div>

            {/* Form Fields - Wider Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, name: e.target.value }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, email: e.target.value }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, phone: e.target.value }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Bio Field - Full Width */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
              <textarea
                value={settings.profile.bio}
                onChange={(e) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, bio: e.target.value }
                })}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                onClick={() => handleSave('profile')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-6">Đổi mật khẩu</h2>
            
            <div className="max-w-md">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button 
                  onClick={handleChangePassword}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Đổi mật khẩu
                </button>
                <button 
                  onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
