import { Movie, MovieFilterRequest } from '@/types/Movies';
import { mockMovies } from '@/mocksData/mockMovies';
import { mockActors } from '@/mocksData/mockActors';
import { mockMovieActors } from '@/mocksData/mockMovieActors';

export class MoviesService {
  private static movies: Movie[] = [...mockMovies]; // Initialize with mock data
  private static isDataLoaded = false; // Changed to false to force loading
  private static readonly API_BASE_URL = 'http://localhost:8088/api/movies';

  // Kiểm tra service availability từ localStorage
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Helper method to populate movie actors
  private static populateMovieActors(movieId: string) {
    return mockMovieActors
      .filter(ma => ma.movieId === movieId)
      .map(ma => ({
        ...ma,
        movie: this.movies.find(m => m.id === ma.movieId),
        actor: mockActors.find(a => a.id === ma.actorId)
      }));
  }

  // Load data from API or mock with pagination support
  static async loadMoviesData(page: number = 0, size: number = 1000): Promise<Movie[] | void> {
    // For paginated calls, don't use cache
    const isGettingAll = size >= 1000;
    if (isGettingAll && this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.movies = mockMovies.map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
      this.isDataLoaded = true;
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        const mappedMovies = apiResponse.result.content.map((movieResponse: any) => 
          this.mapMovieResponseToMovie(movieResponse)
        );
        
        // For paginated calls, return the data directly without caching
        if (!isGettingAll) {
          return mappedMovies;
        }
        
        // For getting all movies, cache the data
        this.movies = mappedMovies;
        this.isDataLoaded = true;
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load movies from API, using mock data:', error);
    }
  }

  // Optimized mapping function with concise handling of arrays and defaults
  private static mapMovieResponseToMovie(res: any): Movie {
    const { 
      id, title, originName, description = '', releaseYear, type = [], duration = '',
      posterUrl, thumbUrl, trailerUrl, totalEpisodes, currentEpisodeCount, 
      director = [], status = [], createdAt, modifiedAt, views = 0, slug, 
      tmdbScore, imdbScore, lang = [], actors = [], genres = [], 
      countries = [], episodes = []
    } = res;

    return {
      id,
      title,
      originalName: originName || title,
      description,
      releaseYear,
      type: Array.isArray(type) ? type[0] || '' : type,
      duration,
      posterUrl: `https://img.ophim.live/uploads/movies/${thumbUrl}`,
      thumbnailUrl: `https://img.ophim.live/uploads/movies/${posterUrl}`,
      trailerUrl,
      totalEpisodes: totalEpisodes ? parseInt(totalEpisodes) : undefined,
      currentEpisodeCount: currentEpisodeCount || undefined,
      director: Array.isArray(director) ? director.join(', ') : director,
      status: Array.isArray(status) ? status[0] || '' : status,
      createdAt: new Date(createdAt),
      modifiedAt: new Date(modifiedAt),
      view: views,
      slug,
      tmdbScore,
      imdbScore,
      lang: Array.isArray(lang) ? lang[0] || '' : lang,
      country: countries?.map((c: any) => ({ id: c.id, name: c.name })) || [],
      actors: actors?.map((a: any) => ({
        actorId: a.actorId || a.id,
        originName: a.originName,
        characterName: a.characterName,
        profilePath: a.profilePath,
      })) || [],
      genres: genres?.map((g: any) => ({ id: g.id, genresName: g.genresName })) || [],
      episodes: episodes?.map((e: any) => ({
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

  // Get movies with pagination
  static async getMoviesPaginated(page: number = 0, size: number = 10): Promise<Movie[]> {
    const result = await this.loadMoviesData(page, size);
    
    if (result) {
      // Paginated call returned data directly
      return result;
    }
    
    // Fallback to cached data with manual pagination
    if (this.movies.length === 0) {
      await this.loadMoviesData();
    }
    
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedMovies = this.movies.slice(startIndex, endIndex);
    
    // Kiểm tra nếu đang dùng mock data thì populate actors
    if (!this.isServiceAvailable()) {
      return paginatedMovies.map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
    }
    
    return paginatedMovies;
  }

  // Get movies with filter + pagination
  static async getMoviesWithFilter(
    filter?: MovieFilterRequest,
    page: number = 0, 
    size: number = 10
  ): Promise<{ movies: Movie[]; totalElements: number; totalPages: number }> {
    if (!this.isServiceAvailable()) {
      // Fallback to mock data with client-side filtering
      let filteredMovies = [...mockMovies];
      
      if (filter) {
        // Apply filters
        if (filter.types && filter.types.length > 0 && !filter.types.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.types!.some((type: string) => movie.type.toLowerCase().includes(type.toLowerCase()))
          );
        }
        
        if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.statuses!.some((status: string) => movie.status.toLowerCase().includes(status.toLowerCase()))
          );
        }
        
        if (filter.languages && filter.languages.length > 0 && !filter.languages.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.languages!.some((lang: string) => movie.lang.toLowerCase().includes(lang.toLowerCase()))
          );
        }
        
        if (filter.releaseYear) {
          filteredMovies = filteredMovies.filter(movie => movie.releaseYear === filter.releaseYear);
        }
        
        if (filter.genreIds && filter.genreIds.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.genres.some(genre => filter.genreIds!.includes(genre.id))
          );
        }
        
        if (filter.countryIds && filter.countryIds.length > 0) {
          filteredMovies = filteredMovies.filter(movie => 
            movie.country.some(country => filter.countryIds!.includes(country.id))
          );
        }
        
        // Apply sorting
        if (filter.sortBy) {
          filteredMovies.sort((a, b) => {
            let aValue: any = a[filter.sortBy as keyof Movie];
            let bValue: any = b[filter.sortBy as keyof Movie];
            
            // Handle special cases
            if (filter.sortBy === 'views') {
              aValue = a.view;
              bValue = b.view;
            } else if (filter.sortBy === 'updatedAt') {
              aValue = a.modifiedAt;
              bValue = b.modifiedAt;
            }
            
            if (aValue < bValue) return filter.sortDirection === 'desc' ? 1 : -1;
            if (aValue > bValue) return filter.sortDirection === 'desc' ? -1 : 1;
            return 0;
          });
        }
      }
      
      const totalElements = filteredMovies.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex).map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
      
      return { movies: paginatedMovies, totalElements, totalPages };
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      // Prepare filter payload
      const filterPayload = filter ? {
        genreIds: filter.genreIds?.length ? filter.genreIds : undefined,
        countryIds: filter.countryIds?.length ? filter.countryIds : undefined,
        types: filter.types?.length ? filter.types : undefined,
        statuses: filter.statuses?.length ? filter.statuses : undefined,
        releaseYear: filter.releaseYear,
        languages: filter.languages?.length ? filter.languages : undefined,
        sortBy: filter.sortBy,
        sortDirection: filter.sortDirection
      } : {};
      
      const response = await fetch(`${this.API_BASE_URL}/filter?page=${page}&size=${size}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(filterPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Filter API failed: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        const movies = apiResponse.result.content.map(this.mapMovieResponseToMovie);
        const totalElements = apiResponse.result.totalElements || 0;
        const totalPages = apiResponse.result.totalPages || 0;
        
        return { movies, totalElements, totalPages };
      } else {
        throw new Error('Invalid API response structure for filter');
      }
      
    } catch (error) {
      console.warn('Failed to filter movies from API, using fallback:', error);
      
      // Fallback to getMoviesPaginated
      const movies = await this.getMoviesPaginated(page, size);
      const totalElements = await this.getTotalMoviesCount();
      const totalPages = Math.ceil(totalElements / size);
      
      return { movies, totalElements, totalPages };
    }
  }

  // Get total count of movies (for pagination calculation)
  static async getTotalMoviesCount(): Promise<number> {
    if (!this.isServiceAvailable()) {
      return mockMovies.length;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      // Get first page to check total from response metadata
      const response = await fetch(`${this.API_BASE_URL}?page=0&size=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      // Check if API response has total count metadata
      if (apiResponse.result && apiResponse.result.totalElements !== undefined) {
        return apiResponse.result.totalElements;
      } else if (apiResponse.result && apiResponse.result.content) {
        // If no total metadata, get all data to count
        await this.loadMoviesData();
        return this.movies.length;
      }
      
      throw new Error('Cannot determine total count from API response');
      
    } catch (error) {
      console.warn('Failed to get total count from API, using mock data count:', error);
      return mockMovies.length;
    }
  }

  // Get all movies
  static async getAllMovies(): Promise<Movie[]> {
    await this.loadMoviesData();
    
    // Kiểm tra nếu đang dùng API thật
    if (this.isServiceAvailable()) {
      // Trả về movies từ API với actors đã có sẵn
      return [...this.movies];
    } else {
      // Chỉ populate actors khi dùng mock data
      return this.movies.map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
    }
  }

  // Get movie by ID
  static async getMovieById(id: string): Promise<Movie | null> {
    await this.loadMoviesData();
    const movie = this.movies.find(movie => movie.id === id);
    if (!movie) return null;

    // Chỉ populate actors khi dùng mock data
    if (!this.isServiceAvailable()) {
      return {
        ...movie,
        actors: this.populateMovieActors(id)
      };
    }
    
    // API đã có actors sẵn rồi
    return movie;
  }

  // Get movie by slug
  static async getMovieBySlug(slug: string): Promise<Movie | null> {
    this.loadMoviesData();
    const movie = this.movies.find(movie => movie.slug === slug);
    if (!movie) return null;

    // Add actors relationship
    return {
      ...movie,
      actors: this.populateMovieActors(movie.id)
    };
  }

  // Add new movie
  static async addMovie(movieData: Omit<Movie, 'id' | 'createdAt' | 'modifiedAt' | 'slug'>): Promise<Movie> {
    this.loadMoviesData();
    
    const newMovie: Movie = {
      id: (Math.max(...this.movies.map(m => parseInt(m.id)), 0) + 1).toString(),
      ...movieData,
      createdAt: new Date(),
      modifiedAt: new Date(),
      slug: this.generateSlug(movieData.title),
      view: 0,
      actors: []
    };
    
    this.movies.push(newMovie);
    return newMovie;
  }

  // Update movie
  static async updateMovie(id: string, movieData: Partial<Movie>): Promise<Movie | null> {
    this.loadMoviesData();
    
    const index = this.movies.findIndex(movie => movie.id === id);
    if (index === -1) return null;
    
    // Update slug if title changed
    if (movieData.title && movieData.title !== this.movies[index].title) {
      movieData.slug = this.generateSlug(movieData.title);
    }
    
    this.movies[index] = {
      ...this.movies[index],
      ...movieData,
      modifiedAt: new Date()
    };
    
    return {
      ...this.movies[index],
      actors: this.populateMovieActors(id)
    };
  }

  // Delete movie
  static async deleteMovie(id: string): Promise<boolean> {
    this.loadMoviesData();
    
    const index = this.movies.findIndex(movie => movie.id === id);
    if (index === -1) return false;
    
    this.movies.splice(index, 1);
    return true;
  }

  // Check if movie title exists
  static async checkMovieTitleExists(title: string, excludeId?: string): Promise<boolean> {
    this.loadMoviesData();
    
    return this.movies.some(movie => 
      movie.title.toLowerCase() === title.toLowerCase() && 
      movie.id !== excludeId
    );
  }

  // Search movies with API integration
  static async searchMovies(query: string): Promise<Movie[]> {
    if (!query.trim()) {
      return await this.getAllMovies();
    }

    if (!this.isServiceAvailable()) {
      // Mock data - cần populate actors
      await this.loadMoviesData();
      const searchTerm = query.toLowerCase().trim();
      const filteredMovies = this.movies.filter(movie => {
        const directors = Array.isArray(movie.director) ? movie.director.join(' ') : movie.director;
        return (
          movie.title.toLowerCase().includes(searchTerm) ||
          movie.originalName.toLowerCase().includes(searchTerm) ||
          directors.toLowerCase().includes(searchTerm) ||
          movie.description.toLowerCase().includes(searchTerm)
        );
      });

      return filteredMovies.map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
    }

    try {
      // API call - actors đã có sẵn
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        // Trả về trực tiếp, không ghi đè actors
        return apiResponse.result.content.map((movieResponse: any) => 
          this.mapMovieResponseToMovie(movieResponse)
        );
      }
      return [];
      
    } catch (error) {
      // Fallback to mock - cần populate actors
      console.warn('Search API failed, falling back to local search:', error);
      await this.loadMoviesData();
      const searchTerm = query.toLowerCase().trim();
      const filteredMovies = this.movies.filter(movie => {
        const directors = Array.isArray(movie.director) ? movie.director.join(' ') : movie.director;
        return (
          movie.title.toLowerCase().includes(searchTerm) ||
          movie.originalName.toLowerCase().includes(searchTerm) ||
          directors.toLowerCase().includes(searchTerm) ||
          movie.description.toLowerCase().includes(searchTerm)
        );
      });

      return filteredMovies.map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));
    }
  }

  // Search movies with filter + pagination
  static async searchMoviesWithFilter(
    query: string,
    filter?: MovieFilterRequest,
    page: number = 0,
    size: number = 10
  ): Promise<{ movies: Movie[]; totalElements: number; totalPages: number }> {
    if (!query.trim()) {
      // If no search query, use regular filter
      return await this.getMoviesWithFilter(filter, page, size);
    }

    if (!this.isServiceAvailable()) {
      // Fallback to client-side search + filter
      await this.loadMoviesData();
      const searchTerm = query.toLowerCase().trim();
      
      // First apply search
      let filteredMovies = this.movies.filter(movie => {
        const directors = Array.isArray(movie.director) ? movie.director.join(' ') : movie.director;
        return (
          movie.title.toLowerCase().includes(searchTerm) ||
          movie.originalName.toLowerCase().includes(searchTerm) ||
          directors.toLowerCase().includes(searchTerm) ||
          movie.description.toLowerCase().includes(searchTerm)
        );
      });

      // Then apply filters if provided
      if (filter) {
        if (filter.types && filter.types.length > 0 && !filter.types.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.types!.some((type: string) => movie.type.toLowerCase().includes(type.toLowerCase()))
          );
        }
        
        if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.statuses!.some((status: string) => movie.status.toLowerCase().includes(status.toLowerCase()))
          );
        }
        
        if (filter.languages && filter.languages.length > 0 && !filter.languages.includes('all')) {
          filteredMovies = filteredMovies.filter(movie => 
            filter.languages!.some((lang: string) => movie.lang.toLowerCase().includes(lang.toLowerCase()))
          );
        }
        
        if (filter.releaseYear) {
          filteredMovies = filteredMovies.filter(movie => movie.releaseYear === filter.releaseYear);
        }
        
        // Apply sorting
        if (filter.sortBy) {
          filteredMovies.sort((a, b) => {
            let aValue: any = a[filter.sortBy as keyof Movie];
            let bValue: any = b[filter.sortBy as keyof Movie];
            
            if (filter.sortBy === 'views') {
              aValue = a.view;
              bValue = b.view;
            } else if (filter.sortBy === 'updatedAt') {
              aValue = a.modifiedAt;
              bValue = b.modifiedAt;
            }
            
            if (aValue < bValue) return filter.sortDirection === 'desc' ? 1 : -1;
            if (aValue > bValue) return filter.sortDirection === 'desc' ? -1 : 1;
            return 0;
          });
        }
      }

      const totalElements = filteredMovies.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex).map(movie => ({
        ...movie,
        actors: this.populateMovieActors(movie.id)
      }));

      return { movies: paginatedMovies, totalElements, totalPages };
    }

    try {
      // Use search API with filters - combine search with filter endpoint
      const authToken = localStorage.getItem('authToken');
      
      // For now, use search API and apply filters client-side
      // In the future, backend should support search + filter in one endpoint
      const searchResponse = await fetch(`${this.API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!searchResponse.ok) {
        throw new Error(`Search API failed: ${searchResponse.status}`);
      }

      const searchApiResponse = await searchResponse.json();
      
      if (searchApiResponse.result && searchApiResponse.result.content && Array.isArray(searchApiResponse.result.content)) {
        let searchResults = searchApiResponse.result.content.map(this.mapMovieResponseToMovie);
        
        // Apply filters client-side for now
        if (filter) {
          if (filter.types && filter.types.length > 0 && !filter.types.includes('all')) {
            searchResults = searchResults.filter((movie: Movie) => 
              filter.types!.some((type: string) => movie.type.toLowerCase().includes(type.toLowerCase()))
            );
          }
          
          if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes('all')) {
            searchResults = searchResults.filter((movie: Movie) => 
              filter.statuses!.some((status: string) => movie.status.toLowerCase().includes(status.toLowerCase()))
            );
          }
          
          if (filter.languages && filter.languages.length > 0 && !filter.languages.includes('all')) {
            searchResults = searchResults.filter((movie: Movie) => 
              filter.languages!.some((lang: string) => movie.lang.toLowerCase().includes(lang.toLowerCase()))
            );
          }
          
          if (filter.releaseYear) {
            searchResults = searchResults.filter((movie: Movie) => movie.releaseYear === filter.releaseYear);
          }
          
          // Apply sorting
          if (filter.sortBy) {
            searchResults.sort((a: Movie, b: Movie) => {
              let aValue: any = a[filter.sortBy as keyof Movie];
              let bValue: any = b[filter.sortBy as keyof Movie];
              
              if (filter.sortBy === 'views') {
              aValue = a.view;
              bValue = b.view;
              } else if (filter.sortBy === 'updatedAt') {
              aValue = a.modifiedAt;
              bValue = b.modifiedAt;
              }
              
              if (aValue < bValue) return filter.sortDirection === 'desc' ? 1 : -1;
              if (aValue > bValue) return filter.sortDirection === 'desc' ? -1 : 1;
              return 0;
            });
          }
        }

        const totalElements = searchResults.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedMovies = searchResults.slice(startIndex, endIndex);

        return { movies: paginatedMovies, totalElements, totalPages };
      }
      
      return { movies: [], totalElements: 0, totalPages: 0 };
      
    } catch (error) {
      console.warn('Search with filter API failed, using fallback:', error);
      
      // Fallback to regular search
      const searchResults = await this.searchMovies(query);
      const totalElements = searchResults.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedMovies = searchResults.slice(startIndex, endIndex);
      
      return { movies: paginatedMovies, totalElements, totalPages };
    }
  }

  // Filter by release year
  static async filterByYear(year: number): Promise<Movie[]> {
    this.loadMoviesData();
    const filteredMovies = this.movies.filter(movie => movie.releaseYear === year);
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Filter by type (optimized for array handling)
  static async filterByType(type: string): Promise<Movie[]> {
    this.loadMoviesData();
    if (type === 'all') return this.getAllMovies();
    const filteredMovies = this.movies.filter(movie => 
      Array.isArray(movie.type) ? movie.type.includes(type) : movie.type === type
    );
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Filter by status (optimized for array handling)  
  static async filterByStatus(status: string): Promise<Movie[]> {
    this.loadMoviesData();
    if (status === 'all') return this.getAllMovies();
    const filteredMovies = this.movies.filter(movie => 
      Array.isArray(movie.status) ? movie.status.includes(status) : movie.status === status
    );
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Filter by language (optimized for array handling)
  static async filterByLanguage(lang: string): Promise<Movie[]> {
    this.loadMoviesData();
    if (lang === 'all') return this.getAllMovies();
    const filteredMovies = this.movies.filter(movie => 
      Array.isArray(movie.lang) ? movie.lang.includes(lang) : movie.lang === lang
    );
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get movies by genre
  static async getMoviesByGenre(genreId: string): Promise<Movie[]> {
    this.loadMoviesData();
    const filteredMovies = this.movies.filter(movie => 
      movie.genres.some(genre => genre.id === genreId)
    );
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get movies by country
  static async getMoviesByCountry(countryId: string): Promise<Movie[]> {
    this.loadMoviesData();
    const filteredMovies = this.movies.filter(movie => 
      movie.country.some(country => country.id === countryId)
    );
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get movies by actor
  static async getMoviesByActor(actorId: string): Promise<Movie[]> {
    this.loadMoviesData();
    
    // Get movie IDs that have this actor
    const movieIdsWithActor = mockMovieActors
      .filter(ma => ma.actorId === actorId)
      .map(ma => ma.movieId);
    
    const filteredMovies = this.movies.filter(movie => 
      movieIdsWithActor.includes(movie.id)
    );
    
    return filteredMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get recent movies
  static async getRecentMovies(limit: number = 10): Promise<Movie[]> {
    this.loadMoviesData();
    const sortedMovies = [...this.movies]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return sortedMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get popular movies (by view count)
  static async getPopularMovies(limit: number = 10): Promise<Movie[]> {
    this.loadMoviesData();
    const sortedMovies = [...this.movies]
      .sort((a, b) => b.view - a.view)
      .slice(0, limit);
    
    return sortedMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id)
    }));
  }

  // Get top rated movies
  static async getTopRatedMovies(limit: number = 10): Promise<Movie[]> {
    this.loadMoviesData();

    const sortedMovies = [...this.movies]
      .map(movie => {
        // Tính điểm trung bình của imdbScore và tmdbScore
        const imdbScore = movie.imdbScore || 0; // Nếu không có imdbScore, dùng 0
        const tmdbScore = movie.tmdbScore || 0; // Nếu không có tmdbScore, dùng 0
        const scoreCount = (movie.imdbScore ? 1 : 0) + (movie.tmdbScore ? 1 : 0); // Đếm số điểm hợp lệ
        const averageScore = scoreCount > 0 ? (imdbScore + tmdbScore) / scoreCount : 0; // Tính trung bình
        return {
          ...movie,
          averageScore // Thêm điểm trung bình vào đối tượng phim
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore) // Sắp xếp theo điểm trung bình giảm dần
      .slice(0, limit); // Lấy số lượng phim theo limit

    return sortedMovies.map(movie => ({
      ...movie,
      actors: this.populateMovieActors(movie.id) // Thêm thông tin diễn viên
    }));
  }

  // Get movies statistics
  static async getMoviesStats(): Promise<{
    total: number;
    totalMovies: number;
    totalSeries: number;
    totalAnime: number;
    totalViews: number;
    averageRating: number;
    recentlyAdded: number;
    ongoingSeries: number;
    completedMovies: number;
  }> {
    this.loadMoviesData();
    
    const total = this.movies.length;
    const totalMovies = this.movies.filter(m => 
      Array.isArray(m.type) ? m.type.includes('Movie') : m.type === 'Movie'
    ).length;
    const totalSeries = this.movies.filter(m => 
      Array.isArray(m.type) ? m.type.includes('Series') : m.type === 'Series'
    ).length;
    const totalAnime = this.movies.filter(m => 
      Array.isArray(m.type) ? m.type.includes('hoathinh') : m.type === 'hoathinh'
    ).length;
    const totalViews = this.movies.reduce((sum, movie) => sum + movie.view, 0);
    const averageRating = total > 0 
    ? this.movies.reduce((sum, movie) => {
        const imdbScore = movie.imdbScore || 0; // Nếu không có imdbScore, dùng 0
        const tmdbScore = movie.tmdbScore || 0; // Nếu không có tmdbScore, dùng 0
        const scoreCount = (movie.imdbScore ? 1 : 0) + (movie.tmdbScore ? 1 : 0); // Đếm số điểm hợp lệ
        const averageScore = scoreCount > 0 ? (imdbScore + tmdbScore) / scoreCount : 0; // Tính trung bình nếu có điểm
        return sum + averageScore; // Cộng vào tổng
      }, 0) / total // Chia cho tổng số phim
    : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = this.movies.filter(m => new Date(m.createdAt) >= thirtyDaysAgo).length;
    
    const ongoingSeries = this.movies.filter(m => 
      Array.isArray(m.status) ? m.status.includes('Ongoing') : m.status === 'Ongoing'
    ).length;
    const completedMovies = this.movies.filter(m => 
      Array.isArray(m.status) ? m.status.includes('Completed') : m.status === 'Completed'
    ).length;
    
    return {
      total,
      totalMovies,
      totalSeries,
      totalAnime,
      totalViews,
      averageRating: Math.round(averageRating * 10) / 10,
      recentlyAdded,
      ongoingSeries,
      completedMovies
    };
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<Movie | null> {
    this.loadMoviesData();
    
    const index = this.movies.findIndex(movie => movie.id === id);
    if (index === -1) return null;
    
    this.movies[index].view += 1;
    this.movies[index].modifiedAt = new Date();
    
    return {
      ...this.movies[index],
      actors: this.populateMovieActors(id)
    };
  }

  // Get unique release years
  static async getUniqueReleaseYears(): Promise<number[]> {
    this.loadMoviesData();
    const years = [...new Set(this.movies.map(movie => movie.releaseYear))];
    return years.sort((a, b) => b - a);
  }

  // Get unique types (optimized for array handling)
  static async getUniqueTypes(): Promise<string[]> {
    this.loadMoviesData();
    const allTypes = this.movies.flatMap(movie => 
      Array.isArray(movie.type) ? movie.type : [movie.type]
    );
    return [...new Set(allTypes)].filter(Boolean);
  }

  // Get unique statuses (optimized for array handling)
  static async getUniqueStatuses(): Promise<string[]> {
    this.loadMoviesData();
    const allStatuses = this.movies.flatMap(movie => 
      Array.isArray(movie.status) ? movie.status : [movie.status]
    );
    return [...new Set(allStatuses)].filter(Boolean);
  }

  // Get unique languages (optimized for array handling)  
  static async getUniqueLanguages(): Promise<string[]> {
    this.loadMoviesData();
    const allLanguages = this.movies.flatMap(movie => 
      Array.isArray(movie.lang) ? movie.lang : [movie.lang]
    );
    return [...new Set(allLanguages)].filter(Boolean);
  }

  // Helper method to generate slug
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Refresh data
  static refreshData(): void {
    this.movies = [...mockMovies];
    this.isDataLoaded = true;
  }

  // Bulk operations
  static async bulkUpdateStatus(movieIds: string[], status: string): Promise<Movie[]> {
    this.loadMoviesData();
    
    const updatedMovies: Movie[] = [];
    for (const id of movieIds) {
      const updatedMovie = await this.updateMovie(id, { status });
      if (updatedMovie) {
        updatedMovies.push(updatedMovie);
      }
    }
    
    return updatedMovies;
  }

  // Bulk delete
  static async bulkDeleteMovies(movieIds: string[]): Promise<boolean> {
    this.loadMoviesData();
    
    for (const id of movieIds) {
      await this.deleteMovie(id);
    }
    
    return true;
  }

  // Get actors for a specific movie
  static async getMovieActors(movieId: string) {
    return this.populateMovieActors(movieId);
  }

  // Get all actors
  static async getAllActors() {
    return [...mockActors];
  }

  // Get all movie-actor relationships
  static async getAllMovieActors() {
    return mockMovieActors.map(ma => ({
      ...ma,
      movie: this.movies.find(m => m.id === ma.movieId),
      actor: mockActors.find(a => a.id === ma.actorId)
    }));
  }
}