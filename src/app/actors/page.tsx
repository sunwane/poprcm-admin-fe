'use client';

import { useActors } from '@/hooks/useActors';
import { getGenderColor, getGenderDisplayName, getInitials, getMovieCountColor } from '@/utils/actorUtils';
import GradientAvatar from '@/components/ui/GradientAvatar';
import GradientButton from '@/components/ui/GradientButton';
import ActorModal from '@/components/modalForm/ActorModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';

export default function Actors() {
  const {
    loading,
    showModal,
    editingActor,
    filterGender,
    searchQuery,
    filteredActors,
    paginatedActors,
    movieCounts,
    stats,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveActor,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    setFilterGender,
    setSearchQuery,
  } = useActors();

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  // Helper function to render sort icon
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return (
      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý Diễn viên</h1>
          <p className="text-gray-600">Quản lý tất cả diễn viên hiện có trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <GradientButton onClick={handleOpenAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-7 7V5"/>
            </svg>
            <span>Thêm Diễn viên</span>
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-900 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng diễn viên</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.male}</div>
          <div className="text-gray-600 text-sm">Nam</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-pink-600 mb-1">{stats.female}</div>
          <div className="text-gray-600 text-sm">Nữ</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.avgMoviesPerActor}</div>
          <div className="text-gray-600 text-sm">TB phim/diễn viên</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <SearchBar 
              searchQuery={searchQuery} 
              onChange={setSearchQuery} 
              placeholder='Tìm kiếm tên diễn viên, TMDB ID...'
            />
          </div>
          
          <div className="w-72">
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <FormSelect 
              filter={filterGender}
              onChange={(gender: string) => setFilterGender(gender as typeof filterGender)}
              options={[
                {value:'all', label:'Tất cả giới tính'},
                {value:'male', label:'Nam'},
                {value:'female', label:'Nữ'},
                {value:'unknown', label:'Không rõ'},
              ]}
            />
          </div>
          
          <div className="w-42">
            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Xóa filter
            </button>
          </div>
        </div>
      </div>

      {/* Actors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách Diễn viên ({stats.filteredCount})
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
                    <span>Diễn viên</span>
                    {sortBy === 'id' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Giới tính</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Tên khác</th>
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedActors.map((actor) => (
                <tr key={actor.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mr-4 overflow-hidden shrink-0">
                        {actor.profilePath ? (
                          <img 
                            src={actor.profilePath} 
                            alt={actor.originName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <GradientAvatar initial={getInitials(actor.originName)} />
                        )}
                        <div className="hidden">
                          <GradientAvatar initial={getInitials(actor.originName)} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 truncate">{actor.originName}</div>
                        <div className="text-sm text-gray-500">TMDB: {actor.tmdbId}</div>
                        <div className="text-xs text-gray-400">ID: {actor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(actor.gender)}`}>
                      {getGenderDisplayName(actor.gender)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {(actor.alsoKnownAs ?? []).length > 0 ? (
                        <div className="space-y-1">
                          {(actor.alsoKnownAs ?? []).map((name, index) => (
                            <div key={index} className="text-sm text-gray-600 truncate">
                              {name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Không có</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMovieCountColor(movieCounts[actor.id] || 0)}`}>
                      {movieCounts[actor.id] || 0}
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={stats.filteredCount}
        />
      </div>

      {/* Actor Modal */}
      <ActorModal
        isOpen={showModal}
        editingActor={editingActor}
        onClose={handleCloseModal}
        onSave={handleSaveActor}
      />
    </div>
  );
}