import React from 'react';
import { Series } from '@/types/Series';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import PosterUpload from '@/components/ui/PosterUpload';
import { getSeriesStatuses } from '@/utils/seriesUtils';

interface SeriesInfoFormProps {
  formData: Omit<Series, 'id'>;
  errors: {
    name?: string;
    description?: string;
    status?: string;
    releaseYear?: string;
  };
  uploadError: string;
  isProcessing: boolean;
  onInputChange: (field: keyof Omit<Series, 'id' | 'seriesMovies'>, value: string) => void;
  onPosterChange: (file: File | null, previewUrl: string) => void;
}

const SeriesInfoForm: React.FC<SeriesInfoFormProps> = ({
  formData,
  errors,
  uploadError,
  isProcessing,
  onInputChange,
  onPosterChange
}) => {
  const statusOptions = getSeriesStatuses();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Poster Section */}
      <div className="lg:w-2/5">
        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-800 mb-4">
            Poster Series
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
      </div>

      {/* Form Fields */}
      <div className="lg:w-3/5">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-6">Thông tin cơ bản</h4>
          
          <div className="space-y-6">
            {/* Series Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Series <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="name"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="Nhập tên series..."
                disabled={isProcessing}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Nhập mô tả series..."
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

            {/* Status and Release Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  filter={formData.status}
                  onChange={(value) => onInputChange('status', value)}
                  options={statusOptions}
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm phát hành <span className="text-red-500">*</span>
                </label>
                <FormInput
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={(e) => onInputChange('releaseYear', e.target.value)}
                  type="number"
                  placeholder="2024"
                  disabled={isProcessing}
                />
                {errors.releaseYear && (
                  <p className="text-red-500 text-sm mt-1">{errors.releaseYear}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesInfoForm;