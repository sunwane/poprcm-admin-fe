'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { getGenderColor, getGenderDisplayName, formatDate, getInitials } from '@/utils/userUtils';
import GradientAvatar from '@/components/ui/GradientAvatar';
import GradientButton from '@/components/ui/GradientButton';

export default function Users() {
  const {
    loading,
    showModal,
    editingUser,
    filterGender,
    searchQuery,
    filteredUsers,
    stats,
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveUser,
    setFilterGender,
    setSearchQuery,
  } = useUsers();

  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    gender: 'male' as const,
    avatarUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveUser(formData);
    setFormData({ username: '', fullname: '', email: '', gender: 'male', avatarUrl: '' });
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(text-title) mb-2">Quản lí Người dùng</h1>
          <p className="text-gray-600">Quản lí tài khoản người dùng hiện có trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <select 
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <GradientButton onClick={handleOpenAddModal}>
            Thêm Người dùng
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary) mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng người dùng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary) mb-1">{stats.admin}</div>
          <div className="text-gray-600 text-sm">Tổng số tài khoản Admin</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary) mb-1">{stats.users}</div>
          <div className="text-gray-600 text-sm">Tổng số tài khoản User</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.male}</div>
          <div className="text-gray-600 text-sm">Người dùng Nam</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-pink-600 mb-1">{stats.female}</div>
          <div className="text-gray-600 text-sm">Người dùng Nữ</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.thisMonth}</div>
          <div className="text-gray-600 text-sm">Người dùng mới tháng này</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-(--text-title)">Danh sách Người dùng ({filteredUsers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Người dùng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giới tính</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.fullname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <GradientAvatar initial={getInitials(user.fullname)} 
                          />)}
                      </div>
                      <div>
                        <div className="font-medium text-(--text-primary)">{user.fullname}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">@{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(user.gender)}`}>
                      {getGenderDisplayName(user.gender)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-(--text-title) mb-4">
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="fullname"
                  placeholder="Họ và tên"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <input
                type="url"
                name="avatarUrl"
                placeholder="URL Avatar (tùy chọn)"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-4"
              />
              <div className="flex space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  {editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}