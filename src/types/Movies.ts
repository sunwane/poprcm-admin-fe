export interface Movie {
    id: number;
    title: string;
    description: string;
    releaseYear: number;
    genreIds: number[];
    type: string; // e.g., "Movie", "Series"
    duration: number; // in minutes or episodes
    country: string;
    posterUrl?: string;
    thumbnailUrl?: string;
    trailerUrl?: string;
    rating: number;
    director: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    viewCount: number;
    slug: string;
}