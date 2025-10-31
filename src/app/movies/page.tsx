'use client';

import { useMovies } from '@/hooks/useMovies';
import { 
  getStatusColor, 
  getStatusText, 
  getTypeColor, 
  getTypeText,
  getLangColor,
  formatViewCount,
  formatDate,
  getRatingColor,
  getCountryNames 
} from '@/utils/movieUtils';
import GradientButton from '@/components/ui/GradientButton';
import MovieModal from '@/components/modalForm/MovieModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';

export default function Movies() {
  const {
    loading,
    showModal,
    editingMovie,
    viewMode,
    searchQuery,
    yearFilter,
    typeFilter,
    statusFilter,
    langFilter,
    sortBy,
    sortOrder,
    paginatedMovies,
    stats,
    filterOptions,
    currentPage,
    totalPages,
    itemsPerPage,
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveMovie,
    handleViewModeToggle,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    setSearchQuery,
    setYearFilter,
    setTypeFilter,
    setStatusFilter,
    setLangFilter,
  } = useMovies();

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Phim</h1>
          <p className="text-gray-600">Quản lý tất cả phim trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => handleViewModeToggle('table')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => handleViewModeToggle('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
          
          <GradientButton onClick={handleOpenAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-7 7V5"/>
            </svg>
            <span>Thêm Phim</span>
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng phim</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalMovies}</div>
          <div className="text-gray-600 text-sm">Phim lẻ</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalSeries}</div>
          <div className="text-gray-600 text-sm">Phim bộ</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.averageRating}</div>
          <div className="text-gray-600 text-sm">Điểm TB</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <SearchBar 
              searchQuery={searchQuery} 
              onChange={setSearchQuery} 
              placeholder='Tìm kiếm phim...'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm phát hành</label>
            <input
              type="number"
              placeholder="2024"
              value={yearFilter || ''}
              onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại phim</label>
            <FormSelect
              filter={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'Movie', label: 'Phim lẻ' },
                { value: 'Series', label: 'Phim bộ' },
                { value: 'hoathinh', label: 'Hoạt hình' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <FormSelect
              filter={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'Completed', label: 'Hoàn thành' },
                { value: 'Ongoing', label: 'Đang chiếu' },
                { value: 'Hiatus', label: 'Tạm dừng' }
              ]}
            />
          </div>
          
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Xóa filter
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách Phim ({stats.filteredCount})
            </h2>
            
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <FormSelect
                size='small'
                filter={itemsPerPage.toString()}
                onChange={(value: string) => handleItemsPerPageChange(parseInt(value))}
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                ]}
              />
              <span className="text-sm text-gray-600">mục/trang</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Poster & Thông tin</span>
                      {sortBy === 'id' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('releaseYear')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Năm</span>
                      {sortBy === 'releaseYear' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Loại</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Thời lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Tập</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('view')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Lượt xem</span>
                      {sortBy === 'view' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Ngôn ngữ</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Điểm</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Quốc gia</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={movie.posterUrl || '/placeholder-poster.png'} 
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-poster.png';
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-800">{movie.title}</div>
                          <div className="text-sm text-gray-500">{movie.originalName}</div>
                          <div className="text-xs text-gray-400 font-mono">ID: {movie.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{movie.releaseYear}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getTypeColor(movie.type)}`}>
                        {getTypeText(movie.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{movie.duration}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {movie.totalEpisodes ? `${movie.totalEpisodes} tập` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(movie.status)}`}>
                        {getStatusText(movie.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatViewCount(movie.view)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getLangColor(movie.lang)}`}>
                        {movie.lang}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(movie.rating)}`}>
                          ⭐ {movie.rating}
                        </div>
                        {movie.tmdbScore && (
                          <div className="text-xs text-gray-500">TMDB: {movie.tmdbScore}</div>
                        )}
                        {movie.imdbScore && (
                          <div className="text-xs text-gray-500">IMDB: {movie.imdbScore}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getCountryNames(movie)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(movie.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                          title="Chi tiết"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleEdit(movie)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(movie.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={stats.filteredCount}
          />
        </div>
      ) : (
        /* Grid View with blue theme */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedMovies.map((movie) => (
            <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-3/4 bg-gray-200 relative">
                <img 
                  src={movie.posterUrl || '/placeholder-poster.png'} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-poster.png';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(movie.rating)}`}>
                    ⭐ {movie.rating}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movie.type)}`}>
                    {getTypeText(movie.type)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-gray-800 mb-1 line-clamp-2">{movie.title}</div>
                <div className="text-sm text-gray-500 mb-2 line-clamp-1">{movie.originalName}</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Năm:</span>
                    <span>{movie.releaseYear}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thời lượng:</span>
                    <span>{movie.duration}</span>
                  </div>
                  
                  {movie.totalEpisodes && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tập:</span>
                      <span>{movie.totalEpisodes} tập</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lượt xem:</span>
                    <span>{formatViewCount(movie.view)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ngôn ngữ:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLangColor(movie.lang)}`}>
                      {movie.lang}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                      {getStatusText(movie.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quốc gia:</span>
                    <span className="text-xs">{getCountryNames(movie)}</span>
                  </div>
                  
                  {(movie.tmdbScore || movie.imdbScore) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Điểm:</span>
                      <div className="text-xs space-x-2">
                        {movie.tmdbScore && <span>TMDB: {movie.tmdbScore}</span>}
                        {movie.imdbScore && <span>IMDB: {movie.imdbScore}</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button 
                    className="flex-1 bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                    title="Chi tiết"
                  >
                    👁️ Chi tiết
                  </button>
                  <button 
                    onClick={() => handleEdit(movie)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(movie.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movie Modal */}
      <MovieModal
        isOpen={showModal}
        editingMovie={editingMovie}
        onClose={handleCloseModal}
        onSave={handleSaveMovie}
      />
    </div>
  );
}

