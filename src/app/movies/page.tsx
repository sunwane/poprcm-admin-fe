'use client';

import { useState } from 'react';

export default function Movies() {
  const [moviesList, setMoviesList] = useState([
    { 
      id: 1, 
      title: 'Avatar: The Way of Water', 
      category: 'Khoa học viễn tưởng', 
      duration: 192, 
      releaseDate: '2022-12-16',
      status: 'released',
      rating: 7.6,
      director: 'James Cameron',
      revenue: '2.32B'
    },
    { 
      id: 2, 
      title: 'Top Gun: Maverick', 
      category: 'Hành động', 
      duration: 130, 
      releaseDate: '2022-05-27',
      status: 'released',
      rating: 8.3,
      director: 'Joseph Kosinski',
      revenue: '1.49B'
    },
    { 
      id: 3, 
      title: 'Black Panther: Wakanda Forever', 
      category: 'Siêu anh hùng', 
      duration: 161, 
      releaseDate: '2022-11-11',
      status: 'released',
      rating: 6.7,
      director: 'Ryan Coogler',
      revenue: '859M'
    },
    { 
      id: 4, 
      title: 'The Batman', 
      category: 'Hành động', 
      duration: 176, 
      releaseDate: '2022-03-04',
      status: 'released',
      rating: 7.8,
      director: 'Matt Reeves',
      revenue: '771M'
    },
    { 
      id: 5, 
      title: 'Spider-Man: No Way Home 2', 
      category: 'Siêu anh hùng', 
      duration: 150, 
      releaseDate: '2024-07-15',
      status: 'upcoming',
      rating: 0,
      director: 'Jon Watts',
      revenue: 'TBD'
    },
  ]);

  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      setMoviesList(moviesList.filter(movie => movie.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'released': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'in-production': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'released': return 'Đã phát hành';
      case 'upcoming': return 'Sắp ra mắt';
      case 'in-production': return 'Đang sản xuất';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const filteredMovies = filterStatus === 'all' 
    ? moviesList 
    : moviesList.filter(movie => movie.status === filterStatus);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--text-title)] mb-2">Quản lí Phim</h1>
          <p className="text-gray-600">Quản lí danh sách phim trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="released">Đã phát hành</option>
            <option value="upcoming">Sắp ra mắt</option>
            <option value="in-production">Đang sản xuất</option>
            <option value="cancelled">Đã hủy</option>
          </select>
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
              setEditingMovie(null);
              setShowModal(true);
            }}
            className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Thêm phim mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{moviesList.length}</div>
          <div className="text-gray-600 text-sm">Tổng phim</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{moviesList.filter(m => m.status === 'released').length}</div>
          <div className="text-gray-600 text-sm">Đã phát hành</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{moviesList.filter(m => m.status === 'upcoming').length}</div>
          <div className="text-gray-600 text-sm">Sắp ra mắt</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">
            {Math.round(moviesList.filter(m => m.rating > 0).reduce((sum, m) => sum + m.rating, 0) / moviesList.filter(m => m.rating > 0).length * 10) / 10}
          </div>
          <div className="text-gray-600 text-sm">Điểm trung bình</div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-3/4 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  🎬 Poster
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                    {getStatusText(movie.status)}
                  </span>
                </div>
                {movie.rating > 0 && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    ⭐ {movie.rating}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-(--text-primary)] mb-2 truncate">{movie.title}</h3>
                <p className="text-gray-600 text-sm mb-1">{movie.category}</p>
                <p className="text-gray-500 text-xs mb-2">Đạo diễn: {movie.director}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>{movie.duration} phút</span>
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  <span>{movie.revenue}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(movie)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(movie.id)}
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
            <h2 className="text-xl font-bold text-(--text-title)]">Danh sách Phim</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên phim</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thể loại</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Đạo diễn</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày phát hành</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Đánh giá</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Doanh thu</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-(--text-primary)]">{movie.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{movie.category}</td>
                    <td className="px-6 py-4 text-gray-600">{movie.director}</td>
                    <td className="px-6 py-4">{movie.duration} phút</td>
                    <td className="px-6 py-4">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      {movie.rating > 0 ? (
                        <span className="flex items-center">
                          ⭐ {movie.rating}
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">{movie.revenue}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                        {getStatusText(movie.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(movie)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(movie.id)}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-(--text-title)] mb-4">
              {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Tên phim"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Chọn thể loại</option>
                <option>Hành động</option>
                <option>Tình cảm</option>
                <option>Kinh dị</option>
                <option>Khoa học viễn tưởng</option>
                <option>Siêu anh hùng</option>
              </select>
              <input
                type="text"
                placeholder="Đạo diễn"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Thời lượng (phút)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Ngày phát hành"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Đánh giá (0-10)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Doanh thu (VD: 1.2B)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="released">Đã phát hành</option>
                <option value="upcoming">Sắp ra mắt</option>
                <option value="in-production">Đang sản xuất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <textarea
              placeholder="Mô tả phim"
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
                {editingMovie ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}