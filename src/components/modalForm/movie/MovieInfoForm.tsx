import React from 'react';
import { MovieFormData, MovieFormErrors } from '@/hooks/useMovieModal';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import PosterUpload from '@/components/ui/PosterUpload';
import { getMovieTypes, getMovieStatuses, getMovieLanguages } from '@/utils/movieUtils';

interface MovieInfoFormProps {
  formData: MovieFormData;
  errors: MovieFormErrors;
  uploadError: string;
  isProcessing: boolean;
  onInputChange: <K extends keyof MovieFormData>(field: K, value: MovieFormData[K]) => void;
  onPosterChange: (file: File | null, previewUrl: string) => void;
}

const MovieInfoForm: React.FC<MovieInfoFormProps> = ({
  formData,
  errors,
  uploadError,
  isProcessing,
  onInputChange,
  onPosterChange
}) => {
  const movieTypes = getMovieTypes();
  const movieStatuses = getMovieStatuses();
  const movieLanguages = getMovieLanguages();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Basic Information */}
      <div className="lg:col-span-2">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-6">Thông tin cơ bản</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên phim <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="title"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                placeholder="Nhập tên phim..."
                disabled={isProcessing}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Original Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gốc <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="originalName"
                value={formData.originalName}
                onChange={(e) => onInputChange('originalName', e.target.value)}
                placeholder="Nhập tên gốc..."
                disabled={isProcessing}
              />
              {errors.originalName && (
                <p className="text-red-500 text-sm mt-1">{errors.originalName}</p>
              )}
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm phát hành <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="releaseYear"
                value={formData.releaseYear.toString()}
                onChange={(e) => onInputChange('releaseYear', parseInt(e.target.value) || new Date().getFullYear())}
                type="number"
                placeholder="2024"
                disabled={isProcessing}
              />
              {errors.releaseYear && (
                <p className="text-red-500 text-sm mt-1">{errors.releaseYear}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại phim <span className="text-red-500">*</span>
              </label>
              <FormSelect
                filter={formData.type}
                onChange={(value) => onInputChange('type', value)}
                options={movieTypes}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="duration"
                value={formData.duration}
                onChange={(e) => onInputChange('duration', e.target.value)}
                placeholder="120 min hoặc 45 min/ep"
                disabled={isProcessing}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Total Episodes (if series) */}
            {formData.type === 'Series' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số tập
                </label>
                <FormInput
                  name="totalEpisodes"
                  value={formData.totalEpisodes?.toString() || ''}
                  onChange={(e) => onInputChange('totalEpisodes', parseInt(e.target.value) || undefined)}
                  type="number"
                  placeholder="24"
                  disabled={isProcessing}
                />
                {errors.totalEpisodes && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalEpisodes}</p>
                )}
              </div>
            )}

            {/* Director */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đạo diễn <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="director"
                value={formData.director}
                onChange={(e) => onInputChange('director', e.target.value)}
                placeholder="Nhập tên đạo diễn..."
                disabled={isProcessing}
              />
              {errors.director && (
                <p className="text-red-500 text-sm mt-1">{errors.director}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <FormSelect
                filter={formData.status}
                onChange={(value) => onInputChange('status', value)}
                options={movieStatuses}
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ <span className="text-red-500">*</span>
              </label>
              <FormSelect
                filter={formData.lang}
                onChange={(value) => onInputChange('lang', value)}
                options={movieLanguages}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Nhập mô tả phim..."
              rows={4}
              disabled={isProcessing}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - URLs and Ratings */}
      <div>
        <div className="space-y-6">
          {/* Poster Upload */}
          <div className="bg-gray-50 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Poster phim
            </label>
            <PosterUpload
              currentPoster={formData.posterUrl}
              onPosterChange={onPosterChange}
              disabled={isProcessing}
            />
            {uploadError && (
              <div className="mt-4 text-red-600 text-sm">
                {uploadError}
              </div>
            )}
          </div>

          {/* URLs Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">URLs</h4>
            
            <div className="space-y-4">
              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <FormInput
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => onInputChange('thumbnailUrl', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  disabled={isProcessing}
                />
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trailer URL
                </label>
                <FormInput
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={(e) => onInputChange('trailerUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">Đánh giá</h4>
            
            <div className="space-y-4">
              {/* TMDB Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm TMDB
                </label>
                <FormInput
                  name="tmdbScore"
                  value={formData.tmdbScore?.toString() || ''}
                  onChange={(e) => onInputChange('tmdbScore', parseFloat(e.target.value) || undefined)}
                  type="number"
                  placeholder="8.5"
                  disabled={isProcessing}
                />
              </div>

              {/* IMDB Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm IMDB
                </label>
                <FormInput
                  name="imdbScore"
                  value={formData.imdbScore?.toString() || ''}
                  onChange={(e) => onInputChange('imdbScore', parseFloat(e.target.value) || undefined)}
                  type="number"
                  placeholder="8.5"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfoForm;