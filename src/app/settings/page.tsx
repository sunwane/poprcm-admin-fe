'use client';

import { useSettings } from '@/hooks/useSettings';
import AvatarUpload from '@/components/ui/AvatarUpload';
import FormInput from '@/components/ui/FormInput';
import RadioButton from '@/components/ui/RadioButton';
import ChangePasswordModal from '@/components/modalForm/ChangePasswordModal';

export default function Settings() {
  const {
    // State
    settings,
    isEditingAvatar,
    isEditingProfile,
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
  } = useSettings();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cài đặt tài khoản</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và bảo mật</p>
        </div>
        
        {/* Change Password Button */}
        <button
          onClick={openPasswordModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Đổi mật khẩu</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('thành công') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-8 px-10 mx-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section - Left Side */}
          <div className="w-fit shrink-0">
            <div className="bg-gray-50 rounded-xl px-8 py-6">
              <label className="block text-sm font-medium text-gray-800 mb-4 text-center">
                Avatar người dùng
              </label>
              
              {isEditingAvatar ? (
                <div className="flex flex-col items-center">
                  <AvatarUpload
                    currentAvatar={settings.profile.avatarUrl}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    disabled={loading}
                  />
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={handleSaveAvatar}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={handleCancelAvatarEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    {settings.profile.avatarUrl ? (
                      <img
                        src={settings.profile.avatarUrl}
                        alt="Avatar"
                        className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-30 h-30 rounded-full bg-linear-to-br from-blue-400 to-blue-800 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                        {user?.userName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3 mt-2">
                    <button
                      onClick={handleChangeAvatar}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Thay đổi ảnh'}
                    </button>
                    <button
                      onClick={handleRemoveAvatar}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={loading || !settings.profile.avatarUrl}
                    >
                      {loading ? 'Đang xóa...' : 'Xóa ảnh'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields - Right Side */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-6">Thông tin cá nhân</h4>
              
              <div className="md:col-span-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Giới tính
                  </label>
                  <RadioButton
                    name="gender"
                    options={[
                      { value: 'MALE', label: 'Nam' },
                      { value: 'FEMALE', label: 'Nữ' }
                    ]}
                    selectedValue={settings.profile.gender}
                    onChange={(value) => updateProfileField('gender', value)}
                    disabled={!isEditingProfile}
                    className="flex flex-row gap-8"
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hiển thị
                  </label>
                  <FormInput
                    name="username"
                    type="text"
                    value={settings.profile.userName || ''}
                    onChange={(e) => updateProfileField('userName', e.target.value)}
                    placeholder="Username"
                    disabled={!isEditingProfile}
                    readonly={!isEditingProfile}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <FormInput
                    name="fullname"
                    type="text"
                    value={settings.profile.fullName}
                    onChange={(e) => updateProfileField('fullName', e.target.value)}
                    placeholder="Nhập tên hiển thị"
                    disabled={!isEditingProfile}
                    readonly={!isEditingProfile}
                    className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <FormInput
                    name="email"
                    type="email"
                    value={settings.profile.email}
                    disabled={true}
                    readonly={true}
                    className={!isEditingProfile ? 'bg-gray-50 text-gray-700' : ''}
                  />
                </div> 
                
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button 
                  onClick={isEditingProfile ? handleSaveProfile : handleEditProfile}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : isEditingProfile
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : isEditingProfile ? 'Lưu thay đổi' : 'Chỉnh sửa'}
                </button>
                {isEditingProfile && (
                  <button 
                    onClick={handleCancelEditProfile}
                    className="px-8 py-3 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
      />
    </div>
  );
}
