'use client';

import { useState } from 'react';

export default function Categories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Hành động', description: 'Phim hành động kịch tính', movieCount: 245, status: 'active' },
    { id: 2, name: 'Tình cảm', description: 'Phim tình cảm lãng mạn', movieCount: 189, status: 'active' },
    { id: 3, name: 'Kinh dị', description: 'Phim kinh dị hồi hộp', movieCount: 156, status: 'active' },
    { id: 4, name: 'Hài hước', description: 'Phim hài vui nhộn', movieCount: 198, status: 'active' },
    { id: 5, name: 'Khoa học viễn tưởng', description: 'Phim sci-fi tương lai', movieCount: 134, status: 'inactive' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--text-title) mb-2">Quản lí thể loại</h1>
          <p className="text-gray-600">Quản lí các thể loại phim trong hệ thống</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Thêm thể loại mới</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{categories.length}</div>
          <div className="text-gray-600 text-sm">Tổng số thể loại</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{categories.filter(c => c.status === 'active').length}</div>
          <div className="text-gray-600 text-sm">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{categories.reduce((sum, cat) => sum + cat.movieCount, 0)}</div>
          <div className="text-gray-600 text-sm">Tổng số phim</div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-(--text-title)]">Danh sách thể loại</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên thể loại</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Mô tả</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số lượng phim</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-(--text-primary)]">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{category.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {category.movieCount} phim
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
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

      {/* Modal placeholder - bạn có thể thêm modal form sau */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-(--text-title)] mb-4">
              {editingCategory ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên thể loại"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                placeholder="Mô tả thể loại"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}