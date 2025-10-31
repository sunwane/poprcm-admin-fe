import { Movie } from '@/types/Movies';

import { 
  getStatusColor, 
  getStatusText, 
  getTypeColor, 
  getTypeText,
  getLangColor,
  formatViewCount,
  getRatingColor,
  getCountryNames 
} from '@/utils/movieUtils';

interface MoviesCardProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
}

export default function MoviesCard({ movies, onEdit, onDelete }: MoviesCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-3/4 bg-gray-200 relative">
            <img 
              src={movie.posterUrl || '/placeholder-poster.png'} 
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-poster.png';
              }}
            />
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(movie.rating)}`}>
                ⭐ {movie.rating}
              </span>
            </div>
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movie.type)}`}>
                {getTypeText(movie.type)}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="font-medium text-gray-800 mb-1 line-clamp-2">{movie.title}</div>
            <div className="text-sm text-gray-500 mb-2 line-clamp-1">{movie.originalName}</div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Năm:</span>
                <span>{movie.releaseYear}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Thời lượng:</span>
                <span>{movie.duration}</span>
              </div>
              
              {movie.totalEpisodes && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tập:</span>
                  <span>{movie.totalEpisodes} tập</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lượt xem:</span>
                <span>{formatViewCount(movie.view)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ngôn ngữ:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLangColor(movie.lang)}`}>
                  {movie.lang}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                  {getStatusText(movie.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quốc gia:</span>
                <span className="text-xs">{getCountryNames(movie)}</span>
              </div>
              
              {(movie.tmdbScore || movie.imdbScore) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm:</span>
                  <div className="text-xs space-x-2">
                    {movie.tmdbScore && <span>TMDB: {movie.tmdbScore}</span>}
                    {movie.imdbScore && <span>IMDB: {movie.imdbScore}</span>}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button 
                className="flex-1 bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                title="Chi tiết"
              >
                👁️ Chi tiết
              </button>
              <button 
                onClick={() => onEdit(movie)}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                ✏️ Sửa
              </button>
              <button 
                onClick={() => onDelete(movie.id)}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}