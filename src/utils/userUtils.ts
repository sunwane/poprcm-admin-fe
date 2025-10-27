import { User } from "@/types/User";

export const getGenderColor = (gender: string): string => {
  switch (gender) {
    case 'male': return 'bg-blue-100 text-blue-800';
    case 'female': return 'bg-pink-100 text-pink-800';
    case 'other': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getGenderDisplayName = (gender: string): string => {
  switch (gender) {
    case 'male': return 'Nam';
    case 'female': return 'Nữ';
    case 'other': return 'Khác';
    default: return gender;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800';
    case 'USER': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN');
};

export const getInitials = (fullname: string): string => {
  return fullname
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('vi-VN');
};

// Hàm sắp xếp người dùng
export const sortUsers = (
  users: User[], 
  sortBy: 'id' | 'createdAt' = 'id', 
  order: 'asc' | 'desc' = 'asc'
): User[] => {
  return [...users].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;
    
    switch (sortBy) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'createdAt':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    
    if (order === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
};