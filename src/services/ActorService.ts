import { Actor } from '@/types/Actor';
import { mockActors } from '@/mocksData/mockActors';

export class ActorService {
  private static actors: Actor[] = [...mockActors];
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
      tmdbId: actorResponse.tmdbId?.toString(),
      originName: actorResponse.originName,
      profilePath: actorResponse.profilePath,
      gender: this.mapGenderFromNumber(actorResponse.gender),
      alsoKnownAs: [] // API không có field này, để trống
    };
  }

  // Chuyển đổi gender từ số sang string
  private static mapGenderFromNumber(genderNum: number): string {
    switch (genderNum) {
      case 1: return 'female';
      case 2: return 'male';
      default: return 'unknown';
    }
  }

  // Chuyển đổi gender từ string sang số cho API
  private static mapGenderToNumber(gender: string): number {
    switch (gender.toLowerCase()) {
      case 'female': return 1;
      case 'male': return 2;
      default: return 0;
    }
  }

  // Load data from API or mock
  private static async loadActorsData(): Promise<void> {
    if (this.isDataLoaded) return;

    if (!this.isServiceAvailable()) {
      console.info('API not available, using mock data');
      this.actors = [...mockActors];
      this.isDataLoaded = true;
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE_URL}?page=0&size=100`, {
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
        this.actors = apiResponse.result.content.map((actorResponse: any) => 
          this.mapActorResponseToActor(actorResponse)
        );
        this.isDataLoaded = true;
        console.log('Loaded actors from API:', this.actors.length);
      } else {
        throw new Error('Invalid API response structure');
      }
      
    } catch (error) {
      console.warn('Failed to load actors from API, using mock data:', error);
      // Fallback to mock data nếu API fail
      this.actors = [...mockActors];
      this.isDataLoaded = true;
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
        profilePath: null // Tạm thời để null vì BE cần sửa lại để hỗ trợ file upload
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
        
        // Update local data
        await this.loadActorsData();
        this.actors.push(newActor);
        
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
      
      // Chuyển đổi Actor sang ActorUpdateRequest  
      const requestBody = {
        originName: actorData.originName,
        tmdbId: actorData.tmdbId ? parseInt(actorData.tmdbId) : undefined,
        gender: actorData.gender ? this.mapGenderToNumber(actorData.gender) : undefined,
        profilePath: null // Tạm thời để null vì BE cần sửa lại để hỗ trợ file upload
      };

      // Loại bỏ các field undefined
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key as keyof typeof requestBody] === undefined) {
          delete requestBody[key as keyof typeof requestBody];
        }
      });

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
    const male = this.actors.filter(a => a.gender.toLowerCase() === 'male').length;
    const female = this.actors.filter(a => a.gender.toLowerCase() === 'female').length;
    const unknown = this.actors.filter(a => a.gender.toLowerCase() === 'unknown').length;
    
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