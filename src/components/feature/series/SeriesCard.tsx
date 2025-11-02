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
                  <span
                    className={`flex items-top space-x-1 w-fit px-2 py-1 rounded text-xs font-medium ${getRatingColor(
                      averageRating
                    )}`}
                  >
                    <svg
                      className="w-4 h-4 text-orange-400 opacity-80"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 
                                    2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                    </svg>
                    <span className={`font-bold text-[13px] ${getRatingColor(averageRating)}`}>{averageRating}</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-[13px] font-medium bg-gray-100 text-gray-600">
                    Chưa có điểm
                  </span>
                )}
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="font-bold text-blue-950 mb-1 line-clamp-2">{item.name}</div>
              <div className="text-[12px] text-gray-500 mb-3 line-clamp-2">{item.description}</div>
              
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
                  onClick={() => onEdit(item)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}