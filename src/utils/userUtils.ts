export const getGenderColor = (gender: string): string => {
  switch (gender) {
    case 'male': return 'bg-blue-100 text-blue-800';
    case 'female': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getGenderDisplayName = (gender: string): string => {
  switch (gender) {
    case 'male': return 'Nam';
    case 'female': return 'Nữ';
    default: return gender;
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