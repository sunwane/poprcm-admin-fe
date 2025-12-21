import React from 'react';
import { Actor, MovieActor } from '@/types/Actor';
import SearchBar from '@/components/ui/SearchBar';
import GradientAvatar from '@/components/ui/GradientAvatar';
import FormInput from '@/components/ui/FormInput';
import SmallPagination from '@/components/ui/SmallPagination';

interface MovieActorsFormProps {
  actors: Actor[]; // Paginated actors for display
  allActors: Actor[]; // Full list for finding selected actors
  selectedActors: MovieActor[];
  actorSearchTerm: string;
  isProcessing: boolean;
  isSearchingActors?: boolean;
  onActorSearchChange: (value: string) => void;
  onAddActor: (actorId: string) => void;
  onRemoveActor: (actorId: string) => void;
  onUpdateCharacterName: (actorId: string, characterName: string) => void;
  // Pagination props
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const MovieActorsForm: React.FC<MovieActorsFormProps> = ({
  actors,
  allActors,
  selectedActors,
  actorSearchTerm,
  isProcessing,
  isSearchingActors = false,
  onActorSearchChange,
  onAddActor,
  onRemoveActor,
  onUpdateCharacterName,
  currentPage,
  itemsPerPage,
  totalPages,
  totalItems,
  onPageChange
}) => {
  // Use paginated actors directly from hook instead of filtering here
  const selectedActorIds = selectedActors.map(sa => sa.actorId);
  
  const availableActors = actors.filter(actor => 
    !selectedActorIds.includes(actor.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Search & Available Actors */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            Tìm kiếm diễn viên ({totalItems})
            {isSearchingActors && (
              <svg className="animate-spin ml-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
            )}
          </h4>
          
          {/* Search Bar */}
          <div className="mb-5">
            <SearchBar
              searchQuery={actorSearchTerm}
              onChange={onActorSearchChange}
              placeholder="Tìm kiếm diễn viên..."
            />
          </div>

          {/* Available Actors List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {isSearchingActors ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                  </svg>
                  <span className="text-gray-600">Đang tìm kiếm...</span>
                </div>
              </div>
            ) : availableActors.length > 0 ? (
              availableActors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {actor.profilePath ? (
                      <img
                        src={actor.profilePath}
                        alt={actor.originName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <GradientAvatar
                        initial={actor.originName.charAt(0)}
                      />
                    )}
                    <div className="hidden">
                      <GradientAvatar
                        initial={actor.originName.charAt(0)}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{actor.originName}</span>
                      {actor.alsoKnownAs && actor.alsoKnownAs.length > 0 && (
                        <p className="text-sm text-gray-500 line-clamp-1">{actor.alsoKnownAs[0]}</p>
                      )}
                      {!actor.tmdbId && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ Không có TMDB ID - có thể gây lỗi khi lưu
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className={`px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      actor.tmdbId 
                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                        : 'bg-linear-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                    }`}
                    onClick={() => onAddActor(actor.id)}
                    disabled={isProcessing}
                    title={!actor.tmdbId ? 'Actor này không có TMDB ID - có thể gây lỗi' : 'Thêm diễn viên'}
                  >
                    +
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {actorSearchTerm ? 'Không tìm thấy diễn viên nào' : 'Không có diễn viên nào khả dụng'}
                </p>
                {actorSearchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {availableActors.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <SmallPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
        {/* Helper tip */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">
              <strong>Mẹo:</strong> Nếu không tìm thấy diễn viên cần thiết, bạn có thể bỏ qua bước này và lưu phim trước. 
              Sau đó quay lại chỉnh sửa để thêm diễn viên sau khi đã thêm diễn viên cần thiết vào hệ thống.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Selected Actors */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Diễn viên đã chọn ({selectedActors.length})
          </h4>
          
          {/* Selected Actors List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {selectedActors.length > 0 ? (
              selectedActors.map((selectedActor) => {
                const actor = allActors.find(a => a.id === selectedActor.actorId);
                if (!actor) return null;

                return (
                  <div
                    key={selectedActor.actorId}
                    className="p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {actor.profilePath ? (
                          <img
                            src={actor.profilePath}
                            alt={actor.originName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <GradientAvatar
                            initial={actor.originName.charAt(0)}
                          />
                        )}
                        <div className="hidden">
                          <GradientAvatar
                            initial={actor.originName.charAt(0)}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{actor.originName}</span>
                          {actor.alsoKnownAs && actor.alsoKnownAs.length > 0 && (
                            <p className="text-sm text-gray-500 line-clamp-1">{actor.alsoKnownAs[0]}</p>
                          )}
                          {!actor.tmdbId && (
                            <p className="text-xs text-red-500 mt-1">
                              ⚠️ Không có TMDB ID - có thể gây lỗi khi lưu
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => selectedActor.actorId && onRemoveActor(selectedActor.actorId)}
                        disabled={isProcessing}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa diễn viên"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Character Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên nhân vật
                      </label>
                      <FormInput
                        name={`character-${selectedActor.actorId}`}
                        value={selectedActor.characterName || ''}
                        onChange={(e) => selectedActor.actorId && onUpdateCharacterName(selectedActor.actorId, e.target.value)}
                        placeholder="Nhập tên nhân vật..."
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa chọn diễn viên nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Chọn diễn viên từ danh sách bên trái
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedActors.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Tóm tắt:</strong> Đã chọn {selectedActors.length} diễn viên
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {selectedActors.map(sa => {
                  const actor = allActors.find(a => a.id === sa.actorId);
                  return actor ? actor.originName : 'Unknown';
                }).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieActorsForm;