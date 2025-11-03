import React from 'react';
import { Genre } from '@/types/Genres';
import SearchBar from '@/components/ui/SearchBar';
import GradientButton from '@/components/ui/GradientButton';

interface MovieGenresFormProps {
  genres: Genre[];
  selectedGenreIds: string[];
  genreSearchTerm: string;
  isProcessing: boolean;
  onGenreSearchChange: (value: string) => void;
  onToggleGenre: (genreId: string) => void;
}

const MovieGenresForm: React.FC<MovieGenresFormProps> = ({
  genres,
  selectedGenreIds,
  genreSearchTerm,
  isProcessing,
  onGenreSearchChange,
  onToggleGenre
}) => {
  const filteredGenres = genres.filter(genre =>
    genre.genresName.toLowerCase().includes(genreSearchTerm.toLowerCase())
  );

  const selectedGenres = genres.filter(genre => 
    selectedGenreIds.includes(genre.id)
  );

  const availableGenres = filteredGenres.filter(genre => 
    !selectedGenreIds.includes(genre.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Search & Available Genres */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Tìm kiếm thể loại ({availableGenres.length})
          </h4>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              searchQuery={genreSearchTerm}
              onChange={onGenreSearchChange}
              placeholder="Tìm kiếm thể loại..."
            />
          </div>

          {/* Available Genres Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {availableGenres.length > 0 ? (
              availableGenres.map((genre) => (
                <div
                  key={genre.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="font-medium text-gray-900 text-sm mb-2">
                      {genre.genresName}
                    </div>
                    
                    <GradientButton
                      onClick={() => onToggleGenre(genre.id)}
                      disabled={isProcessing}
                    >
                      Thêm
                    </GradientButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🎭</div>
                <p className="text-gray-500">
                  {genreSearchTerm ? 'Không tìm thấy thể loại nào' : 'Không có thể loại nào khả dụng'}
                </p>
                {genreSearchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Selected Genres */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Thể loại đã chọn ({selectedGenres.length})
          </h4>
          
          {/* Selected Genres Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {selectedGenres.length > 0 ? (
              selectedGenres.map((genre) => (
                <div
                  key={genre.id}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="text-center relative">
                    <button
                      onClick={() => onToggleGenre(genre.id)}
                      disabled={isProcessing}
                      className="absolute -top-2 -right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-red-200"
                      title="Xóa thể loại"
                    >
                      ✕
                    </button>
                    
                    <div className="text-2xl mb-2">🎬</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {genre.genresName}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🏷️</div>
                <p className="text-gray-500">Chưa chọn thể loại nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Chọn thể loại từ danh sách bên trái
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedGenres.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Tóm tắt:</strong> Đã chọn {selectedGenres.length} thể loại
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {selectedGenres.map(genre => genre.genresName).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieGenresForm;