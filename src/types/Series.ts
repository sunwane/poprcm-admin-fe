import { Movie } from "./Movies";

export interface SeriesMovie {
    id: string;
    movieId: number;
    seriesId: string;
    seasonNumber: number;
    movie?: Movie; // Optional populated movie data
}

export interface Series {
    id: string;
    name: string;
    description: string;
    status: string;
    releaseYear: string;
    numberOfSeasons: number;
    posterUrl: string;
    seriesMovies?: SeriesMovie[]; // Relationship data
}