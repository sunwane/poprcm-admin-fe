import { MovieActor } from "./Actor";
import { Country } from "./Country";
import { Genre } from "./Genres";

export interface Episode {
    id: number;
    title: string;
    episodeNumber: number;
    createdAt: Date;
    videoUrl: string;
    m3u8Url?: string;
    serverName: string; // e.g., "Vietsub", "ThuyetMinh"
}

export interface Movie {
    id: string;
    title: string;
    originalName: string;
    description: string;
    releaseYear: number;
    type: string;
    duration: string; // e.g., "120 min", "45 min/ep"
    posterUrl?: string;
    thumbnailUrl?: string;
    trailerUrl?: string;
    totalEpisodes?: number;
    //rating: number;
    director: string | string[]; // Support both single string and array
    status: string;
    createdAt: Date;
    modifiedAt: Date;
    view: number;
    slug: string;
    tmdbScore?: number;
    imdbScore?: number;
    lang: string;
    country: Country[];
    actors: MovieActor[];
    genres: Genre[];
    episodes?: Episode[];
}