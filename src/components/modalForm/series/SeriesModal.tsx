import React from 'react';
import { Series } from '@/types/Series';
import SeriesInfoForm from './SeriesInfoForm';
import GradientButton from '@/components/ui/GradientButton';
import { useSeriesModal } from '@/hooks/useSeriesModal';
import SeriesMovieForm from './SeriesMovieForm';

interface SeriesModalProps {
  isOpen: boolean;
  editingSeries: Series | null;
  onClose: () => void;
  onSave: (seriesData: Omit<Series, 'id'>) => Promise<void>;
}

const SeriesModal: React.FC<SeriesModalProps> = ({
  isOpen,
  editingSeries,
  onClose,
  onSave
}) => {
  const {
    activeTab,
    formData,
    errors,
    uploadError,
    isProcessing,
    canSwitchToMovies,
    setActiveTab,
    handleInputChange,
    handleSeriesMoviesChange,
    handlePosterChange,
    validateForm,
    setIsSubmitting,
    setErrors,
    // Search props for SeriesMovieManager
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setSearchQuery,
    handleAddMovie,
    handleRemoveMovie,
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useSeriesModal(editingSeries, isOpen);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        releaseYear: formData.releaseYear,
        posterUrl: formData.posterUrl.trim(),
        seriesMovies: formData.seriesMovies
      });
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu series' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-600">
              {editingSeries ? 'Chỉnh sửa Series' : 'Thêm Series mới'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1.5 mb-8">
            <button
              onClick={() => setActiveTab('info')}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Thông tin Series</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              disabled={isProcessing || !canSwitchToMovies}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'movies'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!canSwitchToMovies ? 'Vui lòng nhập tên series trước' : ''}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-1 16h12L17 4M9 8v8m6-8v8" />
                </svg>
                <span>Quản lý Phim ({formData.seriesMovies?.length || 0})</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tab Content */}
            {activeTab === 'info' ? (
              <SeriesInfoForm
                formData={formData}
                errors={errors}
                uploadError={uploadError}
                isProcessing={isProcessing}
                onInputChange={handleInputChange}
                onPosterChange={handlePosterChange}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <SeriesMovieForm
                  seriesMovies={formData.seriesMovies || []}
                  onSeriesMoviesChange={handleSeriesMoviesChange}
                  disabled={isProcessing}
                  // Search props
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  showSearchResults={showSearchResults}
                  onSearchQueryChange={setSearchQuery}
                  onAddMovie={handleAddMovie}
                  onRemoveMovie={handleRemoveMovie}
                  // Drag props
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-6">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {/* Navigation buttons */}
              <div className="flex space-x-2">
                {activeTab === 'movies' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Quay lại thông tin</span>
                  </button>
                )}
                {activeTab === 'info' && canSwitchToMovies && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('movies')}
                    disabled={isProcessing}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span>Quản lý phim</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium text-nowrap"
                >
                  Hủy bỏ
                </button>
                <GradientButton disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    editingSeries ? 'Cập nhật Series' : 'Thêm Series'
                  )}
                </GradientButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeriesModal;