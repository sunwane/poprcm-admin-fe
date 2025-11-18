import React, { useState } from 'react';
import { Episode } from '@/types/Movies';
import { EpisodesService } from '@/services/EpisodesService';

interface EpisodesSectionProps {
  episodes: Episode[];
  movieId?: string;
  onEpisodeClick: (videoUrl: string, title: string) => void;
  onEpisodeEdit?: (episode: Episode) => void;
}

const EpisodesSection: React.FC<EpisodesSectionProps> = ({ 
  episodes, 
  movieId, 
  onEpisodeClick, 
  onEpisodeEdit 
}) => {
  // Group episodes by server
  const episodesByServer = episodes.reduce((acc, episode) => {
    const serverName = episode.serverName || 'Default';
    if (!acc[serverName]) {
      acc[serverName] = [];
    }
    acc[serverName].push(episode);
    return acc;
  }, {} as Record<string, Episode[]>);

  const servers = Object.keys(episodesByServer);
  const [activeServer, setActiveServer] = useState(servers[0] || '');
  const [loading, setLoading] = useState(false);

  const handleEpisodeDetail = async (episodeId: string) => {
    if (!movieId) return;
    
    setLoading(true);
    try {
      const episodeDetail = await EpisodesService.getEpisodeById(episodeId);
      if (episodeDetail && onEpisodeEdit) {
        onEpisodeEdit(episodeDetail);
      }
    } catch (error) {
      console.error('Error loading episode detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (episodes.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tập phim ({episodes.length})</h3>
      
      {/* Server Tabs */}
      {servers.length > 1 && (
        <div className="flex border-b border-gray-200 mb-4">
          {servers.map((server) => (
            <button
              key={server}
              onClick={() => setActiveServer(server)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeServer === server
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {server} ({episodesByServer[server].length})
            </button>
          ))}
        </div>
      )}

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {episodesByServer[activeServer]?.map((episode) => (
          <div key={episode.id} className="relative group">
            <button
              onClick={() => onEpisodeClick(episode.videoUrl, `Tập ${episode.episodeNumber}: ${episode.title}`)}
              className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 text-center transition-colors"
              disabled={loading}
            >
              <div className="font-bold text-blue-700 group-hover:text-blue-800">
                Tập {episode.episodeNumber}
              </div>
              <div className="text-xs text-blue-600 mt-1 truncate">
                {episode.title}
              </div>
            </button>
            
            {/* Episode detail button */}
            {onEpisodeEdit && movieId && (
              <button
                onClick={() => handleEpisodeDetail(episode.id.toString())}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 rounded-full p-1 shadow-md transition-opacity"
                disabled={loading}
                title="Xem chi tiết tập"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EpisodesSection;