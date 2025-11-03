'use client';

import { useUsers } from '@/hooks/useUsers';
import { getGenderColor, getGenderDisplayName, getRoleColor, formatDate, getInitials } from '@/utils/userUtils';
import GradientAvatar from '@/components/ui/GradientAvatar';
import GradientButton from '@/components/ui/GradientButton';
import UserModal from '@/components/modalForm/UserModal';
import SearchBar from '@/components/ui/SearchBar';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';

export default function Users() {
  const {
    loading,
    showModal,
    // editingUser,
    filterGender,
    filterRole,
    searchQuery,
    filteredUsers,
    paginatedUsers,
    stats,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    // handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveUser,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleClearFilters,
    setFilterGender,
    setFilterRole,
    setSearchQuery,
  } = useUsers();

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
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý tất cả người dùng hiện có trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-4">
          <GradientButton onClick={handleOpenAddModal}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14m-7 7V5"/>
            </svg>
            <span>Thêm Người dùng</span>
          </GradientButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-900 mb-1">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng người dùng</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-red-600 mb-1">{stats.admin}</div>
          <div className="text-gray-600 text-sm">Admin</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.users}</div>
          <div className="text-gray-600 text-sm">User</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.thisMonth}</div>
          <div className="text-gray-600 text-sm">Tháng này</div>
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
              placeholder='Tìm kiếm người dùng...'
            />
          </div>
          
          <div className="w-58">
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <FormSelect 
              filter={filterGender}
              onChange={(gender: string) => setFilterGender(gender as typeof filterGender)}
              options={[
                {value:'all', label:'Tất cả giới tính'},
                {value:'male', label:'Nam'},
                {value:'female', label:'Nữ'},
              ]}
            />
          </div>
          
          <div className="w-58">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <FormSelect 
              filter={filterRole}
              onChange={(role: string) => setFilterRole(role as typeof filterRole)}
              options={[
                {value:'all', label:'Tất cả vai trò'},
                {value:'admin', label:'Admin'},
                {value:'user', label:'User'},
              ]}
            />
          </div>
          
          <div className='w-42'>
            <button
              onClick={handleClearFilters}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Xóa filter
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách Người dùng ({stats.filteredCount})
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
                    <span>Người dùng</span>
                    {sortBy === 'id' && (
                      <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Vai trò</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Giới tính</th>
                <th 
                  className="px-6 py-4 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Ngày tạo</span>
                    {sortBy === 'createdAt' && (
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
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 overflow-hidden">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.fullname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <GradientAvatar initial={getInitials(user.fullname)} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{user.fullname}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">@{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor((user.role || '').toString())}`}>
                      {user.role || ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(user.gender)}`}>
                      {getGenderDisplayName(user.gender)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDelete(user.id)}
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

      {/* User Modal */}
      <UserModal
        isOpen={showModal}
        // editingUser={editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </div>
  );
}