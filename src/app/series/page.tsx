'use client';

import { useSeries } from '@/hooks/useSeries';
import { 
  getStatusColor, 
  getStatusText, 
  formatSeasons,
  formatMovieCount,
  formatReleaseYear,
  calculateTotalMovies,
  calculateAverageRating,
  getRatingColor 
} from '@/utils/seriesUtils';
import GradientButton from '@/components/ui/GradientButton';
import SeriesModal from '@/components/modalForm/SeriesModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';

export default function Series() {
  const {
    loading,
    showModal,
    editingSeries,
    viewMode,
    searchQuery,
    yearFilter,
    statusFilter,
    sortBy,
    sortOrder,
    paginatedSeries,
    stats,
    currentPage,
    totalPages,
    itemsPerPage,
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveSeries,
    handleViewModeToggle,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    setSearchQuery,
    setYearFilter,
    setStatusFilter,
  } = useSeries();

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Series</h1>
          <p className="text-gray-600">Quản lý các series phim trong hệ thống</p>
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
            <span>Thêm Series</span>
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng series</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.ongoingSeries}</div>
          <div className="text-gray-600 text-sm">Đang phát sóng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.completedSeries}</div>
          <div className="text-gray-600 text-sm">Đã hoàn thành</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.totalMovies}</div>
          <div className="text-gray-600 text-sm">Tổng phim</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <SearchBar 
              searchQuery={searchQuery} 
              onChange={setSearchQuery} 
              placeholder='Tìm kiếm series...'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm phát hành</label>
            <input
              type="text"
              placeholder="2024"
              value={yearFilter || ''}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <FormSelect
              filter={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'Ongoing', label: 'Đang phát sóng' },
                { value: 'Completed', label: 'Đã hoàn thành' },
                { value: 'Cancelled', label: 'Đã hủy' },
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
              Danh sách Series ({stats.filteredCount})
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
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Poster & Thông tin</span>
                      {sortBy === 'name' && (
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
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('numberOfSeasons')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Số mùa</span>
                      {sortBy === 'numberOfSeasons' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('movieCount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Số phim</span>
                      {sortBy === 'movieCount' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('averageRating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Điểm TB</span>
                      {sortBy === 'averageRating' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSeries.map((series) => {
                  const movieCount = calculateTotalMovies(series);
                  const averageRating = calculateAverageRating(series);
                  
                  return (
                    <tr key={series.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={series.posterUrl || '/placeholder-poster.png'} 
                            alt={series.name}
                            className="w-16 h-24 object-cover rounded-lg shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-poster.png';
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-800">{series.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{series.description}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {series.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatReleaseYear(series.releaseYear)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatSeasons(series.numberOfSeasons)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatMovieCount(movieCount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(series.status)}`}>
                          {getStatusText(series.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {averageRating > 0 ? (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getRatingColor(averageRating)}`}>
                            ⭐ {averageRating}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Chưa có</span>
                        )}
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
                            onClick={() => handleEdit(series)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(series.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedSeries.map((series) => {
            const movieCount = calculateTotalMovies(series);
            const averageRating = calculateAverageRating(series);
            
            return (
              <div key={series.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-3/4 bg-gray-200 relative">
                  <img 
                    src={series.posterUrl || '/placeholder-poster.png'} 
                    alt={series.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-poster.png';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    {averageRating > 0 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(averageRating)}`}>
                        ⭐ {averageRating}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Chưa có điểm
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(series.status)}`}>
                      {getStatusText(series.status)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-medium text-gray-800 mb-1 line-clamp-1">{series.name}</div>
                  <div className="text-sm text-gray-500 mb-3 line-clamp-2">{series.description}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Năm:</span>
                      <span>{formatReleaseYear(series.releaseYear)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số mùa:</span>
                      <span>{formatSeasons(series.numberOfSeasons)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số phim:</span>
                      <span>{formatMovieCount(movieCount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button 
                      className="flex-1 bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                      title="Chi tiết"
                    >
                      👁️ Chi tiết
                    </button>
                    <button 
                      onClick={() => handleEdit(series)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(series.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Series Modal */}
      <SeriesModal
        isOpen={showModal}
        editingSeries={editingSeries}
        onClose={handleCloseModal}
        onSave={handleSaveSeries}
      />
    </div>
  );
}