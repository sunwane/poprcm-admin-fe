'use client';

import { useState } from 'react';

export default function Series() {
  const [seriesList, setSeriesList] = useState([
    { 
      id: 1, 
      title: 'Stranger Things', 
      category: 'Khoa học viễn tưởng', 
      seasons: 4, 
      episodes: 42, 
      status: 'ongoing',
      rating: 8.7,
      poster: '/api/placeholder/200/300'
    },
    { 
      id: 2, 
      title: 'The Crown', 
      category: 'Chính kịch', 
      seasons: 6, 
      episodes: 60, 
      status: 'completed',
      rating: 8.6,
      poster: '/api/placeholder/200/300'
    },
    { 
      id: 3, 
      title: 'Wednesday', 
      category: 'Kinh dị', 
      seasons: 1, 
      episodes: 8, 
      status: 'ongoing',
      rating: 8.1,
      poster: '/api/placeholder/200/300'
    },
    { 
      id: 4, 
      title: 'House of the Dragon', 
      category: 'Giả tưởng', 
      seasons: 2, 
      episodes: 18, 
      status: 'ongoing',
      rating: 8.5,
      poster: '/api/placeholder/200/300'
    },
  ]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);

  const handleEdit = (series) => {
    setEditingSeries(series);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa series này?')) {
      setSeriesList(seriesList.filter(series => series.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ongoing': return 'Đang phát sóng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--text-title) mb-2">Quản lí Series</h1>
          <p className="text-gray-600">Quản lí các series phim trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              🔲 Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              📋 List
            </button>
          </div>
          <button 
            onClick={() => {
              setEditingSeries(null);
              setShowModal(true);
            }}
            className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Thêm series mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{seriesList.length}</div>
          <div className="text-gray-600 text-sm">Tổng series</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{seriesList.filter(s => s.status === 'ongoing').length}</div>
          <div className="text-gray-600 text-sm">Đang phát sóng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{seriesList.filter(s => s.status === 'completed').length}</div>
          <div className="text-gray-600 text-sm">Đã hoàn thành</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{seriesList.reduce((sum, s) => sum + s.episodes, 0)}</div>
          <div className="text-gray-600 text-sm">Tổng tập phim</div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seriesList.map((series) => (
            <div key={series.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-3/4 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  📺 Poster
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(series.status)}`}>
                    {getStatusText(series.status)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-(--text-primary)] mb-2 truncate">{series.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{series.category}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>{series.seasons} mùa</span>
                  <span>{series.episodes} tập</span>
                  <span>⭐ {series.rating}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(series)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(series.id)}
                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-(--text-title)]">Danh sách Series</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên series</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thể loại</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số mùa</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số tập</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Đánh giá</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seriesList.map((series) => (
                  <tr key={series.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-(--text-primary)]">{series.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{series.category}</td>
                    <td className="px-6 py-4">{series.seasons}</td>
                    <td className="px-6 py-4">{series.episodes}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center">
                        ⭐ {series.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(series.status)}`}>
                        {getStatusText(series.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(series)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(series.id)}
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
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-(--text-title)] mb-4">
              {editingSeries ? 'Chỉnh sửa series' : 'Thêm series mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tên series"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Chọn thể loại</option>
                <option>Hành động</option>
                <option>Tình cảm</option>
                <option>Kinh dị</option>
                <option>Khoa học viễn tưởng</option>
              </select>
              <input
                type="number"
                placeholder="Số mùa"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Số tập"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Đánh giá (0-10)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="ongoing">Đang phát sóng</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <textarea
              placeholder="Mô tả series"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-4"
            />
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
                {editingSeries ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}