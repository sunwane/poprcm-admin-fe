// Utility functions for color schemes based on rating and status

export const getRatingColorScheme = (rating: number): string => {
  if (rating >= 8.5) return 'bg-gradient-to-br from-green-500 to-emerald-600 text-white';
  if (rating >= 7.5) return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
  if (rating >= 6.5) return 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white';
  if (rating >= 5.0) return 'bg-gradient-to-br from-orange-500 to-red-500 text-white';
  return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
};

export const getStatusColorScheme = (status: string): string => {
  switch (status) {
    case 'Completed':
      return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
    case 'Ongoing':
      return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
    case 'Hiatus':
      return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
    case 'Cancelled':
      return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
    default:
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
  }
};

export const getTypeColorScheme = (type: string): string => {
  switch (type) {
    case 'Movie':
      return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white';
    case 'Series':
      return 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white';
    case 'hoathinh':
      return 'bg-gradient-to-br from-pink-400 to-pink-600 text-white';
    default:
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
  }
};

export const getPosterOverlayColor = (rating: number, status: string): string => {
  // Tạo overlay màu dựa trên rating và status
  if (rating >= 8.5) {
    return 'bg-gradient-to-t from-green-900/80 via-green-800/40 to-transparent';
  } else if (rating >= 7.5) {
    return 'bg-gradient-to-t from-blue-900/80 via-blue-800/40 to-transparent';
  } else if (rating >= 6.5) {
    return 'bg-gradient-to-t from-yellow-900/80 via-yellow-800/40 to-transparent';
  } else {
    return 'bg-gradient-to-t from-gray-900/80 via-gray-800/40 to-transparent';
  }
};

export const getViewCountColorScheme = (viewCount: number): string => {
  if (viewCount >= 1000000) return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
  if (viewCount >= 100000) return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white';
  if (viewCount >= 10000) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white';
  if (viewCount >= 1000) return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
  return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
};