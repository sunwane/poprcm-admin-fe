/**
 * Test component để kiểm tra real stats integration
 */
import React from 'react';
import { useCountries } from '@/hooks/useCountries';
import { useGenres } from '@/hooks/useGenres';

export const StatsTestComponent: React.FC = () => {
  const { stats: countryStats, loading: countryLoading } = useCountries();
  const { stats: genreStats, loading: genreLoading } = useGenres();

  if (countryLoading || genreLoading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Country Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Total Countries: {countryStats.total}</p>
            <p>Countries with Movies: {countryStats.countriesWithMovies}</p>
            <p>Average Movies per Country: {countryStats.avgMoviesPerCountry}</p>
            {countryStats.totalMovies && (
              <p>Total Movies: {countryStats.totalMovies}</p>
            )}
          </div>
          <div>
            <p className={`font-semibold ${countryStats.fromApi ? 'text-green-600' : 'text-red-600'}`}>
              Data Source: {countryStats.fromApi ? 'Real API' : 'Mock Data'}
            </p>
            <p>Filtered Count: {countryStats.filteredCount}</p>
            <p>Current Page: {countryStats.currentPageCount} items</p>
            <p>Total Pages: {countryStats.totalPages}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Genre Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Total Genres: {genreStats.total}</p>
            <p>Genres with Movies: {genreStats.genresWithMovies}</p>
            <p>Genres without Movies: {genreStats.genresWithoutMovies}</p>
            <p>Average Movies per Genre: {genreStats.avgMoviesPerGenre}</p>
            {genreStats.totalMovies && (
              <p>Total Movies: {genreStats.totalMovies}</p>
            )}
          </div>
          <div>
            <p className={`font-semibold ${genreStats.fromApi ? 'text-green-600' : 'text-red-600'}`}>
              Data Source: {genreStats.fromApi ? 'Real API' : 'Mock Data'}
            </p>
            <p>Filtered Count: {genreStats.filteredCount}</p>
            <p>Current Page: {genreStats.currentPageCount} items</p>
            <p>Total Pages: {genreStats.totalPages}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">Integration Status</h3>
        <p className="text-blue-700">
          {countryStats.fromApi && genreStats.fromApi 
            ? '✅ Both Country and Genre stats are using real data from StatisticsService!'
            : countryStats.fromApi || genreStats.fromApi
              ? '⚠️ Partially integrated - some stats using real data, some using mock'
              : '❌ Using mock data - StatisticsService not available'
          }
        </p>
      </div>
    </div>
  );
};