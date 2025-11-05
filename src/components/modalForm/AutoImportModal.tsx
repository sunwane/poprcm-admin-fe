'use client';

import { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import GradientButton from '@/components/ui/GradientButton';

interface AutoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'update'; // import = thêm tự động, update = cập nhật
}

export default function AutoImportModal({ isOpen, onClose, mode }: AutoImportModalProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [movieCount, setMovieCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (movieCount <= 0) {
        setError('Số lượng phim phải lớn hơn 0');
        return;
      }

      if (movieCount > 100) {
        setError('Số lượng phim không được vượt quá 100');
        return;
      }

      // TODO: Gọi service thực tế
      if (mode === 'import') {
        // await MovieImportService.autoImportMovies(apiUrl, movieCount);
        console.log('Auto import movies:', { apiUrl, movieCount });
      } else {
        // await MovieImportService.updateMovies(apiUrl, movieCount);
        console.log('Update movies:', { apiUrl, movieCount });
      }

      // Reset form và đóng modal
      setApiUrl('');
      setMovieCount(10);
      onClose();
      
      // Hiển thị thông báo thành công
      alert(`${mode === 'import' ? 'Thêm' : 'Cập nhật'} ${movieCount} phim thành công!`);
    } catch (error: any) {
      setError(error.message || `${mode === 'import' ? 'Thêm' : 'Cập nhật'} phim thất bại!`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApiUrl('');
    setMovieCount(10);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {mode === 'import' ? 'Thêm phim tự động' : 'Cập nhật phim tự động'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL (Tùy chọn)
              </label>
              <FormInput
                name="apiUrl"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/movies"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Để trống để sử dụng API mặc định
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng phim
              </label>
              <FormInput
                name="movieCount"
                type="number"
                value={movieCount.toString()}
                onChange={(e) => setMovieCount(parseInt(e.target.value) || 0)}
                placeholder="10"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối đa 100 phim mỗi lần {mode === 'import' ? 'thêm' : 'cập nhật'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <div className="flex-1">
              <GradientButton disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  mode === 'import' ? 'Thêm phim' : 'Cập nhật phim'
                )}
              </GradientButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}