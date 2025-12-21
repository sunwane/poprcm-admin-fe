// Service for auto importing and updating movies and CRUD operations

import { Movie } from '@/types/Movies';
import { mockMovies } from '@/mocksData/mockMovies';
import { mockActors } from '@/mocksData/mockActors';
import { mockMovieActors } from '@/mocksData/mockMovieActors';

class MovieImportService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
  private static movies: Movie[] = [...mockMovies];
  private static isDataLoaded = false;

  async autoImportMovies(slug: string, count: number = 10): Promise<any> {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/movies/add-new?slug=${slug}&moviesToAdd=${count}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (!response.ok) {
        throw new Error('Thêm phim tự động thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Auto import movies error:', error);
      throw error;
    }
  }

  async updateMovies(slug: string, maxPages: number = 5): Promise<any> {
    try {
      console.log('Starting auto update movies with slug:', slug, 'and maxPages:', maxPages);

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/movies/update-existing?slug=${slug}&maxPages=${maxPages}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (!response.ok) {
        throw new Error('Cập nhật phim tự động thất bại');
      }

      return await response.json();
    } catch (error) {
      console.error('Auto update movies error:', error);
      throw error;
    }
  }

  // Helper method to populate movie actors for mock data
  static populateMovieActors(movieId: string) {
    return mockMovieActors
      .filter(ma => ma.movieId === movieId)
      .map(ma => ({
        ...ma,
        movie: this.movies.find(m => m.id === ma.movieId),
        actor: mockActors.find(a => a.id === ma.actorId)
      }));
  }

  // Helper method to generate slug
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Check service availability
  private isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Prepare movie data for CREATE (matching MovieCreateRequest from backend)
  private prepareMovieDataForCreate(movieData: Partial<Movie>) {
    console.log('🔍 prepareMovieDataForCreate called with:', movieData);
    console.log('🔍 movieData.actors:', movieData.actors);
    console.log('🔍 movieData.genres:', movieData.genres);
    console.log('🔍 movieData.country:', movieData.country);
    console.log('🔍 movieData.director (input):', movieData.director, 'Type:', typeof movieData.director);
    
    const result = {
      title: movieData.title,
      slug: movieData.slug || (movieData.title ? MovieImportService.generateSlug(movieData.title) : undefined),
      originName: movieData.originalName || movieData.title,
      description: movieData.description,
      releaseYear: movieData.releaseYear,
      type: movieData.type,
      duration: movieData.duration,
      thumbUrl: movieData.thumbnailUrl,
      posterUrl: movieData.posterUrl,
      trailerUrl: movieData.trailerUrl,
      totalEpisodes: movieData.totalEpisodes?.toString(),
      director: (() => {
        // Xử lý director để luôn trả về array
        if (Array.isArray(movieData.director)) {
          return movieData.director.filter(Boolean); // Loại bỏ các giá trị falsy
        }
        
        if (typeof movieData.director === 'string' && movieData.director.trim()) {
          // Tách chuỗi theo dấu phẩy và làm sạch
          return movieData.director
            .split(',')
            .map(d => d.trim())
            .filter(Boolean); // Loại bỏ các string rỗng
        }
        
        return []; // Trả về array rỗng nếu không có director
      })(),
      status: movieData.status,
      lang: movieData.lang,
      tmdbScore: movieData.tmdbScore,
      imdbScore: movieData.imdbScore,
      genreIds: movieData.genres?.map(g => typeof g.id === 'string' ? g.id : String(g.id)).filter(Boolean) || [],
      countryIds: movieData.country?.map(c => typeof c.id === 'string' ? c.id : String(c.id)).filter(Boolean) || [],
      actorIds: movieData.actors?.map(a => {
        console.log('🔍 Processing actor for CREATE:', a);
        
        // Backend expects TMDB IDs (integers) not database IDs (strings)
        let tmdbId = null;
        
        if (a.actor?.tmdbId) {
          // TMDB ID from nested actor object
          tmdbId = typeof a.actor.tmdbId === 'string' ? parseInt(a.actor.tmdbId) : a.actor.tmdbId;
          console.log('🔍 Using actor.tmdbId:', a.actor.tmdbId, '-> parsed:', tmdbId);
        } else if (a.actorId && !isNaN(parseInt(a.actorId))) {
          // Fallback: if actorId is numeric, treat as TMDB ID
          tmdbId = parseInt(a.actorId);
          console.log('🔍 Fallback: treating actorId as tmdbId:', a.actorId, '-> parsed:', tmdbId);
        } else if (a.actor?.id && !isNaN(parseInt(a.actor.id))) {
          // Fallback: if actor.id is numeric, treat as TMDB ID
          tmdbId = parseInt(a.actor.id);
          console.log('🔍 Fallback: treating actor.id as tmdbId:', a.actor.id, '-> parsed:', tmdbId);
        } else {
          console.warn('⚠️ No valid TMDB ID found for actor:', a);
        }
        
        return tmdbId && !isNaN(tmdbId) ? tmdbId : null;
      }).filter((id): id is number => id !== null) || [],
      episodes: movieData.episodes?.map(ep => ({
        title: ep.title || '',
        episodeNumber: ep.episodeNumber || 0,
        videoUrl: ep.videoUrl || '',
        m3u8Url: ep.m3u8Url || '',
        serverName: ep.serverName || 'Vietsub'
      })).filter(ep => ep.title && ep.videoUrl) || []
    };
    
    // Validation và cleanup data trước khi gửi
    const cleanedResult = {
      ...result,
      title: result.title?.trim() || '',
      originName: result.originName?.trim() || result.title?.trim() || '',
      description: result.description?.trim() || '',
      duration: result.duration?.trim() || '',
      director: Array.isArray(result.director) ? result.director.filter(Boolean) : [],
      totalEpisodes: result.totalEpisodes || (result.type === 'single' ? '1' : undefined),
      tmdbScore: result.tmdbScore || 0,
      imdbScore: result.imdbScore || 0,
      genreIds: Array.isArray(result.genreIds) ? result.genreIds.filter(id => id && typeof id === 'string') : [],
      countryIds: Array.isArray(result.countryIds) ? result.countryIds.filter(id => id && typeof id === 'string') : [],
      actorIds: Array.isArray(result.actorIds) ? result.actorIds.filter(id => typeof id === 'number' && !isNaN(id)) : [],
      episodes: Array.isArray(result.episodes) ? result.episodes.filter(ep => ep && ep.title && ep.videoUrl) : []
    };
    
    console.log('✅ prepareMovieDataForCreate final result:', result);
    console.log('🔍 Final director (CREATE):', result.director, 'Type:', typeof result.director, 'IsArray:', Array.isArray(result.director));
    console.log('🧹 prepareMovieDataForCreate cleaned result:', cleanedResult);
    
    // Cảnh báo về các trường có thể gây lỗi backend
    if (cleanedResult.genreIds.length === 0) {
      console.warn('⚠️ No genreIds provided - this might cause backend issues');
    }
    
    if (cleanedResult.countryIds.length === 0) {
      console.warn('⚠️ No countryIds provided - this might cause backend issues');
    }
    
    if (cleanedResult.actorIds.length === 0) {
      console.warn('⚠️ No TMDB actor IDs provided - this might be expected for some movies');
    } else {
      console.log('✅ Found', cleanedResult.actorIds.length, 'TMDB actor IDs:', cleanedResult.actorIds);
    }
    
    if (!cleanedResult.director || cleanedResult.director.length === 0) {
      console.warn('⚠️ No director provided - this might cause backend issues');
    }
    
    // Kiểm tra required fields và validate data
    if (!cleanedResult.title) {
      throw new Error('Title is required');
    }
    
    if (!cleanedResult.slug) {
      throw new Error('Slug is required');
    }
    
    // Set default values for empty required fields
    if (!cleanedResult.duration) {
      cleanedResult.duration = cleanedResult.type === 'single' ? '120 min' : '45 min/ep';
      console.warn('⚠️ Empty duration - setting default:', cleanedResult.duration);
    }
    
    if (!cleanedResult.director || cleanedResult.director.length === 0) {
      cleanedResult.director = ['Unknown'];
      console.warn('⚠️ Empty director - setting default: ["Unknown"]');
    }
    
    // Set default totalEpisodes if not provided
    if (!cleanedResult.totalEpisodes) {
      cleanedResult.totalEpisodes = cleanedResult.type === 'single' ? '1' : '1';
      console.warn('⚠️ Empty totalEpisodes - setting default:', cleanedResult.totalEpisodes);
    }
    
    // Validate and cap scores at 10
    if (cleanedResult.tmdbScore && cleanedResult.tmdbScore > 10) {
      cleanedResult.tmdbScore = 10;
      console.warn('⚠️ tmdbScore > 10 - capped at 10');
    }
    
    if (cleanedResult.imdbScore && cleanedResult.imdbScore > 10) {
      cleanedResult.imdbScore = 10;
      console.warn('⚠️ imdbScore > 10 - capped at 10');
    }
    
    // Validate numeric fields
    if (cleanedResult.releaseYear && (isNaN(cleanedResult.releaseYear) || cleanedResult.releaseYear < 1800 || cleanedResult.releaseYear > 2030)) {
      console.warn('⚠️ Invalid releaseYear:', cleanedResult.releaseYear);
      cleanedResult.releaseYear = new Date().getFullYear();
    }
  
    console.log('🚀 Final CREATE request data:', cleanedResult);
    return cleanedResult;
  }

  // Prepare movie data for UPDATE (matching MovieUpdateRequest from backend)
  private prepareMovieDataForUpdate(movieData: Partial<Movie>) {
    console.log('🔍 prepareMovieDataForUpdate called with:', movieData);
    console.log('🔍 movieData.actors:', movieData.actors);
    console.log('🔍 movieData.genres:', movieData.genres);
    console.log('🔍 movieData.country:', movieData.country);
    console.log('🔍 movieData.director (UPDATE input):', movieData.director, 'Type:', typeof movieData.director);
    
    const result = {
      title: movieData.title,
      description: movieData.description,
      duration: movieData.duration,
      releaseYear: movieData.releaseYear,
      type: movieData.type,
      thumbUrl: movieData.thumbnailUrl,
      posterUrl: movieData.posterUrl,
      trailerUrl: movieData.trailerUrl,
      director: (() => {
        // Xử lý director để luôn trả về array (UPDATE method)
        if (Array.isArray(movieData.director)) {
          return movieData.director.filter(Boolean); // Loại bỏ các giá trị falsy
        }
        
        if (typeof movieData.director === 'string' && movieData.director.trim()) {
          // Tách chuỗi theo dấu phẩy và làm sạch
          return movieData.director
            .split(',')
            .map(d => d.trim())
            .filter(Boolean); // Loại bỏ các string rỗng
        }
        
        return []; // Trả về array rỗng nếu không có director
      })(),
      status: movieData.status,
      totalEpisodes: movieData.totalEpisodes?.toString(),
      originName: movieData.originalName || movieData.title,
      lang: movieData.lang,
      tmdbScore: movieData.tmdbScore,
      imdbScore: movieData.imdbScore,
      genreIds: movieData.genres?.map(g => typeof g.id === 'string' ? g.id : String(g.id)).filter(Boolean) || [],
      countryIds: movieData.country?.map(c => typeof c.id === 'string' ? c.id : String(c.id)).filter(Boolean) || [],
      actorIds: movieData.actors?.map(a => {
        console.log('🔍 Processing actor for UPDATE:', a);
        
        // Backend expects TMDB IDs (integers) not database IDs (strings)
        let tmdbId = null;
        
        if (a.actor?.tmdbId) {
          // TMDB ID from nested actor object
          tmdbId = typeof a.actor.tmdbId === 'string' ? parseInt(a.actor.tmdbId) : a.actor.tmdbId;
          console.log('🔍 Using actor.tmdbId:', a.actor.tmdbId, '-> parsed:', tmdbId);
        } else if (a.actorId && !isNaN(parseInt(a.actorId))) {
          // Fallback: if actorId is numeric, treat as TMDB ID
          tmdbId = parseInt(a.actorId);
          console.log('🔍 Fallback: treating actorId as tmdbId:', a.actorId, '-> parsed:', tmdbId);
        } else if (a.actor?.id && !isNaN(parseInt(a.actor.id))) {
          // Fallback: if actor.id is numeric, treat as TMDB ID
          tmdbId = parseInt(a.actor.id);
          console.log('🔍 Fallback: treating actor.id as tmdbId:', a.actor.id, '-> parsed:', tmdbId);
        } else {
          console.warn('⚠️ No valid TMDB ID found for actor:', a);
        }
        
        return tmdbId && !isNaN(tmdbId) ? tmdbId : null;
      }).filter((id): id is number => id !== null) || [],
      episodes: movieData.episodes?.map(ep => ({
        title: ep.title || '',
        episodeNumber: ep.episodeNumber || 0,
        videoUrl: ep.videoUrl || '',
        m3u8Url: ep.m3u8Url || '',
        serverName: ep.serverName || 'Vietsub'
      })).filter(ep => ep.title && ep.videoUrl) || []
    };
    
    // Validation và cleanup data trước khi gửi
    const cleanedResult = {
      ...result,
      title: result.title?.trim() || undefined,
      originName: result.originName?.trim() || undefined,
      description: result.description?.trim() || undefined,
      duration: result.duration?.trim() || undefined,
      director: Array.isArray(result.director) ? result.director.filter(Boolean) : [],
      genreIds: Array.isArray(result.genreIds) ? result.genreIds.filter(id => id && typeof id === 'string') : [],
      countryIds: Array.isArray(result.countryIds) ? result.countryIds.filter(id => id && typeof id === 'string') : [],
      actorIds: Array.isArray(result.actorIds) ? result.actorIds.filter(id => typeof id === 'number' && !isNaN(id)) : [],
      episodes: Array.isArray(result.episodes) ? result.episodes : []
    };
    
    // Validate and cap scores at 10 for UPDATE too
    if (cleanedResult.tmdbScore && cleanedResult.tmdbScore > 10) {
      cleanedResult.tmdbScore = 10;
      console.warn('⚠️ UPDATE - tmdbScore > 10 - capped at 10');
    }
    
    if (cleanedResult.imdbScore && cleanedResult.imdbScore > 10) {
      cleanedResult.imdbScore = 10;
      console.warn('⚠️ UPDATE - imdbScore > 10 - capped at 10');
    }
    
    console.log('✅ prepareMovieDataForUpdate final result:', result);
    console.log('🔍 Final director (UPDATE):', result.director, 'Type:', typeof result.director, 'IsArray:', Array.isArray(result.director));
    console.log('🧹 prepareMovieDataForUpdate cleaned result:', cleanedResult);
    
    return cleanedResult;
  }



  // Convert API response to Movie format
  private apiResponseToMovie(apiData: any): Movie {
    return {
      id: apiData.id,
      title: apiData.title,
      originalName: apiData.originName || apiData.title,
      description: apiData.description || '',
      releaseYear: apiData.releaseYear,
      type: apiData.type,
      duration: apiData.duration || '',
      posterUrl: apiData.posterUrl,
      thumbnailUrl: apiData.thumbUrl,
      trailerUrl: apiData.trailerUrl,
      totalEpisodes: apiData.totalEpisodes ? parseInt(apiData.totalEpisodes) : undefined,
      currentEpisodeCount: apiData.currentEpisodeCount,
      director: Array.isArray(apiData.director) ? apiData.director.join(', ') : apiData.director,
      status: apiData.status,
      createdAt: new Date(apiData.createdAt),
      modifiedAt: new Date(apiData.modifiedAt),
      view: apiData.views || 0,
      slug: apiData.slug,
      tmdbScore: apiData.tmdbScore,
      imdbScore: apiData.imdbScore,
      lang: apiData.lang,
      country: apiData.countries?.map((c: any) => ({ id: c.id, name: c.name })) || [],
      actors: apiData.actors?.map((a: any) => ({
        actorId: a.actorId || a.id,
        originName: a.originName,
        characterName: a.characterName,
        profilePath: a.profilePath,
      })) || [],
      genres: apiData.genres?.map((g: any) => ({ id: g.id, genresName: g.genresName })) || [],
      episodes: apiData.episodes?.map((e: any) => ({
        id: e.id,
        title: e.title || '',
        episodeNumber: e.episodeNumber || 0,
        createdAt: new Date(e.createdAt || Date.now()),
        videoUrl: e.videoUrl || '',
        m3u8Url: e.m3u8Url,
        serverName: e.serverName || ''
      })) || []
    };
  }

  // Add new movie
  async addMovie(movieData: Omit<Movie, 'id' | 'createdAt' | 'modifiedAt' | 'slug'>): Promise<Movie> {
    console.log('🔍 addMovie method called with:', movieData);
    if (!this.isServiceAvailable()) {
      // Mock data fallback
      const newMovie: Movie = {
        id: (Math.max(...MovieImportService.movies.map(m => parseInt(m.id)), 0) + 1).toString(),
        ...movieData,
        createdAt: new Date(),
        modifiedAt: new Date(),
        slug: MovieImportService.generateSlug(movieData.title),
        view: 0,
        actors: []
      };
      
      MovieImportService.movies.push(newMovie);
      return newMovie;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const apiData = this.prepareMovieDataForCreate(movieData);

      console.log('🔍 CREATE Movie API Request:', {
        url: `${this.baseURL}/movies/create`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken.substring(0, 10)}...` : 'No token'
        },
        body: apiData
      });

      const response = await fetch(`${this.baseURL}/movies/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(apiData)
      });

      console.log('🔍 CREATE Movie API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CREATE Movie API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('❌ Parsed error data:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('✅ CREATE Movie Raw Response:', responseText);
      
      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse response JSON:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('✅ CREATE Movie Parsed Response:', apiResponse);
      
      if (apiResponse.result) {
        return this.apiResponseToMovie(apiResponse.result);
      }
      
      throw new Error('Invalid API response structure');
      
    } catch (error) {
      console.error('Failed to add movie via API:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add movie');
    }
  }

  // Update movie
  async updateMovie(id: string, movieData: Partial<Movie>): Promise<Movie | null> {
    console.log('🔍 updateMovie method called with:', { id, movieData });
    if (!this.isServiceAvailable()) {
      // Mock data fallback
      const index = MovieImportService.movies.findIndex(movie => movie.id === id);
      if (index === -1) return null;
      
      // Update slug if title changed
      if (movieData.title && movieData.title !== MovieImportService.movies[index].title) {
        movieData.slug = MovieImportService.generateSlug(movieData.title);
      }
      
      MovieImportService.movies[index] = {
        ...MovieImportService.movies[index],
        ...movieData,
        modifiedAt: new Date()
      };
      
      return {
        ...MovieImportService.movies[index],
        actors: MovieImportService.populateMovieActors(id)
      };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const apiData = this.prepareMovieDataForUpdate(movieData);

      console.log('🔍 UPDATE Movie API Request:', {
        url: `${this.baseURL}/movies/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken.substring(0, 10)}...` : 'No token'
        },
        body: apiData
      });

      const response = await fetch(`${this.baseURL}/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(apiData)
      });

      console.log('🔍 UPDATE Movie API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ UPDATE Movie API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('❌ Parsed error data:', errorData);
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('✅ UPDATE Movie Raw Response:', responseText);
      
      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse response JSON:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('✅ UPDATE Movie Parsed Response:', apiResponse);
      
      if (apiResponse.result) {
        return this.apiResponseToMovie(apiResponse.result);
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Failed to update movie via API:', error);
      console.error('🔍 Movie Data being sent:', JSON.stringify(movieData, null, 2));
      throw new Error(error instanceof Error ? error.message : 'Failed to update movie');
    }
  }

  // Delete movie
  async deleteMovie(id: string): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      // Mock data fallback
      const index = MovieImportService.movies.findIndex(movie => movie.id === id);
      if (index === -1) return false;
      
      MovieImportService.movies.splice(index, 1);
      return true;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/movies/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return true;
      
    } catch (error) {
      console.error('Failed to delete movie via API:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete movie');
    }
  }

  // Check if movie title exists
  async checkMovieTitleExists(title: string, excludeId?: string): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      // Mock data fallback
      return MovieImportService.movies.some(movie => 
        movie.title.toLowerCase() === title.toLowerCase() && 
        movie.id !== excludeId
      );
    }

    try {
      // For API, we could implement a specific endpoint or use search
      // For now, return false as we don't have a specific endpoint
      return false;
    } catch (error) {
      console.warn('Failed to check title existence via API:', error);
      return false;
    }
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<Movie | null> {
    // Mock data fallback
    const index = MovieImportService.movies.findIndex(movie => movie.id === id);
    if (index === -1) return null;
    
    MovieImportService.movies[index] = {
      ...MovieImportService.movies[index],
      view: MovieImportService.movies[index].view + 1
    };
    
    return {
      ...MovieImportService.movies[index],
      actors: MovieImportService.populateMovieActors(id)
    };
  }

  // Get movie by ID (helper method)
  async getMovieById(id: string): Promise<Movie | null> {
    if (!this.isServiceAvailable()) {
      const movie = MovieImportService.movies.find(m => m.id === id);
      return movie ? {
        ...movie,
        actors: MovieImportService.populateMovieActors(id)
      } : null;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/movies/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        return this.apiResponseToMovie(apiResponse.result);
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to get movie by ID via API:', error);
      return null;
    }
  }

  // Bulk operations
  async bulkUpdateStatus(movieIds: string[], status: string): Promise<Movie[]> {
    const results: Movie[] = [];
    
    for (const id of movieIds) {
      try {
        const updatedMovie = await this.updateMovie(id, { status });
        if (updatedMovie) {
          results.push(updatedMovie);
        }
      } catch (error) {
        console.error(`Failed to update status for movie ${id}:`, error);
      }
    }
    
    return results;
  }

  // Bulk delete
  async bulkDeleteMovies(movieIds: string[]): Promise<boolean> {
    let successCount = 0;
    
    for (const id of movieIds) {
      try {
        const success = await this.deleteMovie(id);
        if (success) successCount++;
      } catch (error) {
        console.error(`Failed to delete movie ${id}:`, error);
      }
    }
    
    return successCount === movieIds.length;
  }

  // Refresh data
  static refreshData(): void {
    this.isDataLoaded = false;
    this.movies = [...mockMovies];
  }
}

export default new MovieImportService();