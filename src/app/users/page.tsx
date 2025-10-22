'use client';

import { useState } from 'react';

export default function Users() {
  const [usersList, setUsersList] = useState([
    { 
      id: 1, 
      name: 'Nguyễn Văn An', 
      email: 'nguyenvanan@gmail.com',
      phone: '0901234567',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-15',
      lastLogin: '2024-10-22',
      watchedMovies: 245,
      subscription: 'premium'
    },
    { 
      id: 2, 
      name: 'Trần Thị Bình', 
      email: 'tranthibinh@gmail.com',
      phone: '0912345678',
      role: 'user',
      status: 'active',
      joinDate: '2023-03-20',
      lastLogin: '2024-10-21',
      watchedMovies: 156,
      subscription: 'basic'
    },
    { 
      id: 3, 
      name: 'Lê Hoàng Cường', 
      email: 'lehoangcuong@gmail.com',
      phone: '0923456789',
      role: 'moderator',
      status: 'active',
      joinDate: '2023-05-10',
      lastLogin: '2024-10-20',
      watchedMovies: 89,
      subscription: 'premium'
    },
    { 
      id: 4, 
      name: 'Phạm Thị Dung', 
      email: 'phamthidung@gmail.com',
      phone: '0934567890',
      role: 'user',
      status: 'suspended',
      joinDate: '2023-07-05',
      lastLogin: '2024-09-15',
      watchedMovies: 67,
      subscription: 'basic'
    },
    { 
      id: 5, 
      name: 'Võ Minh Tuấn', 
      email: 'vominhtuan@gmail.com',
      phone: '0945678901',
      role: 'user',
      status: 'inactive',
      joinDate: '2023-09-12',
      lastLogin: '2024-08-30',
      watchedMovies: 23,
      subscription: 'free'
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsersList(usersList.filter(user => user.id !== id));
    }
  };

  const handleSuspend = (id) => {
    setUsersList(usersList.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = usersList.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const statusMatch = filterStatus === 'all' || user.status === filterStatus;
    const subscriptionMatch = filterSubscription === 'all' || user.subscription === filterSubscription;
    return roleMatch && statusMatch && subscriptionMatch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--text-title)] mb-2">Quản lí Người dùng</h1>
          <p className="text-gray-600">Quản lí tài khoản người dùng trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">Người dùng</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
          <select 
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả gói</option>
            <option value="premium">Premium</option>
            <option value="basic">Basic</option>
            <option value="free">Free</option>
          </select>
          <button 
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{usersList.length}</div>
          <div className="text-gray-600 text-sm">Tổng người dùng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{usersList.filter(u => u.status === 'active').length}</div>
          <div className="text-gray-600 text-sm">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">{usersList.filter(u => u.subscription === 'premium').length}</div>
          <div className="text-gray-600 text-sm">Premium</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-red-600 mb-1">{usersList.filter(u => u.role === 'admin').length}</div>
          <div className="text-gray-600 text-sm">Admin</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{usersList.filter(u => u.status === 'suspended').length}</div>
          <div className="text-gray-600 text-sm">Bị khóa</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-(--text-title)]">Danh sách Người dùng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên người dùng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Gói dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số phim đã xem</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày tham gia</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Lần đăng nhập cuối</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-(--text-primary)]">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription)}`}>
                      {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">{user.watchedMovies}</td>
                  <td className="px-6 py-4">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Hoạt động' : user.status === 'inactive' ? 'Không hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleSuspend(user.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          user.status === 'suspended'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {user.status === 'suspended' ? 'Mở khóa' : 'Khóa'}
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
            <h3 className="text-lg font-bold text-(--text-title)] mb-4">
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tên người dùng"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Chọn vai trò</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">Người dùng</option>
              </select>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Chọn gói dịch vụ</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
                <option value="free">Free</option>
              </select>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Bị khóa</option>
              </select>
            </div>
            {!editingUser && (
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-4"
              />
            )}
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
                {editingUser ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}