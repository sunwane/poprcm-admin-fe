import { useState, useEffect, useMemo } from 'react';
import { User, FilterGender, FilterRole } from '@/types/User';
import { UserService } from '@/services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterGender, setFilterGender] = useState<FilterGender>('all');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await UserService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const genderMatch = filterGender === 'all' || user.gender === filterGender;
      const roleMatch = filterRole === 'all' || user.role === filterRole;
      const searchMatch = searchQuery === '' || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return genderMatch && roleMatch && searchMatch;
    });
  }, [users, filterGender, filterRole, searchQuery]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGender, filterRole, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: users.length,
    male: users.filter(u => u.gender === 'male').length,
    female: users.filter(u => u.gender === 'female').length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
    thisMonth: users.filter(u => {
      const now = new Date();
      const userDate = u.createdAt;
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
  }), [users]);

  // Actions
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await UserService.deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await UserService.updateUser(editingUser.id, userData);
        if (updatedUser) {
          setUsers(users.map(user => 
            user.id === editingUser.id ? updatedUser : user
          ));
        }
      } else {
        // Add new user
        const newUser = await UserService.addUser(userData as Omit<User, 'id' | 'createdAt'>);
        setUsers([...users, newUser]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    // State
    users,
    loading,
    showModal,
    editingUser,
    filterGender,
    filterRole,
    searchQuery,
    filteredUsers,
    paginatedUsers,
    stats,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    handleEdit,
    handleDelete,
    handleOpenAddModal,
    handleCloseModal,
    handleSaveUser,
    handlePageChange,
    handleItemsPerPageChange,
    setFilterGender,
    setFilterRole,
    setSearchQuery,
  };
};