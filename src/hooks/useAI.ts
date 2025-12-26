import { useState, useCallback } from 'react';
import { AIService, EmbeddingStats, AIStatusResponse, AIResponse } from '@/services/AIService';

export const useAI = () => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // AI Status and Stats
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [embeddingStats, setEmbeddingStats] = useState<EmbeddingStats | null>(null);
  
  // Loading states for specific operations
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingSingle, setGeneratingSingle] = useState(false);
  const [retryingFailed, setRetryingFailed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [forceRegenerating, setForceRegenerating] = useState(false);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Get AI status
  const getAIStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      clearMessages();
      
      const status = await AIService.getAIStatus();
      setAiStatus(status);
      
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy trạng thái AI';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  // Get embedding statistics
  const getEmbeddingStats = useCallback(async () => {
    try {
      setIsLoading(true);
      clearMessages();
      
      const stats = await AIService.getEmbeddingStats();
      setEmbeddingStats(stats);
      
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy thống kê embedding';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  // Generate all embeddings (incremental)
  const generateAllEmbeddings = useCallback(async () => {
    try {
      setGeneratingAll(true);
      clearMessages();
      
      const result = await AIService.generateAllEmbeddings();
      
      if (result.status === 'success') {
        setSuccess(result.message);
        // Refresh stats after generation
        await getEmbeddingStats();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tạo embedding');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo tất cả embedding';
      setError(errorMessage);
      throw err;
    } finally {
      setGeneratingAll(false);
    }
  }, [clearMessages, getEmbeddingStats]);

  // Generate single embedding
  const generateSingleEmbedding = useCallback(async (movieId: string) => {
    try {
      setGeneratingSingle(true);
      clearMessages();
      
      const result = await AIService.generateSingleEmbedding(movieId);
      
      if (result.status === 'success') {
        setSuccess(result.message);
        // Refresh stats after generation
        await getEmbeddingStats();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tạo embedding');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo embedding cho phim';
      setError(errorMessage);
      throw err;
    } finally {
      setGeneratingSingle(false);
    }
  }, [clearMessages, getEmbeddingStats]);

  // Retry failed embeddings
  const retryFailedEmbeddings = useCallback(async () => {
    try {
      setRetryingFailed(true);
      clearMessages();
      
      const result = await AIService.retryFailedEmbeddings();
      
      if (result.status === 'success') {
        setSuccess(result.message);
        // Refresh stats after retry
        await getEmbeddingStats();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi thử lại embedding');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thử lại embedding thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setRetryingFailed(false);
    }
  }, [clearMessages, getEmbeddingStats]);

  // Reset embeddings (clear all)
  const resetEmbeddings = useCallback(async () => {
    try {
      setResetting(true);
      clearMessages();
      
      const result = await AIService.resetEmbeddings();
      
      if (result.status === 'success') {
        setSuccess(result.message);
        // Refresh stats after reset
        await getEmbeddingStats();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi xóa embedding');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa tất cả embedding';
      setError(errorMessage);
      throw err;
    } finally {
      setResetting(false);
    }
  }, [clearMessages, getEmbeddingStats]);

  // Force regenerate all embeddings (delete all + recreate)
  const forceRegenerateAllEmbeddings = useCallback(async () => {
    try {
      setForceRegenerating(true);
      clearMessages();
      
      const result = await AIService.forceRegenerateAllEmbeddings();
      
      if (result.status === 'success') {
        setSuccess(result.message);
        // Refresh stats after force regeneration
        await getEmbeddingStats();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tái tạo embedding');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tái tạo tất cả embedding';
      setError(errorMessage);
      throw err;
    } finally {
      setForceRegenerating(false);
    }
  }, [clearMessages, getEmbeddingStats]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        getAIStatus(),
        getEmbeddingStats()
      ]);
    } catch (err) {
      console.error('Error refreshing AI data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAIStatus, getEmbeddingStats]);

  return {
    // State
    isLoading,
    error,
    success,
    aiStatus,
    embeddingStats,
    
    // Loading states for specific operations
    generatingAll,
    generatingSingle,
    retryingFailed,
    resetting,
    forceRegenerating,
    
    // Actions
    getAIStatus,
    getEmbeddingStats,
    generateAllEmbeddings,
    generateSingleEmbedding,
    retryFailedEmbeddings,
    resetEmbeddings,
    forceRegenerateAllEmbeddings,
    refreshData,
    clearMessages
  };
};