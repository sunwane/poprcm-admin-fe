import { Movie } from "./Movies";

export interface Actor {
    id: string;
    tmdbId?: string;
    originName: string;
    profilePath?: string;
    gender: string;
    alsoKnownAs?: string[];
}

export interface MovieActor {
    id: string;
    movieId?: string;
    actorId?: string;
    characterName: string;
    profilePath?: string;
    originName?: string;
    movie?: Movie; // Optional for avoiding circular deps
    actor?: Actor; // Optional for avoiding circular deps
}

export type FilterGender = 'ALL' | 'MALE' | 'FEMALE' | 'UNKNOWN';
export type SortBy = 'id' | 'movieCount';