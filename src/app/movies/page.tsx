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
  getCountryNames 
} from '@/utils/movieUtils';
import GradientButton from '@/components/ui/GradientButton';
import MovieModal from '@/components/modalForm/MovieModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';
import ToggleButton from '@/components/ui/ToggleButton';
import MoviesCard from '@/components/feature/movies/MoviesCard';
import MovieStatsCard from '@/components/feature/movies/MovieStatsCard';
import MovieDetailModal from '@/components/feature/movies/MovieDetailModal';

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
    // Movie Detail Modal
    isDetailModalOpen,
    selectedMovie,
    openDetailModal,
    closeDetailModal,
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
      <div className="mb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý Phim</h1>
          <p className="text-gray-600">Quản lý tất cả phim trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-3">
          <ToggleButton viewMode={viewMode} onToggle={handleViewModeToggle} />
          
          <GradientButton onClick={handleOpenAddModal}>
            <span className='text-nowrap'>Thêm thủ công</span>
          </GradientButton>
          <button 
            className='bg-linear-to-br from-green-500 to-green-800 rounded-lg text-white text-nowrap px-6 py-3 hover:from-green-400 hover:to-green-800 transition-all flex items-center space-x-2'
            onClick={handleOpenAddModal}>
            <span className='text-nowrap'>Thêm tự động</span>
          </button>
          <button 
            onClick={handleOpenAddModal}
            className='bg-linear-to-br from-gray-400 to-gray-700 rounded-lg text-white text-nowrap px-6 py-3 hover:from-gray-400 hover:to-gray-800 transition-all flex items-center space-x-2'>
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <MovieStatsCard stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
            <FormSelect
              filter={langFilter}
              onChange={setLangFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'Vietsub', label: 'Vietsub' },
                { value: 'Thuyết minh', label: 'Thuyết minh' },
                { value: 'Vietsub + Thuyết minh', label: 'Vietsub + Thuyết minh' }
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
                    className="pl-6 px-2 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1 min-w-[250px] max-w-[250px]">
                      <span>Poster & Thông tin</span>
                      {sortBy === 'id' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
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
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-600">Loại</th>
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th 
                    className="px-3 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
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
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-600">Ngôn ngữ</th>
                  <th 
                    className="px-3 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Điểm</span>
                      {sortBy === 'rating' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-600">Quốc gia</th>
                  <th 
                    className="px-3 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('modifiedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Ngày sửa</span>
                      {sortBy === 'modifiedAt' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-blue-50 transition-colors">
                    <td className="pl-6 pr-2 py-4 min-w-[250px] max-w-[250px]">
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
                          <div className="font-bold text-blue-900 truncate max-w-[180px] mb-[-0.5]">{movie.title}</div>
                          <div className="text-[13px] text-gray-500 truncate max-w-[180px] mb-2">{movie.originalName}</div>
                          <div className="text-xs text-gray-400 font-mono max-w-[200px] truncate">ID: {movie.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-gray-600">{movie.releaseYear}</td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-nowrap ${getTypeColor(movie.type)}`}>
                        {getTypeText(movie.type)}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-nowrap ${getStatusColor(movie.status)}`}>
                        {getStatusText(movie.status)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-gray-600">{formatViewCount(movie.view)}</td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-nowrap ${getLangColor(movie.lang)}`}>
                        {movie.lang}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        {(movie.tmdbScore ?? 0) > 0 || (movie.imdbScore ?? 0) > 0 ? (
                          <>
                            {(movie.tmdbScore ?? 0) > 0 && (
                              <div className="text-xs text-blue-500 bg-blue-50 py-1 px-2 rounded text-center w-fit">TMDB: {movie.tmdbScore}</div>
                            )}
                            {(movie.imdbScore ?? 0) > 0 && (
                              <div className="text-xs  text-yellow-500 bg-yellow-50 py-1 px-2 rounded text-center w-fit">IMDB: {movie.imdbScore}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-400">Chưa có điểm</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {getCountryNames(movie)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {formatDate(movie.modifiedAt || movie.createdAt)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => openDetailModal(movie)}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                          title="Chi tiết"
                        >
                          Xem
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
          onViewDetail={openDetailModal}
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

      {/* Movie Detail Modal */}
      <MovieDetailModal
        isOpen={isDetailModalOpen}
        movie={selectedMovie}
        onClose={closeDetailModal}
      />
    </div>
  );
}