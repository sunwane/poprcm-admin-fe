import { useState, useEffect, useMemo } from 'react';
import { Movie } from '@/types/Movies';
import { Genre } from '@/types/Genres';
import { Country } from '@/types/Country';
import { Actor, MovieActor } from '@/types/Actor';
import { Episode } from '@/types/Movies';
import { GenresService } from '@/services/GenresService';
import { CountryService } from '@/services/CountryService';
import { ActorService } from '@/services/ActorService';

export interface MovieFormData {
  title: string;
  originalName: string;
  description: string;
  releaseYear: number;
  type: string;
  duration: string;
  posterUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  totalEpisodes?: number;
  director: string;
  status: string;
  lang: string;
  tmdbScore?: number;
  imdbScore?: number;
  selectedGenres: Genre[];
  selectedCountries: Country[];
  selectedActors: MovieActor[];
  episodes: Episode[];
}

export interface MovieFormErrors {
  title?: string;
  originalName?: string;
  description?: string;
  releaseYear?: string;
  duration?: string;
  director?: string;
  totalEpisodes?: string;
  selectedGenres?: string;
  selectedCountries?: string;
  submit?: string;
}

export type TabType = 'info' | 'countries' | 'actors' | 'genres' | 'episodes';

export const useMovieModal = (editingMovie: Movie | null, isOpen: boolean) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Form data
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    originalName: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    type: 'Movie',
    duration: '',
    posterUrl: '',
    thumbnailUrl: '',
    trailerUrl: '',
    totalEpisodes: undefined,
    director: '',
    status: 'Completed',
    lang: 'Vietsub',
    tmdbScore: undefined,
    imdbScore: undefined,
    selectedGenres: [],
    selectedCountries: [],
    selectedActors: [],
    episodes: []
  });

  // Error state
  const [errors, setErrors] = useState<MovieFormErrors>({});
  
  // Processing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Options data
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Search states for different tabs
  const [genreSearchQuery, setGenreSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [actorSearchQuery, setActorSearchQuery] = useState('');

  // Episode drag state
  const [draggedEpisodeIndex, setDraggedEpisodeIndex] = useState<number | null>(null);
  const [dragOverEpisodeIndex, setDragOverEpisodeIndex] = useState<number | null>(null);

  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [genresData, countriesData, actorsData] = await Promise.all([
          GenresService.getAllGenres(),
          CountryService.getAllCountries(),
          ActorService.getAllActors()
        ]);
        
        setGenres(genresData);
        setCountries(countriesData);
        setActors(actorsData);
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Reset form when modal opens/closes or editingMovie changes
  useEffect(() => {
    if (isOpen) {
      if (editingMovie) {
        setFormData({
          title: editingMovie.title,
          originalName: editingMovie.originalName,
          description: editingMovie.description,
          releaseYear: editingMovie.releaseYear,
          type: editingMovie.type,
          duration: editingMovie.duration,
          posterUrl: editingMovie.posterUrl || '',
          thumbnailUrl: editingMovie.thumbnailUrl || '',
          trailerUrl: editingMovie.trailerUrl || '',
          totalEpisodes: editingMovie.totalEpisodes,
          director: editingMovie.director,
          status: editingMovie.status,
          lang: editingMovie.lang,
          tmdbScore: editingMovie.tmdbScore,
          imdbScore: editingMovie.imdbScore,
          selectedGenres: editingMovie.genres || [],
          selectedCountries: editingMovie.country || [],
          selectedActors: editingMovie.actors || [],
          episodes: editingMovie.episodes || []
        });
      } else {
        setFormData({
          title: '',
          originalName: '',
          description: '',
          releaseYear: new Date().getFullYear(),
          type: 'Movie',
          duration: '',
          posterUrl: '',
          thumbnailUrl: '',
          trailerUrl: '',
          totalEpisodes: undefined,
          director: '',
          status: 'Completed',
          lang: 'Vietsub',
          tmdbScore: undefined,
          imdbScore: undefined,
          selectedGenres: [],
          selectedCountries: [],
          selectedActors: [],
          episodes: []
        });
      }
      setErrors({});
      setActiveTab('info');
    }
  }, [isOpen, editingMovie]);

  // Handle input change
  const handleInputChange = <K extends keyof MovieFormData>(
    field: K,
    value: MovieFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes changes
    if (errors[field as keyof MovieFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle poster upload
  const handlePosterChange = (file: File | null, previewUrl: string) => {
    if (file) {
      // Here you would upload the file and get the URL
      setFormData(prev => ({ ...prev, posterUrl: previewUrl }));
    } else {
      setFormData(prev => ({ ...prev, posterUrl: '' }));
    }
    setUploadError('');
  };

  // Genre search and management
  const filteredGenres = useMemo(() => {
    if (!genreSearchQuery.trim()) return genres;
    return genres.filter(genre => 
      genre.genresName.toLowerCase().includes(genreSearchQuery.toLowerCase()) &&
      !formData.selectedGenres.some(selected => selected.id === genre.id)
    );
  }, [genres, genreSearchQuery, formData.selectedGenres]);

  const handleAddGenre = (genre: Genre) => {
    if (!formData.selectedGenres.some(g => g.id === genre.id)) {
      setFormData(prev => ({
        ...prev,
        selectedGenres: [...prev.selectedGenres, genre]
      }));
      setGenreSearchQuery('');
    }
  };

  const handleRemoveGenre = (genreId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.filter(g => g.id !== genreId)
    }));
  };

  // Country search and management
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    return countries.filter(country => 
      country.countryName.toLowerCase().includes(countrySearchQuery.toLowerCase()) &&
      !formData.selectedCountries.some(selected => selected.id === country.id)
    );
  }, [countries, countrySearchQuery, formData.selectedCountries]);

  const handleAddCountry = (country: Country) => {
    if (!formData.selectedCountries.some(c => c.id === country.id)) {
      setFormData(prev => ({
        ...prev,
        selectedCountries: [...prev.selectedCountries, country]
      }));
      setCountrySearchQuery('');
    }
  };

  const handleRemoveCountry = (countryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCountries: prev.selectedCountries.filter(c => c.id !== countryId)
    }));
  };

  // Actor search and management
  const filteredActors = useMemo(() => {
    if (!actorSearchQuery.trim()) return actors;
    return actors.filter(actor => 
      actor.originName.toLowerCase().includes(actorSearchQuery.toLowerCase()) &&
      !formData.selectedActors.some(selected => selected.actor?.id === actor.id)
    );
  }, [actors, actorSearchQuery, formData.selectedActors]);

  const handleAddActor = (actor: Actor) => {
    if (!formData.selectedActors.some(ma => ma.actor?.id === actor.id)) {
      const newMovieActor: MovieActor = {
        id: `temp-${Date.now()}-${actor.id}`,
        actorId: actor.id,
        movieId: editingMovie?.id || 0,
        actor,
        characterName: ''
      };
      
      setFormData(prev => ({
        ...prev,
        selectedActors: [...prev.selectedActors, newMovieActor]
      }));
      setActorSearchQuery('');
    }
  };

  const handleRemoveActor = (actorId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedActors: prev.selectedActors.filter(ma => ma.actor?.id !== actorId)
    }));
  };

  const handleUpdateCharacterName = (actorId: string, characterName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedActors: prev.selectedActors.map(ma => 
        ma.actor?.id === actorId 
          ? { ...ma, characterName }
          : ma
      )
    }));
  };

  // Episode management
  const handleAddEpisode = (episodeData: {
    title: string;
    episodeNumber: number;
    videoUrl: string;
    m3u8Url?: string;
    serverName: string;
  }) => {
    // Check for duplicate episode number in the same server
    const isDuplicate = formData.episodes.some(ep => 
      ep.serverName === episodeData.serverName && 
      ep.episodeNumber === episodeData.episodeNumber
    );
    
    if (isDuplicate) {
      // Return error instead of adding episode
      throw new Error(`Tập ${episodeData.episodeNumber} đã tồn tại trong server ${episodeData.serverName}`);
    }

    const newEpisode: Episode = {
      id: Date.now(), // Temporary ID
      title: episodeData.title,
      episodeNumber: episodeData.episodeNumber,
      createdAt: new Date(),
      videoUrl: episodeData.videoUrl,
      m3u8Url: episodeData.m3u8Url,
      serverName: episodeData.serverName
    };

    setFormData(prev => ({
      ...prev,
      episodes: [...prev.episodes, newEpisode]
    }));
  };

  const handleRemoveEpisode = (episodeId: number) => {
    setFormData(prev => ({
      ...prev,
      episodes: prev.episodes.filter(ep => ep.id !== episodeId)
    }));
  };

  const handleUpdateEpisode = (episodeId: number, updates: Partial<Episode>) => {
    // If episode number or server name is being updated, check for duplicates
    if (updates.episodeNumber !== undefined || updates.serverName !== undefined) {
      const currentEpisode = formData.episodes.find(ep => ep.id === episodeId);
      if (currentEpisode) {
        const newEpisodeNumber = updates.episodeNumber ?? currentEpisode.episodeNumber;
        const newServerName = updates.serverName ?? currentEpisode.serverName;
        
        // Check for duplicate episode number in the same server (exclude current episode)
        const isDuplicate = formData.episodes.some(ep => 
          ep.id !== episodeId &&
          ep.serverName === newServerName && 
          ep.episodeNumber === newEpisodeNumber
        );
        
        if (isDuplicate) {
          // Return error instead of updating episode
          throw new Error(`Tập ${newEpisodeNumber} đã tồn tại trong server ${newServerName}`);
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      episodes: prev.episodes.map(ep => 
        ep.id === episodeId ? { ...ep, ...updates } : ep
      )
    }));
  };

  // Episode drag and drop
  const handleEpisodeDragStart = (e: React.DragEvent, index: number) => {
    setDraggedEpisodeIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEpisodeDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEpisodeIndex(index);
  };

  const handleEpisodeDragLeave = () => {
    setDragOverEpisodeIndex(null);
  };

  const handleEpisodeDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedEpisodeIndex === null || draggedEpisodeIndex === dropIndex) {
      setDraggedEpisodeIndex(null);
      setDragOverEpisodeIndex(null);
      return;
    }

    setFormData(prev => {
      const newEpisodes = [...prev.episodes];
      const draggedEpisode = newEpisodes[draggedEpisodeIndex];
      
      // Only allow reordering within the same server
      if (draggedEpisode.serverName !== newEpisodes[dropIndex].serverName) {
        return prev; // Don't allow cross-server moves
      }
      
      // Remove dragged episode
      newEpisodes.splice(draggedEpisodeIndex, 1);
      
      // Insert at new position (keep original episode numbers)
      newEpisodes.splice(dropIndex, 0, draggedEpisode);
      
      return {
        ...prev,
        episodes: newEpisodes
      };
    });

    setDraggedEpisodeIndex(null);
    setDragOverEpisodeIndex(null);
  };

  const handleEpisodeDragEnd = () => {
    setDraggedEpisodeIndex(null);
    setDragOverEpisodeIndex(null);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: MovieFormErrors = {};

    // Basic validation
    if (!formData.title.trim()) {
      newErrors.title = 'Tên phim không được để trống';
    }

    if (!formData.originalName.trim()) {
      newErrors.originalName = 'Tên gốc không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Đạo diễn không được để trống';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Thời lượng không được để trống';
    }

    if (formData.selectedGenres.length === 0) {
      newErrors.selectedGenres = 'Phải chọn ít nhất 1 thể loại';
    }

    if (formData.selectedCountries.length === 0) {
      newErrors.selectedCountries = 'Phải chọn ít nhất 1 quốc gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Can switch to other tabs
  const canSwitchTabs = useMemo(() => {
    return formData.title.trim().length > 0;
  }, [formData.title]);

  return {
    // Tab state
    activeTab,
    setActiveTab,
    canSwitchTabs,

    // Form data
    formData,
    handleInputChange,
    handlePosterChange,

    // Errors
    errors,
    setErrors,
    uploadError,
    setUploadError,

    // Processing states
    isSubmitting,
    setIsSubmitting,
    loadingOptions,

    // Options
    genres,
    countries,
    actors,

    // Genre management
    genreSearchQuery,
    setGenreSearchQuery,
    filteredGenres,
    handleAddGenre,
    handleRemoveGenre,

    // Country management
    countrySearchQuery,
    setCountrySearchQuery,
    filteredCountries,
    handleAddCountry,
    handleRemoveCountry,

    // Actor management
    actorSearchQuery,
    setActorSearchQuery,
    filteredActors,
    handleAddActor,
    handleRemoveActor,
    handleUpdateCharacterName,

    // Episode management
    handleAddEpisode,
    handleRemoveEpisode,
    handleUpdateEpisode,

    // Episode drag and drop
    draggedEpisodeIndex,
    dragOverEpisodeIndex,
    handleEpisodeDragStart,
    handleEpisodeDragOver,
    handleEpisodeDragLeave,
    handleEpisodeDrop,
    handleEpisodeDragEnd,

    // Validation
    validateForm
  };
};