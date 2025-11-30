import { Actor } from '@/types/Actor';
import { mockActors } from '@/mocksData/mockActors';

export class ActorService {
  private static actors: Actor[] = [];
  private static isDataLoaded = false;
  private static readonly API_BASE_URL = 'http://localhost:8088/api/actors';

  // Kiểm tra service availability từ localStorage
  private static isServiceAvailable(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('serviceAvailable') !== 'false';
    }
    return true;
  }

  // Chuyển đổi ActorResponse từ API sang Actor interface
  private static mapActorResponseToActor(actorResponse: any): Actor {
    return {
      id: actorResponse.actorId,
      tmdbId: actorResponse.tmdbId?.toString() || '',
      originName: actorResponse.originName,
      profilePath: actorResponse.profilePath,
      gender: actorResponse.genderDisplay ? actorResponse.genderDisplay.toUpperCase() : 'UNKNOWN',
      alsoKnownAs: actorResponse.alsoKnownAs || []
    };
  }

  // Chuyển đổi gender từ string sang số cho API
  private static mapGenderToNumber(gender: string): number {
    switch (gender.toUpperCase()) {
      case 'FEMALE': return 1;
      case 'MALE': return 2;
      default: return 0;
    }
  }

  // Load data from API or mock with pagination support
  private static async loadActorsData(page: number = 0, size: number = 1000): Promise<Actor[] | void> {
    // For paginated calls, don't use cache
    const isGettingAll = size >= 1000;
    if (isGettingAll && this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.actors = [...mockActors];
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
      
      // Handle paginated response
      if (apiResponse.result && apiResponse.result.content && Array.isArray(apiResponse.result.content)) {
        const mappedActors = apiResponse.result.content.map((actorResponse: any) => 
          this.mapActorResponseToActor(actorResponse)
        );
        
        // For paginated calls, return the data directly without caching
        if (!isGettingAll) {
          return mappedActors;
        }
        
        // For getting all actors, cache the data
        this.actors = mappedActors;
        this.isDataLoaded = true;
      } 
      // Handle direct array response (non-paginated)
      else if (apiResponse.result && Array.isArray(apiResponse.result)) {
        const mappedActors = apiResponse.result.map((actorResponse: any) => 
          this.mapActorResponseToActor(actorResponse)
        );
        
        // For paginated calls, return paginated mock data
        if (!isGettingAll) {
          const startIndex = page * size;
          const endIndex = startIndex + size;
          return mappedActors.slice(startIndex, endIndex);
        }
        
        // For getting all actors, cache the data
        this.actors = mappedActors;
        this.isDataLoaded = true;
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load actors from API, using mock data:', error);
    }
  }

  // Get all actors
  static async getAllActors(): Promise<Actor[]> {
    await this.loadActorsData();
    return [...this.actors];
  }

  // Get actor by ID
  static async getActorById(id: string): Promise<Actor | null> {
    if (!this.isServiceAvailable()) {
      await this.loadActorsData();
      const actor = this.actors.find(a => a.id === id);
      return Promise.resolve(actor || null);
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        return this.mapActorResponseToActor(apiResponse.result);
      }
      return null;
      
    } catch (error) {
      console.warn('Failed to get actor from API, using local data:', error);
      await this.loadActorsData();
      const actor = this.actors.find(a => a.id === id);
      return Promise.resolve(actor || null);
    }
  }

  // Get actors with pagination
  public static async getActorsPaginated(page: number, size: number, search?: string, gender?: string): Promise<{
    content: Actor[],
    totalElements: number,
    totalPages: number,
    number: number,
    size: number
  }> {
    try {
      if (!this.isServiceAvailable()) {
        // Mock implementation with search
        await this.loadActorsData();
        let filteredActors = [...this.actors];
        
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          filteredActors = this.actors.filter(actor => 
            actor.originName.toLowerCase().includes(searchLower)
          );
        }

        if (gender && gender !== 'ALL') {
          filteredActors = filteredActors.filter(actor => 
            actor.gender.toUpperCase() === gender.toUpperCase()
          );
        }

        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = filteredActors.slice(startIndex, endIndex);
        
        return {
          content,
          totalElements: filteredActors.length,
          totalPages: Math.ceil(filteredActors.length / size),
          number: page,
          size: size
        };
      }

      // API call with search and gender filter
      const authToken = localStorage.getItem('authToken');
      let url = `${this.API_BASE_URL}?page=${page}&size=${size}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (gender && gender !== 'ALL') {
        url += `&gender=${encodeURIComponent(gender.toUpperCase())}`;
      }

      const response = await fetch(url, {
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
      
      if (apiResponse.result) {
        const mappedActors = apiResponse.result.content?.map((actorResponse: any) => 
          this.mapActorResponseToActor(actorResponse)
        ) || [];

        return {
          content: mappedActors,
          totalElements: apiResponse.result.totalElements || 0,
          totalPages: apiResponse.result.totalPages || 0,
          number: apiResponse.result.number || page,
          size: apiResponse.result.size || size
        };
      }

      throw new Error('Invalid API response structure');
    } catch (error) {
      console.error('Error loading actors with pagination:', error);
      throw error;
    }
  }

  // Get total actors count
  public static async getTotalActorsCount(): Promise<number> {
    try {
      if (!this.isServiceAvailable()) {
        await this.loadActorsData();
        return this.actors.length;
      }

      // Try to get from statistics service first
      const StatisticsService = await import('./StatisticsService');
      const stats = await StatisticsService.StatisticsService.getEntityStats('actors');
      
      if (stats && typeof stats.total === 'number') {
        return stats.total;
      }

      // Fallback to direct API call
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const countResponse = await response.json();
        return countResponse.result || 0;
      }

      // If count endpoint doesn't exist, get first page to get total
      const firstPageResponse = await fetch(`${this.API_BASE_URL}?page=0&size=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (firstPageResponse.ok) {
        const pageData = await firstPageResponse.json();
        return pageData.result?.totalElements || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error getting total actors count:', error);
      return 0;
    }
  }

  // Add new actor
  static async addActor(actor: Omit<Actor, 'id'>): Promise<Actor> {
    if (!this.isServiceAvailable()) {
      await this.loadActorsData();
      const newActor: Actor = {
        ...actor,
        id: (Math.max(...this.actors.map(a => Number(a.id)), 0) + 1).toString(),
      };
      this.actors.push(newActor);
      return Promise.resolve(newActor);
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      // Chuyển đổi Actor sang ActorCreateRequest
      const requestBody = {
        originName: actor.originName,
        tmdbId: actor.tmdbId ? parseInt(actor.tmdbId) : 0,
        gender: this.mapGenderToNumber(actor.gender),
        alsoKnownAs: actor.alsoKnownAs || []
      };

      const response = await fetch(`${this.API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        const newActor = this.mapActorResponseToActor(apiResponse.result);
        return newActor;
      }
      
      throw new Error('Invalid API response structure');
      
    } catch (error) {
      console.error('Failed to add actor via API:', error);
      // Fallback to local add
      await this.loadActorsData();
      const newActor: Actor = {
        ...actor,
        id: (Math.max(...this.actors.map(a => Number(a.id)), 0) + 1).toString(),
      };
      this.actors.push(newActor);
      return Promise.resolve(newActor);
    }
  }

  // Update actor
  static async updateActor(id: string, actorData: Partial<Actor>): Promise<Actor | null> {
    if (!this.isServiceAvailable()) {
      await this.loadActorsData();
      const index = this.actors.findIndex(a => a.id === id);
      if (index === -1) return Promise.resolve(null);
      
      this.actors[index] = { ...this.actors[index], ...actorData };
      return Promise.resolve(this.actors[index]);
    }

    try {
      const authToken = localStorage.getItem('authToken');
      
      // Chuyển đổi Actor sang ActorUpdateRequest - chỉ gửi các field có giá trị
      const requestBody: any = {};
      
      if (actorData.originName !== undefined && actorData.originName.trim()) {
        requestBody.originName = actorData.originName.trim();
      }
      if (actorData.tmdbId !== undefined && actorData.tmdbId.trim()) {
        requestBody.tmdbId = parseInt(actorData.tmdbId);
      }
      if (actorData.gender !== undefined) {
        requestBody.gender = this.mapGenderToNumber(actorData.gender);
      }
      if (actorData.alsoKnownAs !== undefined) {
        requestBody.alsoKnownAs = actorData.alsoKnownAs;
      }

      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        const updatedActor = this.mapActorResponseToActor(apiResponse.result);
        
        // Update local data
        await this.loadActorsData();
        const index = this.actors.findIndex(a => a.id === id);
        if (index !== -1) {
          this.actors[index] = updatedActor;
        }
        
        return updatedActor;
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to update actor via API:', error);
      // Fallback to local update
      await this.loadActorsData();
      const index = this.actors.findIndex(a => a.id === id);
      if (index === -1) return Promise.resolve(null);
      
      this.actors[index] = { ...this.actors[index], ...actorData };
      return Promise.resolve(this.actors[index]);
    }
  }

  // Delete actor
  static async deleteActor(id: string): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      await this.loadActorsData();
      const index = this.actors.findIndex(a => a.id === id);
      if (index === -1) return Promise.resolve(false);
      
      this.actors.splice(index, 1);
      return Promise.resolve(true);
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local data
      await this.loadActorsData();
      const index = this.actors.findIndex(a => a.id === id);
      if (index !== -1) {
        this.actors.splice(index, 1);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to delete actor via API:', error);
      // Fallback to local delete
      await this.loadActorsData();
      const index = this.actors.findIndex(a => a.id === id);
      if (index === -1) return Promise.resolve(false);
      
      this.actors.splice(index, 1);
      return Promise.resolve(true);
    }
  }

  // Upload actor avatar
  static async uploadActorAvatar(id: string, file: File): Promise<Actor | null> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, cannot upload avatar');
      return null;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.API_BASE_URL}/${id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        const updatedActor = this.mapActorResponseToActor(apiResponse.result);
        return updatedActor;
      }
      
      throw new Error('Invalid API response structure');
      
    } catch (error) {
      console.error('Failed to upload actor avatar:', error);
      throw error;
    }
  }

  // Delete actor avatar
  static async deleteActorAvatar(id: string): Promise<Actor | null> {
    if (!this.isServiceAvailable()) {
      console.info('API not available, cannot delete avatar');
      return null;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}/${id}/avatar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.result) {
        const updatedActor = this.mapActorResponseToActor(apiResponse.result);
        return updatedActor;
      }
      
      throw new Error('Invalid API response structure');
      
    } catch (error) {
      console.error('Failed to delete actor avatar:', error);
      throw error;
    }
  }

  // Search actors
  static async searchActors(query: string): Promise<Actor[]> {
    if (!query.trim()) {
      return await this.getAllActors();
    }

    if (!this.isServiceAvailable()) {
      console.info('API not available, using local search');
      await this.loadActorsData();
      const searchTerm = query.toLowerCase().trim();
      const filteredActors = this.actors.filter(actor => 
        actor.originName.toLowerCase().includes(searchTerm) ||
        (actor.tmdbId ?? '').includes(searchTerm) ||
        (actor.alsoKnownAs ?? []).some(alias => alias.toLowerCase().includes(searchTerm))
      );
      return Promise.resolve(filteredActors);
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}?search=${encodeURIComponent(query)}&page=0&size=100`, {
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
        return apiResponse.result.content.map((actorResponse: any) => 
          this.mapActorResponseToActor(actorResponse)
        );
      }
      return [];
      
    } catch (error) {
      console.warn('Search API failed, falling back to local search:', error);
      // Fallback to local search
      await this.loadActorsData();
      const searchTerm = query.toLowerCase().trim();
      const filteredActors = this.actors.filter(actor => 
        actor.originName.toLowerCase().includes(searchTerm) ||
        (actor.tmdbId ?? '').includes(searchTerm) ||
        (actor.alsoKnownAs ?? []).some(alias => alias.toLowerCase().includes(searchTerm))
      );
      return Promise.resolve(filteredActors);
    }
  }

  // Check if actor name exists
  static async checkActorNameExists(name: string, excludeId?: string): Promise<boolean> {
    await this.loadActorsData();
    
    return Promise.resolve(
      this.actors.some(actor => 
        actor.originName.toLowerCase() === name.toLowerCase() && 
        actor.id !== excludeId
      )
    );
  }

  // Check if TMDB ID exists
  static async checkTmdbIdExists(tmdbId: string, excludeId?: string): Promise<boolean> {
    await this.loadActorsData();
    
    return Promise.resolve(
      this.actors.some(actor => 
        actor.tmdbId === tmdbId && 
        actor.id !== excludeId
      )
    );
  }

  // Get movie count for actor (mock function)
  static async getMovieCountByActor(actorId: string): Promise<number> {
    // TODO: Replace with real API call to get actual movie count
    // return fetch(`/api/actors/${actorId}/movies/count`)
    //   .then(response => response.json())
    //   .then(data => data.count);
    
    // Fake random movie count based on actor ID for consistency
    const seed = parseInt(actorId) || 1;
    return Promise.resolve(Math.abs(Math.floor((Math.sin(seed * 3) * 10000) % 50) + Math.floor(Math.random() * 20)));
  }

  // Get actors stats
  static async getActorsStats(): Promise<{
    total: number;
    male: number;
    female: number;
    unknown: number;
    totalMovies: number;
    avgMoviesPerActor: number;
  }> {
    await this.loadActorsData();
    
    const total = this.actors.length;
    const male = this.actors.filter(a => a.gender.toUpperCase() === 'MALE').length;
    const female = this.actors.filter(a => a.gender.toUpperCase() === 'FEMALE').length;
    const unknown = this.actors.filter(a => a.gender.toUpperCase() === 'UNKNOWN').length;
    
    // Calculate total movies (mock)
    const totalMovies = Math.floor(Math.random() * 500) + 200;
    const avgMoviesPerActor = total > 0 ? Math.round(totalMovies / total) : 0;
    
    return Promise.resolve({
      total,
      male,
      female,
      unknown,
      totalMovies,
      avgMoviesPerActor
    });
  }

  // Refresh data - Force reload from API
  static refreshData(): void {
    this.isDataLoaded = false;
  }

  // Reset to mock data
  static resetToMockData(): void {
    this.actors = [...mockActors];
    this.isDataLoaded = true;
  }
}