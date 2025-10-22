'use client';

import { useState } from 'react';

export default function Actors() {
  const [actorsList, setActorsList] = useState([
    { 
      id: 1, 
      name: 'Robert Downey Jr.', 
      birthDate: '1965-04-04',
      nationality: 'Mỹ',
      gender: 'Nam',
      movieCount: 58,
      seriesCount: 3,
      awards: 12,
      status: 'active',
      biography: 'Diễn viên nổi tiếng với vai Iron Man'
    },
    { 
      id: 2, 
      name: 'Scarlett Johansson', 
      birthDate: '1984-11-22',
      nationality: 'Mỹ',
      gender: 'Nữ',
      movieCount: 45,
      seriesCount: 2,
      awards: 8,
      status: 'active',
      biography: 'Diễn viên nổi tiếng với vai Black Widow'
    },
    { 
      id: 3, 
      name: 'Tom Holland', 
      birthDate: '1996-06-01',
      nationality: 'Anh',
      gender: 'Nam',
      movieCount: 23,
      seriesCount: 1,
      awards: 5,
      status: 'active',
      biography: 'Diễn viên trẻ nổi tiếng với vai Spider-Man'
    },
    { 
      id: 4, 
      name: 'Emma Stone', 
      birthDate: '1988-11-06',
      nationality: 'Mỹ',
      gender: 'Nữ',
      movieCount: 32,
      seriesCount: 0,
      awards: 15,
      status: 'active',
      biography: 'Diễn viên từng đoạt Oscar cho La La Land'
    },
    { 
      id: 5, 
      name: 'Leonardo DiCaprio', 
      birthDate: '1974-11-11',
      nationality: 'Mỹ',
      gender: 'Nam',
      movieCount: 67,
      seriesCount: 1,
      awards: 23,
      status: 'inactive',
      biography: 'Diễn viên huyền thoại Hollywood'
    },
  ]);

  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleEdit = (actor) => {
    setEditingActor(actor);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) {
      setActorsList(actorsList.filter(actor => actor.id !== id));
    }
  };

  const getAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredActors = actorsList.filter(actor => {
    const genderMatch = filterGender === 'all' || actor.gender === filterGender;
    const statusMatch = filterStatus === 'all' || actor.status === filterStatus;
    return genderMatch && statusMatch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-(--text-title)] mb-2">Quản lí Diễn viên</h1>
          <p className="text-gray-600">Quản lí thông tin diễn viên trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm nghỉ</option>
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
              setEditingActor(null);
              setShowModal(true);
            }}
            className="bg-linear-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Thêm diễn viên</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-(--text-primary)] mb-1">{actorsList.length}</div>
          <div className="text-gray-600 text-sm">Tổng diễn viên</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{actorsList.filter(a => a.status === 'active').length}</div>
          <div className="text-gray-600 text-sm">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{actorsList.filter(a => a.gender === 'Nam').length}</div>
          <div className="text-gray-600 text-sm">Nam giới</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-pink-600 mb-1">{actorsList.filter(a => a.gender === 'Nữ').length}</div>
          <div className="text-gray-600 text-sm">Nữ giới</div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActors.map((actor) => (
            <div key={actor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  👤 Avatar
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    actor.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {actor.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    actor.gender === 'Nam' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {actor.gender}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-(--text-primary)] mb-2 truncate">{actor.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{actor.nationality}</p>
                <p className="text-gray-500 text-xs mb-3">{getAge(actor.birthDate)} tuổi</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                  <div>🎬 {actor.movieCount} phim</div>
                  <div>📺 {actor.seriesCount} series</div>
                  <div>🏆 {actor.awards} giải</div>
                  <div>⭐ Nổi tiếng</div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(actor)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(actor.id)}
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
            <h2 className="text-xl font-bold text-(--text-title)]">Danh sách Diễn viên</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tên diễn viên</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tuổi</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giới tính</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Quốc tịch</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số phim</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số series</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giải thưởng</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActors.map((actor) => (
                  <tr key={actor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-(--text-primary)]">{actor.name}</div>
                    </td>
                    <td className="px-6 py-4">{getAge(actor.birthDate)} tuổi</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        actor.gender === 'Nam' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {actor.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{actor.nationality}</td>
                    <td className="px-6 py-4">{actor.movieCount}</td>
                    <td className="px-6 py-4">{actor.seriesCount}</td>
                    <td className="px-6 py-4 font-medium text-yellow-600">{actor.awards}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        actor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {actor.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(actor)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(actor.id)}
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
            <h3 className="text-lg font-bold text-(--text-title) mb-4">
              {editingActor ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tên diễn viên"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Ngày sinh"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              <input
                type="text"
                placeholder="Quốc tịch"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Số phim tham gia"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Số series tham gia"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Số giải thưởng"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
              </select>
            </div>
            <textarea
              placeholder="Tiểu sử diễn viên"
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
                {editingActor ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}