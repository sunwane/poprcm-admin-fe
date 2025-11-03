import React from 'react';
import { Actor, MovieActor } from '@/types/Actor';
import SearchBar from '@/components/ui/SearchBar';
import GradientButton from '@/components/ui/GradientButton';
import GradientAvatar from '@/components/ui/GradientAvatar';
import FormInput from '@/components/ui/FormInput';

interface MovieActorsFormProps {
  actors: Actor[];
  selectedActors: MovieActor[];
  actorSearchTerm: string;
  isProcessing: boolean;
  onActorSearchChange: (value: string) => void;
  onAddActor: (actorId: string) => void;
  onRemoveActor: (actorId: string) => void;
  onUpdateCharacterName: (actorId: string, characterName: string) => void;
}

const MovieActorsForm: React.FC<MovieActorsFormProps> = ({
  actors,
  selectedActors,
  actorSearchTerm,
  isProcessing,
  onActorSearchChange,
  onAddActor,
  onRemoveActor,
  onUpdateCharacterName
}) => {
  const filteredActors = actors.filter(actor =>
    actor.originName.toLowerCase().includes(actorSearchTerm.toLowerCase())
  );

  const selectedActorIds = selectedActors.map(sa => sa.actorId);
  
  const availableActors = filteredActors.filter(actor => 
    !selectedActorIds.includes(actor.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Search & Available Actors */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Tìm kiếm diễn viên ({availableActors.length})
          </h4>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              searchQuery={actorSearchTerm}
              onChange={onActorSearchChange}
              placeholder="Tìm kiếm diễn viên..."
            />
          </div>

          {/* Available Actors List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableActors.length > 0 ? (
              availableActors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <GradientAvatar
                      initial={actor.originName.charAt(0)}
                    />
                    <div>
                      <span className="font-medium text-gray-900">{actor.originName}</span>
                      {actor.alsoKnownAs && actor.alsoKnownAs.length > 0 && (
                        <p className="text-sm text-gray-500 line-clamp-1">{actor.alsoKnownAs[0]}</p>
                      )}
                    </div>
                  </div>
                  
                  <GradientButton
                    onClick={() => onAddActor(actor.id)}
                    disabled={isProcessing}
                  >
                    Thêm
                  </GradientButton>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🎭</div>
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
        </div>
      </div>

      {/* Right Column - Selected Actors */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Diễn viên đã chọn ({selectedActors.length})
          </h4>
          
          {/* Selected Actors List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedActors.length > 0 ? (
              selectedActors.map((selectedActor) => {
                const actor = actors.find(a => a.id === selectedActor.actorId);
                if (!actor) return null;

                return (
                  <div
                    key={selectedActor.actorId}
                    className="p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <GradientAvatar
                          initial={actor.originName.charAt(0)}
                        />
                        <div>
                          <span className="font-medium text-gray-900">{actor.originName}</span>
                          {actor.alsoKnownAs && actor.alsoKnownAs.length > 0 && (
                            <p className="text-sm text-gray-500 line-clamp-1">{actor.alsoKnownAs[0]}</p>
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
                <div className="text-gray-400 text-lg mb-2">🎬</div>
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
                  const actor = actors.find(a => a.id === sa.actorId);
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