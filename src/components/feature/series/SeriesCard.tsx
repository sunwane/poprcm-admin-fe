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
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-3/4 bg-gray-200 relative">
              <img 
                src={item.posterUrl || '/placeholder-poster.png'} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-poster.png';
                }}
              />
              <div className="absolute top-2 right-2">
                {averageRating > 0 ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(averageRating)}`}>
                    ⭐ {averageRating}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Chưa có điểm
                  </span>
                )}
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  item.status
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="font-medium text-gray-800 mb-1 line-clamp-2">{item.name}</div>
              <div className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Năm:</span>
                  <span>{formatReleaseYear(item.releaseYear)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số phim:</span>
                  <span>{formatMovieCount(movieCount)}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button 
                  className="flex-1 bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  title="Chi tiết"
                >
                  👁️ Chi tiết
                </button>
                <button 
                  onClick={() => onEdit(item)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  ✏️ Sửa
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}