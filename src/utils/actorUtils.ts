import { Actor } from '@/types/Actor';

export const getGenderColor = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'male': return 'bg-blue-100 text-blue-800';
    case 'female': return 'bg-pink-100 text-pink-800';
    case 'unknown': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getGenderDisplayName = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'male': return 'Nam';
    case 'female': return 'Nữ';
    case 'unknown': return 'Không rõ';
    default: return 'Không rõ';
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getMovieCountColor = (count: number): string => {
  if (count === 0) return 'text-gray-500 bg-gray-100';
  if (count < 5) return 'text-yellow-700 bg-yellow-100';
  if (count < 15) return 'text-blue-700 bg-blue-100';
  if (count < 30) return 'text-green-700 bg-green-100';
  return 'text-purple-700 bg-purple-100';
};

// Validate actor name
export const validateActorName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Tên diễn viên không được để trống' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Tên diễn viên phải có ít nhất 2 ký tự' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Tên diễn viên không được vượt quá 100 ký tự' };
  }
  
  return { isValid: true };
};

// Validate TMDB ID
export const validateTmdbId = (tmdbId: string): { isValid: boolean; error?: string } => {
  if (!tmdbId || tmdbId.trim().length === 0) {
    return { isValid: false, error: 'TMDB ID không được để trống' };
  }
  
  if (!/^\d+$/.test(tmdbId.trim())) {
    return { isValid: false, error: 'TMDB ID phải là số' };
  }
  
  return { isValid: true };
};

// Format actor name
export const formatActorName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

// Filter actors by search query
export const filterActorsByQuery = (actors: Actor[], searchQuery: string): Actor[] => {
  if (!searchQuery.trim()) return actors;
  
  const query = searchQuery.toLowerCase().trim();
  return actors.filter(actor => 
    actor.originName.toLowerCase().includes(query) ||
    actor.tmdbId.includes(query) ||
    actor.alsoKnownAs.some(alias => alias.toLowerCase().includes(query))
  );
};

// Sort actors
export const sortActors = (
  actors: Actor[], 
  movieCounts: Record<string, number>,
  sortBy: 'id' | 'movieCount' = 'id', 
  order: 'asc' | 'desc' = 'asc'
): Actor[] => {
  return [...actors].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortBy) {
      case 'id':
        aValue = parseInt(a.id) || 0;
        bValue = parseInt(b.id) || 0;
        break;
      case 'movieCount':
        aValue = movieCounts[a.id] || 0;
        bValue = movieCounts[b.id] || 0;
        break;
      default:
        aValue = parseInt(a.id) || 0;
        bValue = parseInt(b.id) || 0;
    }
    
    if (order === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
};