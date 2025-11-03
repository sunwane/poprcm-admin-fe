import React from 'react';
import { Episode } from '@/types/Movies';
import GradientButton from '@/components/ui/GradientButton';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';

interface MovieEpisodesFormProps {
  episodes: Episode[];
  isProcessing: boolean;
  onReorderEpisodes: (newOrder: Episode[]) => void;
  onCreateEpisode: (episodeData: Partial<Episode>) => void;
  onUpdateEpisode: (episodeId: number, episodeData: Partial<Episode>) => void;
  onDeleteEpisode: (episodeId: number) => void;
}

const MovieEpisodesForm: React.FC<MovieEpisodesFormProps> = ({
  episodes,
  isProcessing,
  onReorderEpisodes,
  onCreateEpisode,
  onUpdateEpisode,
  onDeleteEpisode
}) => {
  const [draggedEpisode, setDraggedEpisode] = React.useState<Episode | null>(null);
  const [newEpisode, setNewEpisode] = React.useState<Partial<Episode>>({
    title: '',
    episodeNumber: episodes.length + 1,
    videoUrl: '',
    serverName: 'Vietsub'
  });
  const [editingEpisode, setEditingEpisode] = React.useState<Episode | null>(null);

  const serverOptions = [
    { value: 'Vietsub', label: 'Vietsub' },
    { value: 'ThuyetMinh', label: 'Thuyết minh' },
    { value: 'Raw', label: 'Raw' }
  ];

  const handleDragStart = (e: React.DragEvent, episode: Episode) => {
    setDraggedEpisode(episode);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetEpisode: Episode) => {
    e.preventDefault();
    
    if (!draggedEpisode || draggedEpisode.id === targetEpisode.id) {
      setDraggedEpisode(null);
      return;
    }

    const newEpisodes = [...episodes];
    const draggedIndex = newEpisodes.findIndex(ep => ep.id === draggedEpisode.id);
    const targetIndex = newEpisodes.findIndex(ep => ep.id === targetEpisode.id);

    // Remove dragged episode
    newEpisodes.splice(draggedIndex, 1);
    
    // Insert at new position
    newEpisodes.splice(targetIndex, 0, draggedEpisode);

    // Update episode numbers
    const reorderedEpisodes = newEpisodes.map((ep, index) => ({
      ...ep,
      episodeNumber: index + 1
    }));

    onReorderEpisodes(reorderedEpisodes);
    setDraggedEpisode(null);
  };

  const handleCreateEpisode = () => {
    if (!newEpisode.title || !newEpisode.videoUrl) return;
    
    onCreateEpisode({
      ...newEpisode,
      createdAt: new Date()
    });
    
    setNewEpisode({
      title: '',
      episodeNumber: episodes.length + 2,
      videoUrl: '',
      serverName: 'Vietsub'
    });
  };

  const handleUpdateEpisode = (episode: Episode) => {
    if (!episode.title || !episode.videoUrl) return;
    
    onUpdateEpisode(episode.id, episode);
    setEditingEpisode(null);
  };

  const handleEditEpisode = (episode: Episode) => {
    setEditingEpisode({ ...episode });
  };

  const handleCancelEdit = () => {
    setEditingEpisode(null);
  };

  return (
    <div className="space-y-6">
      {/* Create New Episode */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          Tạo tập phim mới
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tập
            </label>
            <FormInput
              name="episodeNumber"
              value={newEpisode.episodeNumber?.toString() || ''}
              onChange={(e) => setNewEpisode(prev => ({ 
                ...prev, 
                episodeNumber: parseInt(e.target.value) || 1 
              }))}
              type="number"
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên tập
            </label>
            <FormInput
              name="title"
              value={newEpisode.title || ''}
              onChange={(e) => setNewEpisode(prev => ({ 
                ...prev, 
                title: e.target.value 
              }))}
              placeholder="Nhập tên tập..."
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server
            </label>
            <FormSelect
              filter={newEpisode.serverName || 'Vietsub'}
              onChange={(value) => setNewEpisode(prev => ({ 
                ...prev, 
                serverName: value 
              }))}
              options={serverOptions}
            />
          </div>

          <div className="flex items-end">
            <GradientButton
              onClick={handleCreateEpisode}
              disabled={isProcessing || !newEpisode.title || !newEpisode.videoUrl}
            >
              Tạo tập
            </GradientButton>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <FormInput
            name="videoUrl"
            value={newEpisode.videoUrl || ''}
            onChange={(e) => setNewEpisode(prev => ({ 
              ...prev, 
              videoUrl: e.target.value 
            }))}
            placeholder="https://example.com/video.mp4"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          Danh sách tập phim ({episodes.length})
        </h4>
        
        {episodes.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                draggable={!editingEpisode}
                onDragStart={(e) => handleDragStart(e, episode)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, episode)}
                className={`p-4 bg-white rounded-lg border transition-colors cursor-move ${
                  draggedEpisode?.id === episode.id 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {editingEpisode?.id === episode.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số tập
                        </label>
                        <FormInput
                          name="episodeNumber"
                          value={editingEpisode.episodeNumber.toString()}
                          onChange={(e) => setEditingEpisode(prev => prev ? ({ 
                            ...prev, 
                            episodeNumber: parseInt(e.target.value) || 1 
                          }) : null)}
                          type="number"
                          disabled={isProcessing}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên tập
                        </label>
                        <FormInput
                          name="title"
                          value={editingEpisode.title}
                          onChange={(e) => setEditingEpisode(prev => prev ? ({ 
                            ...prev, 
                            title: e.target.value 
                          }) : null)}
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Server
                        </label>
                        <FormSelect
                          filter={editingEpisode.serverName}
                          onChange={(value) => setEditingEpisode(prev => prev ? ({ 
                            ...prev, 
                            serverName: value 
                          }) : null)}
                          options={serverOptions}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL
                      </label>
                      <FormInput
                        name="videoUrl"
                        value={editingEpisode.videoUrl}
                        onChange={(e) => setEditingEpisode(prev => prev ? ({ 
                          ...prev, 
                          videoUrl: e.target.value 
                        }) : null)}
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <GradientButton
                        onClick={() => handleUpdateEpisode(editingEpisode)}
                        disabled={isProcessing}
                      >
                        Lưu
                      </GradientButton>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isProcessing}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-blue-600">
                        #{episode.episodeNumber}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{episode.title}</h5>
                        <p className="text-sm text-gray-500">
                          Server: {episode.serverName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEpisode(episode)}
                        disabled={isProcessing}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteEpisode(episode.id)}
                        disabled={isProcessing}
                        className="px-3 py-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Xóa tập"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">📺</div>
            <p className="text-gray-500">Chưa có tập phim nào</p>
            <p className="text-sm text-gray-400 mt-1">
              Tạo tập phim đầu tiên ở phía trên
            </p>
          </div>
        )}

        {/* Drag & Drop Instructions */}
        {episodes.length > 1 && !editingEpisode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              💡 <strong>Mẹo:</strong> Kéo và thả các tập phim để sắp xếp lại thứ tự. 
              Số tập sẽ được cập nhật tự động.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieEpisodesForm;