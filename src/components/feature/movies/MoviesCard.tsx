import { Movie } from '@/types/Movies';

import { 
  getStatusText, 
  getTypeText,
  getLangColor,
  formatViewCount,
  getCountryNames 
} from '@/utils/movieUtils';

import {
  getRatingColorScheme,
  getStatusColorScheme,
  getTypeColorScheme,
  getViewCountColorScheme
} from '@/utils/cardColorUtils';

interface MoviesCardProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
  onViewDetail?: (movie: Movie) => void;
}

export default function MoviesCard({ movies, onEdit, onDelete, onViewDetail }: MoviesCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 px-4">
      {movies.map((movie) => {
        const averageRating = movie.imdbScore && movie.tmdbScore 
          ? (movie.imdbScore + movie.tmdbScore) / 2 
          : movie.imdbScore || movie.tmdbScore || 0;
        
        return (
          <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-3/4 bg-gray-200 relative overflow-hidden">
              <img 
                src={movie.posterUrl || '/placeholder-poster.png'} 
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-poster.png';
                }}
              />
              
              {/* Overlay với gradient màu */}
              <div className={`absolute inset-0 border-t-30 border-b-40 border-[#222222] mix-blend-overlay blur-md`}></div>
              
              {/* Type badge */}
              <div className="absolute top-1.5 left-1.5">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg ${getTypeColorScheme(movie.type)}`}>
                  {getTypeText(movie.type)}
                </span>
              </div>
              
              {/* Rating badge */}
              {averageRating > 0 && (
                <div className="absolute top-1.5 right-1.5">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center space-x-1 ${getRatingColorScheme(averageRating)}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{averageRating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              
              {/* Status badge */}
              <div className="absolute bottom-2.5 left-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${getStatusColorScheme(movie.status)}`}>
                  {getStatusText(movie.status)}
                </span>
              </div>
              
              {/* View count badge */}
              <div className="absolute bottom-2 right-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center space-x-1 ${getViewCountColorScheme(movie.view)}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>{formatViewCount(movie.view)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-4 pt-3 pb-4">
              <div className="font-bold text-gray-800 line-clamp-1 text-sm">{movie.title}</div>
              <div className="text-xs text-gray-500 mb-3 line-clamp-1">{movie.originalName}</div>
              
              <div className="space-y-1 text-xs mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Năm:</span>
                  <span className="font-semibold">{movie.releaseYear}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tập:</span>
                  {(movie.totalEpisodes ?? 0) > 0 ? (
                    <span className="font-semibold">{movie.totalEpisodes} tập</span>
                  ) : (
                    <span className="font-semibold">N/A</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Ngôn ngữ:</span>
                  <span className={`text-xs font-bold ${getLangColor(movie.lang)} bg-transparent`}>
                    {movie.lang}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Quốc gia:</span>
                  <span className="text-xs font-medium">{getCountryNames(movie)}</span>
                </div>
              </div>
              
              <div className="flex space-x-1 mx-[-4]">
                <button 
                  onClick={() => onViewDetail?.(movie)}
                  className="flex-1 bg-linear-to-r from-gray-500 to-gray-600 text-white py-2.5 rounded-sm text-xs font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center space-x-1"
                  title="Xem chi tiết"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>Xem</span>
                </button>
                <button 
                  onClick={() => onEdit(movie)}
                  className="flex-1 bg-linear-to-r from-blue-500 to-blue-700 text-white py-2.5 rounded-sm text-xs font-bold hover:from-blue-600 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Sửa</span>
                </button>
                <button 
                  onClick={() => onDelete(movie.id)}
                  className="bg-linear-to-r from-red-500 to-red-600 text-white px-3 py-2.5 rounded-sm text-xs font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}