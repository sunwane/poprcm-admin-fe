export interface SimilarMovie {
  id: string;
  title: string;
  similarity: number;
  posterUrl?: string;
  releaseYear?: number;
}

export interface EmbeddingStats {
  total_movies: number;
  embedded_movies: number;
  completion_percentage: string;
  remaining: number;
}

export interface AISearchResult {
  status: string;
  query: string;
  movies: SimilarMovie[];
  count: number;
  message: string;
}

export interface AIStatusResponse {
  status: string;
  mysql: string;
  postgresql: string;
  ai_features: string;
  openai_configured: boolean;
  embedding_stats: EmbeddingStats;
  timestamp: number;
}

export interface AIResponse {
  status: string;
  message: string;
  [key: string]: any;
}

export class AIService {
  private static readonly API_BASE_URL = 'https://poprcm-be.onrender.com/api/ai';

  // Kiểm tra service availability từ localStorage
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Get embedding statistics
  static async getEmbeddingStats(): Promise<EmbeddingStats> {
    if (!this.isServiceAvailable()) {
      // Mock data for development - start with zeros
      return {
        total_movies: 0,
        embedded_movies: 0,
        completion_percentage: "0.00%",
        remaining: 0
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting embedding stats:', error);
      throw error;
    }
  }

  // Get detailed AI status
  static async getAIStatus(): Promise<AIStatusResponse> {
    if (!this.isServiceAvailable()) {
      // Mock data for development - matching backend format
      return {
        status: "operational",
        mysql: "connected",
        postgresql: "connected", 
        ai_features: "enabled",
        openai_configured: true,
        embedding_stats: {
          total_movies: 0,
          embedded_movies: 0,
          completion_percentage: "0.00%",
          remaining: 0
        },
        timestamp: Date.now()
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting AI status:', error);
      throw error;
    }
  }

  // Generate all embeddings (incremental)
  static async generateAllEmbeddings(): Promise<AIResponse> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        message: "Mock: Incremental embedding generation completed",
        type: "incremental"
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/generate-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating all embeddings:', error);
      throw error;
    }
  }

  // Generate single embedding
  static async generateSingleEmbedding(movieId: string): Promise<AIResponse> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        message: `Mock: Embedding generated for movie ${movieId}`
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/generate-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ movieId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating single embedding:', error);
      throw error;
    }
  }

  // Retry failed embeddings
  static async retryFailedEmbeddings(): Promise<AIResponse> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        message: "Mock: Retry completed - check logs for detailed results"
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/retry-failed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error retrying failed embeddings:', error);
      throw error;
    }
  }

  // Reset embeddings (clear all)
  static async resetEmbeddings(): Promise<AIResponse> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        message: "Mock: All embeddings cleared successfully",
        deleted_count: 750,
        remaining_count: 0,
        method: "batched_delete"
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/reset-embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resetting embeddings:', error);
      throw error;
    }
  }

  // Force regenerate all embeddings (delete all + recreate)
  static async forceRegenerateAllEmbeddings(): Promise<AIResponse> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        message: "Mock: FORCE REGENERATION completed: All embeddings deleted and recreated",
        type: "force_regenerate",
        warning: "This operation deleted ALL existing embeddings and recreated them"
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/force-regenerate-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error force regenerating embeddings:', error);
      throw error;
    }
  }

  // Search movies using AI
  static async searchMovies(query: string): Promise<AISearchResult> {
    if (!this.isServiceAvailable()) {
      // Mock response for development
      return {
        status: "success",
        query: query,
        movies: [
          {
            id: "1",
            title: "Sample Movie 1",
            similarity: 0.95,
            posterUrl: "https://via.placeholder.com/300x450",
            releaseYear: 2023
          },
          {
            id: "2", 
            title: "Sample Movie 2",
            similarity: 0.87,
            posterUrl: "https://via.placeholder.com/300x450",
            releaseYear: 2022
          }
        ],
        count: 2,
        message: "Found 2 similar movies"
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }
}