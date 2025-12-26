import React, { useEffect, useState } from 'react';
import { useAI } from '@/hooks/useAI';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Notification from '@/components/ui/Notification';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose }) => {
  const {
    isLoading,
    error,
    success,
    aiStatus,
    embeddingStats,
    generatingAll,
    generatingSingle,
    retryingFailed,
    resetting,
    forceRegenerating,
    generateAllEmbeddings,
    generateSingleEmbedding,
    retryFailedEmbeddings,
    resetEmbeddings,
    forceRegenerateAllEmbeddings,
    refreshData,
    clearMessages
  } = useAI();

  const [movieId, setMovieId] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmForceRegenerate, setShowConfirmForceRegenerate] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, refreshData]);

  // Close modal handler
  const handleClose = () => {
    clearMessages();
    setShowConfirmReset(false);
    setShowConfirmForceRegenerate(false);
    onClose();
  };

  // Handle generate single embedding
  const handleGenerateSingle = async () => {
    if (movieId.trim()) {
      await generateSingleEmbedding(movieId.trim());
      setMovieId('');
    }
  };

  // Handle reset with confirmation
  const handleResetConfirm = () => {
    setShowConfirmReset(true);
  };

  const handleResetCancel = () => {
    setShowConfirmReset(false);
  };

  const handleResetExecute = async () => {
    setShowConfirmReset(false);
    await resetEmbeddings();
  };

  // Handle force regenerate with confirmation
  const handleForceRegenerateConfirm = () => {
    setShowConfirmForceRegenerate(true);
  };

  const handleForceRegenerateCancel = () => {
    setShowConfirmForceRegenerate(false);
  };

  const handleForceRegenerateExecute = async () => {
    setShowConfirmForceRegenerate(false);
    await forceRegenerateAllEmbeddings();
  };

  if (!isOpen) return null;

  const isAnyLoading = isLoading || generatingAll || retryingFailed || resetting || forceRegenerating || generatingSingle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-screen overflow-hidden shadow-xl">
        {isAnyLoading && <LoadingOverlay isVisible={true} />}
        
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-600">
              Quản lý AI
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isAnyLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mb-6">
              <Notification
                type="error"
                message={error}
                onClose={clearMessages}
              />
            </div>
          )}
          
          {success && (
            <div className="mb-6">
              <Notification
                type="success"
                message={success}
                onClose={clearMessages}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 pb-8 overflow-y-auto max-h-[calc(100vh-180px)]">
          
          {/* Status Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-800">
                Trạng thái và thống kê
              </h4>
              <button
                onClick={refreshData}
                disabled={isAnyLoading}
                className="flex items-center gap-1 text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <svg 
                  className="w-4 h-4 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                {isLoading ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {aiStatus ? (
                <>
                  <div className="p-4 rounded-lg border border-blue-200 shadow-sm bg-linear-to-br from-blue-50 via-white to-blue-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">Dịch vụ AI</div>
                    <div className={`text-lg font-bold ${aiStatus.ai_features === 'enabled' ? 'text-green-600' : 'text-red-600'}`}>{aiStatus.ai_features === 'enabled' ? 'Hoạt động' : 'Ngưng hoạt động'}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-cyan-200 shadow-sm bg-linear-to-br from-cyan-50 via-white to-cyan-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">MySQL</div>
                    <div className={`text-lg font-bold ${aiStatus.mysql === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{aiStatus.mysql === 'connected' ? 'Kết nối' : 'Ngắt kết nối'}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-indigo-200 shadow-sm bg-linear-to-br from-indigo-50 via-white to-indigo-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">PostgreSQL</div>
                    <div className={`text-lg font-bold ${aiStatus.postgresql === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{aiStatus.postgresql === 'connected' ? 'Kết nối' : 'Ngắt kết nối'}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-purple-200 shadow-sm bg-linear-to-br from-purple-50 via-white to-purple-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">OpenAI</div>
                    <div className={`text-lg font-bold ${aiStatus.openai_configured ? 'text-green-600' : 'text-red-600'}`}>{aiStatus.openai_configured ? 'Đã cấu hình' : 'Chưa cấu hình'}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg border border-blue-200 shadow-sm bg-linear-to-br from-blue-50 via-white to-blue-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">Dịch vụ AI</div>
                    <div className="text-lg font-bold text-gray-500">Đang tải...</div>
                  </div>
                  <div className="p-4 rounded-lg border border-cyan-200 shadow-sm bg-linear-to-br from-cyan-50 via-white to-cyan-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">MySQL</div>
                    <div className="text-lg font-bold text-gray-500">Đang tải...</div>
                  </div>
                  <div className="p-4 rounded-lg border border-indigo-200 shadow-sm bg-linear-to-br from-indigo-50 via-white to-indigo-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">PostgreSQL</div>
                    <div className="text-lg font-bold text-gray-500">Đang tải...</div>
                  </div>
                  <div className="p-4 rounded-lg border border-purple-200 shadow-sm bg-linear-to-br from-purple-50 via-white to-purple-100">
                    <div className="text-sm text-blue-700 mb-1 font-semibold">OpenAI</div>
                    <div className="text-lg font-bold text-gray-500">Đang tải...</div>
                  </div>
                </>
              )}
              <div className="p-4 rounded-lg border border-blue-300 shadow-sm bg-linear-to-br from-blue-100 via-white to-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-700 mb-1">{embeddingStats ? embeddingStats.total_movies : 0}</div>
                <div className="text-sm text-blue-800 font-semibold">Tổng số phim</div>
              </div>
              <div className="p-4 rounded-lg border border-green-300 shadow-sm bg-linear-to-br from-green-100 via-white to-green-200 text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">{embeddingStats ? embeddingStats.embedded_movies : 0}</div>
                <div className="text-sm text-green-800 font-semibold">Đã có embedding</div>
              </div>
              <div className="p-4 rounded-lg border border-red-300 shadow-sm bg-linear-to-br from-red-100 via-white to-red-200 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{embeddingStats ? embeddingStats.remaining : 0}</div>
                <div className="text-sm text-red-700 font-semibold">Còn lại</div>
              </div>
              <div className="p-4 rounded-lg border border-purple-300 shadow-sm bg-linear-to-br from-purple-100 via-white to-purple-200 text-center">
                <div className="text-2xl font-bold text-purple-700 mb-1">{embeddingStats ? embeddingStats.completion_percentage : '0%'}</div>
                <div className="text-sm text-purple-800 font-semibold">Tiến độ</div>
              </div>
            </div>
          </div>

          {/* Management Actions Section */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Thao tác quản lý
            </h4>
            <div className="space-y-2">

              {/* Generate Single - Input + Button */}
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  placeholder="Nhập Movie ID để tạo embedding đơn lẻ"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleGenerateSingle}
                  disabled={!movieId.trim() || isAnyLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingSingle ? 'Đang tạo...' : 'Generate Single'}
                </button>
              </div>
              
              <div className="flex w-full gap-2 justify-between items-center">
                {/* Generate All Button */}
                <div className='flex-1'>
                  <button
                    onClick={generateAllEmbeddings}
                    disabled={isAnyLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {generatingAll ? 'Đang tạo tất cả embedding...' : 'Generate All Embeddings'}
                  </button>
                </div>

                {/* Retry Failed Button */}
                <div className='flex-1'>
                  <button
                    onClick={retryFailedEmbeddings}
                    disabled={isAnyLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {retryingFailed ? 'Đang thử lại...' : 'Retry Failed Embeddings'}
                  </button>
                </div>
              </div>

              <div className="flex w-full gap-2 justify-between items-center">
                {/* Generate All Button */}
                <div className='flex-1'>
                  <button
                    onClick={handleResetConfirm}
                    disabled={isAnyLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {resetting ? 'Đang xóa...' : 'Reset All Embeddings'}
                  </button>
                </div>

                {/* Retry Failed Button */}
                <div className='flex-1'>
                  <button
                    onClick={handleForceRegenerateConfirm}
                    disabled={isAnyLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {forceRegenerating ? 'Đang tái tạo...' : 'Force Regenerate All Embeddings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modals */}
        {showConfirmReset && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận Reset Embeddings</h3>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa tất cả embedding? Thao tác này không thể hoàn tác và sẽ mất tất cả dữ liệu embedding hiện có.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleResetExecute}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmForceRegenerate && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4 text-orange-600">Xác nhận Force Regenerate</h3>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn tái tạo tất cả embedding? Thao tác này sẽ xóa tất cả embedding hiện tại và tạo lại từ đầu. Quá trình có thể mất thời gian dài.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleForceRegenerateCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleForceRegenerateExecute}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Force Regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModal;