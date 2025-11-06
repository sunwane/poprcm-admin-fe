// Utility functions for color schemes based on rating and status

export const getRatingColorScheme = (rating: number): string => {
  if (rating >= 8.5) return 'bg-green-700/90 text-white border-green-700 border-2';
  if (rating >= 7.5) return 'bg-blue-700/90 text-white border-blue-700 border-2';
  if (rating >= 6.5) return 'bg-yellow-600/90 text-white border-yellow-600 border-2';
  if (rating >= 5.0) return 'bg-orange-600/90 text-white border-orange-600 border-2';
  return 'bg-red-700/90 text-white border-red-700 border-2';
};

export const getStatusColorScheme = (status: string): string => {
  switch (status) {
  case 'Completed':
  case 'completed':
    return 'bg-green-700/60 text-white border-green-700 border-2';
  case 'Ongoing':
  case 'ongoing':
    return 'bg-blue-700/60 text-white border-blue-700 border-2';
  case 'Hiatus':
  case 'trailer':
    return 'bg-orange-700/60 text-white border-orange-700 border-2';
  case 'Cancelled':
    return 'bg-red-700/60 text-white border-red-700 border-2';
  default:
    return 'bg-gray-700/60 text-white border-gray-700 border-2';
  }
};

export const getTypeColorScheme = (type: string): string => {
  switch (type) {
    case 'single':
      return 'bg-gradient-to-br from-purple-400/90 to-purple-600/80 border-2 border-purple-600 text-white';
    case 'series':
      return 'bg-gradient-to-br from-indigo-400/90 to-indigo-600/80 border-2 border-indigo-500 text-white';
    case 'hoathinh':
      return 'bg-gradient-to-br from-yellow-400/90 to-yellow-600/80 border-2 border-yellow-600 text-white';
    default:
      return 'bg-gray-400/90 border-2 border-gray-600 text-white';
  }
};

export const getViewCountColorScheme = (viewCount: number): string => {
  if (viewCount >= 2500) return 'bg-gradient-to-br from-yellow-500 to-red-600 text-white';
  if (viewCount >= 1000) return 'bg-gradient-to-br from-yellow-300 to-orange-600 text-white';
  if (viewCount >= 100) return 'bg-gradient-to-br from-blue-400 to-blue-800 text-white';
  if (viewCount >= 10) return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
  return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white';
};