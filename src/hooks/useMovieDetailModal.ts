import { useState } from 'react';
import { Movie } from '@/types/Movies';

interface MovieDetailModalState {
  isOpen: boolean;
  selectedMovie: Movie | null;
}

export const useMovieDetailModal = () => {
  const [state, setState] = useState<MovieDetailModalState>({
    isOpen: false,
    selectedMovie: null
  });

  const openModal = (movie: Movie) => {
    setState({
      isOpen: true,
      selectedMovie: movie
    });
  };

  const closeModal = () => {
    setState({
      isOpen: false,
      selectedMovie: null
    });
  };

  return {
    isOpen: state.isOpen,
    selectedMovie: state.selectedMovie,
    openModal,
    closeModal
  };
};