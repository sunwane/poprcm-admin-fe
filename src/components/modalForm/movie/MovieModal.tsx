import React from 'react';
import { Movie } from '@/types/Movies';
import { useMovieModal } from '@/hooks/useMovieModal';
import GradientButton from '@/components/ui/GradientButton';
import MovieInfoForm from '@/components/modalForm/movie/MovieInfoForm';
import MovieCountriesForm from '@/components/modalForm/movie/MovieCountriesForm';
import MovieActorsForm from '@/components/modalForm/movie/MovieActorsForm';
import MovieGenresForm from '@/components/modalForm/movie/MovieGenresForm';
import MovieEpisodesForm from '@/components/modalForm/movie/MovieEpisodesForm';

interface MovieModalProps {
  isOpen: boolean;
  editingMovie: Movie | null;
  onClose: () => void;
  onSave: (movieData: Partial<Movie>) => void;
}

export default function MovieModal({ isOpen, editingMovie, onClose, onSave }: MovieModalProps) {
  const {
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

    // Processing states
    isSubmitting,
    setIsSubmitting,
    loadingOptions,

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

    // Validation
    validateForm
  } = useMovieModal(editingMovie, isOpen);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Must have basic info, countries, and genres to save
    const hasBasicInfo = formData.title.trim() && formData.originalName.trim() && formData.description.trim();
    const hasCountries = formData.selectedCountries.length > 0;
    const hasGenres = formData.selectedGenres.length > 0;
    
    const canSaveMovie = hasBasicInfo && hasCountries && hasGenres;
    
    if (!canSaveMovie) {
      return;
    }
    
    if (!validateForm()) {
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      const movieData = {
        title: formData.title.trim(),
        originalName: formData.originalName.trim(),
        description: formData.description.trim(),
        releaseYear: formData.releaseYear,
        type: formData.type,
        duration: formData.duration.trim(),
        posterUrl: formData.posterUrl.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        trailerUrl: formData.trailerUrl.trim() || undefined,
        totalEpisodes: formData.totalEpisodes,
        director: formData.director.trim(),
        status: formData.status,
        lang: formData.lang,
        tmdbScore: formData.tmdbScore,
        imdbScore: formData.imdbScore,
        genres: formData.selectedGenres,
        country: formData.selectedCountries,
        actors: formData.selectedActors,
        episodes: formData.episodes
      };

      onSave(movieData);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu phim' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save button click
  const handleSaveClick = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  // Handle next tab navigation
  const handleNextTab = () => {
    const hasBasicInfo = formData.title.trim() && formData.originalName.trim() && formData.description.trim();
    const hasCountries = formData.selectedCountries.length > 0;
    const hasGenres = formData.selectedGenres.length > 0;

    if (activeTab === 'info' && hasBasicInfo) {
      setActiveTab('countries');
    } else if (activeTab === 'countries' && hasCountries) {
      setActiveTab('genres');
    } else if (activeTab === 'genres' && hasGenres) {
      setActiveTab('actors');
    } else if (activeTab === 'actors') {
      setActiveTab('episodes');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'info', label: 'Thông tin phim', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'countries', label: 'Quốc gia', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'genres', label: 'Thể loại', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { id: 'actors', label: 'Diễn viên', icon: '  M12 2C13.933 2 15.5 3.567 15.5 5.5S13.933 9 12 9 8.5 7.433 8.5 5.5 10.067 2 12 2zM12 11c-3.866 0-7 3.134-7 7v1c0 .552.448 1 1 1h12c.552 0 1-.448 1-1v-1c0-3.866-3.134-7-7-7z' },
    { id: 'episodes', label: `Tập phim (${formData.episodes.length})`, icon: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-1 16h12L17 4M9 8v8m6-8v8' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-600">
              {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loadingOptions ? (
            <div className="text-center py-8">
              <div className="text-lg">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1.5 mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={isSubmitting || (tab.id !== 'info' && !canSwitchTabs)}
                    className={`flex-1 px-3 py-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={tab.id !== 'info' && !canSwitchTabs ? 'Vui lòng nhập tên phim trước' : ''}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                      </svg>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg py-4 px-6 mb-3 mx-3">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

              <form onSubmit={handleSubmit}>
                {/* Tab Content */}
                {activeTab === 'info' && (
                  <MovieInfoForm
                    formData={formData}
                    errors={errors}
                    uploadError={uploadError}
                    isProcessing={isSubmitting}
                    onInputChange={handleInputChange}
                  />
                )}

                {activeTab === 'countries' && (
                  <MovieCountriesForm
                    countries={filteredCountries}
                    selectedCountryIds={formData.selectedCountries.map(c => c.id)}
                    countrySearchTerm={countrySearchQuery}
                    isProcessing={isSubmitting}
                    onCountrySearchChange={setCountrySearchQuery}
                    onToggleCountry={(countryId) => {
                      const country = filteredCountries.find(c => c.id === countryId);
                      if (country) {
                        if (formData.selectedCountries.find(c => c.id === countryId)) {
                          handleRemoveCountry(countryId);
                        } else {
                          handleAddCountry(country);
                        }
                      }
                    }}
                  />
                )}

                {activeTab === 'genres' && (
                  <MovieGenresForm
                    genres={filteredGenres}
                    selectedGenreIds={formData.selectedGenres.map(genre => genre.id)}
                    genreSearchTerm={genreSearchQuery}
                    isProcessing={isSubmitting}
                    onGenreSearchChange={setGenreSearchQuery}
                    onToggleGenre={(genreId) => {
                      const genre = filteredGenres.find(g => g.id === genreId);
                      if (genre) {
                        if (formData.selectedGenres.find(g => g.id === genreId)) {
                          handleRemoveGenre(genreId);
                        } else {
                          handleAddGenre(genre);
                        }
                      }
                    }}
                  />
                )}

                {activeTab === 'actors' && (
                  <MovieActorsForm
                    actors={filteredActors}
                    selectedActors={formData.selectedActors}
                    actorSearchTerm={actorSearchQuery}
                    isProcessing={isSubmitting}
                    onActorSearchChange={setActorSearchQuery}
                    onAddActor={(actorId) => {
                      const actor = filteredActors.find(a => a.id === actorId);
                      if (actor) {
                        handleAddActor(actor);
                      }
                    }}
                    onRemoveActor={handleRemoveActor}
                    onUpdateCharacterName={handleUpdateCharacterName}
                  />
                )}

                {activeTab === 'episodes' && (
                  <MovieEpisodesForm
                    episodes={formData.episodes}
                    isProcessing={isSubmitting}
                    onReorderEpisodes={(newOrder) => {
                      // Handle reordering episodes
                      handleInputChange('episodes', newOrder);
                    }}
                    onCreateEpisode={(episodeData) => {
                      try {
                        // Clear any previous errors
                        setErrors(prev => ({ ...prev, submit: undefined }));
                        handleAddEpisode(episodeData);
                      } catch (error) {
                        setErrors(prev => ({ 
                          ...prev, 
                          submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo tập phim' 
                        }));
                        // Auto clear error after 5 seconds
                        setTimeout(() => {
                          setErrors(prev => ({ ...prev, submit: undefined }));
                        }, 10000);
                      }
                    }}
                    onUpdateEpisode={(episodeId, episodeData) => {
                      try {
                        // Clear any previous errors
                        setErrors(prev => ({ ...prev, submit: undefined }));
                        handleUpdateEpisode(episodeId, episodeData);
                      } catch (error) {
                        setErrors(prev => ({ 
                          ...prev, 
                          submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật tập phim' 
                        }));
                        // Auto clear error after 10 seconds
                        setTimeout(() => {
                          setErrors(prev => ({ ...prev, submit: undefined }));
                        }, 10000);
                      }
                    }}
                    onDeleteEpisode={(episodeId) => {
                      handleRemoveEpisode(episodeId);
                    }}
                  />
                )}

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {/* Next Tab Button */}
                    {(() => {
                      const hasBasicInfo = formData.title.trim() && formData.originalName.trim() && formData.description.trim();
                      const hasCountries = formData.selectedCountries.length > 0;
                      const hasGenres = formData.selectedGenres.length > 0;
                      
                      const canGoNext = 
                        (activeTab === 'info' && hasBasicInfo) ||
                        (activeTab === 'countries' && hasCountries) ||
                        (activeTab === 'genres' && hasGenres) ||
                        (activeTab === 'actors') ||
                        (activeTab === 'episodes');
                      
                      const isLastTab = activeTab === 'episodes';
                      
                      if (!isLastTab && canGoNext) {
                        return (
                          <button
                            type="button"
                            onClick={handleNextTab}
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Chuyển sang tab tiếp theo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span>Tiếp theo</span>
                          </button>
                        );
                      }
                      return null;
                    })()}

                    {/* Warning Message */}
                    <div className="text-sm text-blue-500">
                      {(() => {
                        const hasBasicInfo = formData.title.trim() && formData.originalName.trim() && formData.description.trim();
                        const hasCountries = formData.selectedCountries.length > 0;
                        const hasGenres = formData.selectedGenres.length > 0;
                        const canSaveMovie = hasBasicInfo && hasCountries && hasGenres;
                        
                        if (!canSwitchTabs && activeTab === 'info') {
                          return 'Nhập tên phim để mở khóa các tab khác';
                        }
                        
                        if (!canSaveMovie) {
                          const missing = [];
                          if (!hasBasicInfo) missing.push('thông tin cơ bản');
                          if (!hasCountries) missing.push('quốc gia');
                          if (!hasGenres) missing.push('thể loại');
                          
                          return `Cần nhập đầy đủ ${missing.join(', ')} để có thể lưu phim`;
                        }
                        
                        return 'Đã đủ thông tin cơ bản để lưu phim';
                      })()}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gray-500 text-nowrap text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                    >
                      Hủy bỏ
                    </button>
                    
                    {/* Save Movie Button */}
                    <GradientButton 
                      onClick={handleSaveClick}
                      disabled={(() => {
                        const hasBasicInfo = formData.title.trim() && formData.originalName.trim() && formData.description.trim();
                        const hasCountries = formData.selectedCountries.length > 0;
                        const hasGenres = formData.selectedGenres.length > 0;
                        const canSaveMovie = hasBasicInfo && hasCountries && hasGenres;
                        
                        return isSubmitting || !canSaveMovie;
                      })()}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang lưu...
                        </>
                      ) : (
                        editingMovie ? 'Cập nhật phim' : 'Lưu phim'
                      )}
                    </GradientButton>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}