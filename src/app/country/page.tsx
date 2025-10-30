'use client';

import { useCountries } from '@/hooks/useCountries';
import { getMovieCountColor } from '@/utils/countryUtils';
import GradientButton from '@/components/ui/GradientButton';
import CountryModal from '@/components/modalForm/CountryModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';

export default function Countries() {
  const {
    loading,
    showModal,
    editingCountry,
    searchQuery,
    sortBy,
    sortOrder,
    filteredCountries,
    paginatedCountries,
    movieCounts,
    stats,
    currentPage,
    totalPages,
    itemsPerPage,
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveCountry,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    setSearchQuery,
  } = useCountries();

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Quốc gia</h1>
          <p className="text-gray-600">Quản lý tất cả quốc gia hiện có trong hệ thống</p>
        </div>
        <div className="flex items-center w-full max-w-2/5">
          <div className="flex-1 mx-4 max-w-md">
            <SearchBar 
                searchQuery={searchQuery} 
                onChange={setSearchQuery} 
                placeholder='Tìm kiếm quốc gia...'
              />
          </div>
          <div className="flex items-center space-x-4">
            <GradientButton onClick={handleOpenAddModal}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-7 7V5"/>
              </svg>
              <span>Thêm Quốc gia</span>
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng quốc gia</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalMovies}</div>
          <div className="text-gray-600 text-sm">Tổng phim</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.countriesWithMovies}</div>
          <div className="text-gray-600 text-sm">Quốc gia có phim</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.avgMoviesPerCountry}</div>
          <div className="text-gray-600 text-sm">TB phim/quốc gia</div>
        </div>
      </div>

      {/* Countries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách Quốc gia ({filteredCountries.length})
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
                    <span>ID</span>
                    {sortBy === 'id' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tên quốc gia</span>
                    {sortBy === 'name' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Số phim</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCountries.map((country) => (
                <tr key={country.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-mono">{country.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{country.countryName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMovieCountColor(movieCounts[country.id] || 0)}`}>
                      {movieCounts[country.id] || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(country)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(country.id)}
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCountries.length}
        />
      </div>

      {/* Country Modal */}
      <CountryModal
        isOpen={showModal}
        editingCountry={editingCountry}
        onClose={handleCloseModal}
        onSave={handleSaveCountry}
      />
    </div>
  );
}