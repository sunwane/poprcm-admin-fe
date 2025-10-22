'use client';

import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Admin User',
      email: 'admin@poprcm.com',
      phone: '0901234567',
      avatar: '',
      bio: 'Quản trị viên hệ thống POPRCM'
    },
    security: {
      twoFactorAuth: true,
      passwordExpiry: 90,
      sessionTimeout: 30,
      loginNotifications: true
    },
    system: {
      maintenance: false,
      userRegistration: true,
      emailNotifications: true,
      backupFrequency: 'daily',
      logRetention: 30
    },
    appearance: {
      theme: 'light',
      language: 'vi',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'Asia/Ho_Chi_Minh'
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSave = (section) => {
    console.log(`Saving ${section} settings:`, settings[section]);
    // Implement save logic here
  };

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: '👤' },
    { id: 'security', name: 'Bảo mật', icon: '🔒' },
    { id: 'system', name: 'Hệ thống', icon: '⚙️' },
    { id: 'appearance', name: 'Giao diện', icon: '🎨' }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-title) mb-2">Cài đặt tài khoản</h1>
        <p className="text-gray-600">Quản lí cài đặt tài khoản và hệ thống</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-(--text-title)] mb-6">Thông tin cá nhân</h2>
              
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                  A
                </div>
                <div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mr-3">
                    Thay đổi ảnh
                  </button>
                  <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Xóa ảnh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value }
                  })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => handleSave('profile')}
                  className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  Lưu thay đổi
                </button>
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-(--text-title)] mb-6">Cài đặt bảo mật</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Xác thực hai yếu tố (2FA)</h3>
                    <p className="text-sm text-gray-600">Tăng cường bảo mật cho tài khoản</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorAuth: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian hết hạn mật khẩu (ngày)
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian chờ phiên làm việc (phút)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Thông báo đăng nhập</h3>
                    <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.loginNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, loginNotifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <button 
                onClick={() => handleSave('security')}
                className="mt-6 bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Lưu cài đặt bảo mật
              </button>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-(--text-title)] mb-6">Cài đặt hệ thống</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Chế độ bảo trì</h3>
                    <p className="text-sm text-gray-600">Tạm dừng hệ thống để bảo trì</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.system.maintenance}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, maintenance: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Cho phép đăng ký người dùng mới</h3>
                    <p className="text-sm text-gray-600">Người dùng có thể tự đăng ký tài khoản</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.system.userRegistration}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, userRegistration: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tần suất sao lưu dữ liệu
                  </label>
                  <select
                    value={settings.system.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      system: { ...settings.system, backupFrequency: e.target.value }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="hourly">Hàng giờ</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian lưu trữ log (ngày)
                  </label>
                  <input
                    type="number"
                    value={settings.system.logRetention}
                    onChange={(e) => setSettings({
                      ...settings,
                      system: { ...settings.system, logRetention: parseInt(e.target.value) }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button 
                onClick={() => handleSave('system')}
                className="mt-6 bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Lưu cài đặt hệ thống
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-(--text-title)] mb-6">Cài đặt giao diện</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: e.target.value }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                    <option value="auto">Tự động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, language: e.target.value }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng ngày</label>
                  <select
                    value={settings.appearance.dateFormat}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, dateFormat: e.target.value }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                  <select
                    value={settings.appearance.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, timezone: e.target.value }
                    })}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</option>
                    <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => handleSave('appearance')}
                className="mt-6 bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                Lưu cài đặt giao diện
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-(--text-title)] mb-4">Đổi mật khẩu</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}