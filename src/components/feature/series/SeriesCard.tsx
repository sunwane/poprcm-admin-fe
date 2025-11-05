import { Series } from '@/types/Series';

import { 
  getStatusColor, 
  formatSeasons,
  formatMovieCount,
  formatReleaseYear,
  calculateTotalMovies,
  calculateAverageRating,
  getRatingColor 
} from '@/utils/seriesUtils';

import {
  getRatingColorScheme,
  getStatusColorScheme,
  getPosterOverlayColor
} from '@/utils/colorUtils';

interface SeriesCardProps {
  series: Series[];
  onEdit: (series: Series) => void;
  onDelete: (id: string) => void;
}

export default function SeriesCard({ series, onEdit, onDelete }: SeriesCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {series.map((item) => {
        const movieCount = calculateTotalMovies(item);
        const averageRating = calculateAverageRating(item);
        
        return (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="aspect-3/4 bg-gray-200 relative overflow-hidden">
              <img 
                src={item.posterUrl || '/placeholder-poster.png'} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-poster.png';
                }}
              />
              
              {/* Overlay với gradient màu dựa trên rating */}
              <div className={`absolute inset-0 ${getPosterOverlayColor(averageRating, item.status)}`}></div>
              
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${getStatusColorScheme(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              {/* Rating badge */}
              {averageRating > 0 && (
                <div className="absolute top-3 right-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 ${getRatingColorScheme(averageRating)}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{averageRating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              
              {/* Movie count badge */}
              <div className="absolute bottom-3 right-3">
                <div className="px-2.5 py-1 rounded-full text-xs font-bold shadow-lg bg-linear-to-br from-indigo-500 to-indigo-600 text-white flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v6H4V5h1zm0 8H4v2h1v-2z" clipRule="evenodd" />
                  </svg>
                  <span>{formatMovieCount(movieCount)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="font-bold text-gray-800 mb-1 line-clamp-2 text-lg">{item.name}</div>
              <div className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Năm phát hành:</span>
                  <span className="font-semibold">{formatReleaseYear(item.releaseYear)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tổng số phim:</span>
                  <span className="font-semibold">{formatMovieCount(movieCount)} phim</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => onEdit(item)}
                  className="flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Sửa</span>
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}