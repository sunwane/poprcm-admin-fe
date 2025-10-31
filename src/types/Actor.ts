export interface Actor {
    id: string;
    tmdbId: string;
    originName: string;
    profilePath: string;
    gender: string;
    alsoKnownAs: string[];
}

export type FilterGender = 'all' | 'male' | 'female' | 'unknown';
export type SortBy = 'id' | 'movieCount';