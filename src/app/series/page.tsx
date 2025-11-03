'use client';

import { useSeries } from '@/hooks/useSeries';
import { 
  getStatusColor, 
  formatMovieCount,
  formatReleaseYear,
  calculateTotalMovies,
  calculateAverageRating,
  getRatingColor 
} from '@/utils/seriesUtils';
import GradientButton from '@/components/ui/GradientButton';
import SeriesModal from '@/components/modalForm/series/SeriesModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';
import ToggleButton from '@/components/ui/ToggleButton';
import SeriesCard from '@/components/feature/series/SeriesCard';
import FormInput from '@/components/ui/FormInput';

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
      <div className="mb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý Series</h1>
          <p className="text-gray-600">Quản lý các series phim trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <ToggleButton viewMode={viewMode} onToggle={handleViewModeToggle} />
          
          <GradientButton onClick={handleOpenAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-7 7V5"/>
            </svg>
            <span>Thêm Series</span>
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-900 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng series</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.ongoingSeries}</div>
          <div className="text-gray-600 text-sm">Đang phát sóng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.completedSeries}</div>
          <div className="text-gray-600 text-sm">Đã hoàn thành</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.averageMoviesPerSeries}</div>
          <div className="text-gray-600 text-sm">TB phim/series</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
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
            <FormInput
              type="text"
              placeholder="2024"
              value={yearFilter || ''}
              onChange={(e) => setYearFilter(e.target.value)}
              name='year'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <FormSelect
              filter={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'Ongoing', label: 'Ongoing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Hiatus', label: 'Hiatus' }
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
            <div className="flex items-center space-x-1.5">
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
                      <td className="px-6 py-4 max-w-[400px]">
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
                            <div className="font-semibold text-blue-950 mb-1">{series.name}</div>
                            <div className="text-[13px] text-gray-500 line-clamp-2 mb-2">{series.description}</div>
                            <div className="text-xs text-gray-400 font-mono">ID: {series.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatReleaseYear(series.releaseYear)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatMovieCount(movieCount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-2 rounded-full text-sm font-medium text-nowrap ${getStatusColor(series.status)}`}>
                          {series.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {averageRating > 0 ? (
                          <div className={`px-2.5 pr-3 py-2 rounded text-sm w-fit font-semibold flex space-x-1 ${getRatingColor(averageRating)}`}>
                            <svg className="w-4 h-4 text-orange-400 opacity-70" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 
                              2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                            </svg>
                            <div>{averageRating}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(series)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(series.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
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
        <SeriesCard 
          series={paginatedSeries} 
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