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
import ToggleButton from '@/components/ui/ToggleButton';
import MoviesCard from '@/components/ui/MoviesCard';

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
          <ToggleButton viewMode={viewMode} onToggle={handleViewModeToggle} />
          
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
        <MoviesCard 
          movies={paginatedMovies} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Add pagination for grid view */}
      {viewMode === 'grid' && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={stats.filteredCount}
          />
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

