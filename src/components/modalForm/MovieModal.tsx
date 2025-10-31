import React, { useState, useEffect } from 'react';
import { Movie } from '@/types/Movies';
import { Genre } from '@/types/Genres';
import { Country } from '@/types/Country';
import { Actor } from '@/types/Actor';
import { 
  validateMovieTitle, 
  validateOriginalName, 
  validateReleaseYear,
  validateRating,
  validateTotalEpisodes,
  formatMovieTitle,
  getMovieTypes,
  getMovieStatuses,
  getMovieLanguages 
} from '@/utils/movieUtils';
import { MoviesService } from '@/services/MoviesService';
import { GenresService } from '@/services/GenresService';
import { CountryService } from '@/services/CountryService';
import { ActorService } from '@/services/ActorService';
import GradientButton from '@/components/ui/GradientButton';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';

interface MovieModalProps {
  isOpen: boolean;
  editingMovie: Movie | null;
  onClose: () => void;
  onSave: (movieData: Partial<Movie>) => void;
}

export default function MovieModal({ isOpen, editingMovie, onClose, onSave }: MovieModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    originalName: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    type: 'Movie',
    duration: '',
    posterUrl: '',
    thumbnailUrl: '',
    trailerUrl: '',
    totalEpisodes: undefined as number | undefined,
    rating: 0,
    director: '',
    status: 'Completed',
    lang: 'Vietsub',
    tmdbScore: undefined as number | undefined,
    imdbScore: undefined as number | undefined,
    selectedGenres: [] as string[],
    selectedCountries: [] as string[],
    selectedActors: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available options
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [genresData, countriesData, actorsData] = await Promise.all([
          GenresService.getAllGenres(),
          CountryService.getAllCountries(),
          ActorService.getAllActors()
        ]);
        
        setGenres(genresData);
        setCountries(countriesData);
        setActors(actorsData);
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Reset form when modal opens/closes or editingMovie changes
  useEffect(() => {
    if (isOpen) {
      if (editingMovie) {
        setFormData({
          title: editingMovie.title,
          originalName: editingMovie.originalName,
          description: editingMovie.description,
          releaseYear: editingMovie.releaseYear,
          type: editingMovie.type,
          duration: editingMovie.duration,
          posterUrl: editingMovie.posterUrl || '',
          thumbnailUrl: editingMovie.thumbnailUrl || '',
          trailerUrl: editingMovie.trailerUrl || '',
          totalEpisodes: editingMovie.totalEpisodes,
          rating: editingMovie.rating,
          director: editingMovie.director,
          status: editingMovie.status,
          lang: editingMovie.lang,
          tmdbScore: editingMovie.tmdbScore,
          imdbScore: editingMovie.imdbScore,
          selectedGenres: editingMovie.genres.map(g => g.id),
          selectedCountries: editingMovie.country.map(c => c.id),
          selectedActors: editingMovie.actors.map(ma => ma.actor?.id ?? ''),
        });
      } else {
        setFormData({
          title: '',
          originalName: '',
          description: '',
          releaseYear: new Date().getFullYear(),
          type: 'Movie',
          duration: '',
          posterUrl: '',
          thumbnailUrl: '',
          trailerUrl: '',
          totalEpisodes: undefined,
          rating: 0,
          director: '',
          status: 'Completed',
          lang: 'Vietsub',
          tmdbScore: undefined,
          imdbScore: undefined,
          selectedGenres: [],
          selectedCountries: [],
          selectedActors: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, editingMovie]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [name]: values }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validate title
    const titleValidation = validateMovieTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error || 'Tên phim không hợp lệ';
    } else {
      // Check if title already exists
      const exists = await MoviesService.checkMovieTitleExists(
        formData.title.trim(),
        editingMovie?.id
      );
      if (exists) {
        newErrors.title = 'Tên phim đã tồn tại';
      }
    }

    // Validate original name
    const originalNameValidation = validateOriginalName(formData.originalName);
    if (!originalNameValidation.isValid) {
      newErrors.originalName = originalNameValidation.error || 'Tên gốc không hợp lệ';
    }

    // Validate release year
    const yearValidation = validateReleaseYear(formData.releaseYear);
    if (!yearValidation.isValid) {
      newErrors.releaseYear = yearValidation.error || 'Năm phát hành không hợp lệ';
    }

    // Validate rating
    const ratingValidation = validateRating(formData.rating);
    if (!ratingValidation.isValid) {
      newErrors.rating = ratingValidation.error || 'Đánh giá không hợp lệ';
    }

    // Validate total episodes for series
    const episodesValidation = validateTotalEpisodes(formData.totalEpisodes, formData.type);
    if (!episodesValidation.isValid) {
      newErrors.totalEpisodes = episodesValidation.error || 'Số tập không hợp lệ';
    }

    // Validate required fields
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Đạo diễn không được để trống';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Thời lượng không được để trống';
    }

    // Validate selections
    if (formData.selectedGenres.length === 0) {
      newErrors.selectedGenres = 'Phải chọn ít nhất 1 thể loại';
    }

    if (formData.selectedCountries.length === 0) {
      newErrors.selectedCountries = 'Phải chọn ít nhất 1 quốc gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Prepare movie data
      const selectedGenreObjects = genres.filter(g => formData.selectedGenres.includes(g.id));
      const selectedCountryObjects = countries.filter(c => formData.selectedCountries.includes(c.id));
      const selectedActorObjects = actors.filter(a => formData.selectedActors.includes(a.id));

      const movieData = {
        title: formatMovieTitle(formData.title.trim()),
        originalName: formatMovieTitle(formData.originalName.trim()),
        description: formData.description.trim(),
        releaseYear: formData.releaseYear,
        type: formData.type,
        duration: formData.duration.trim(),
        posterUrl: formData.posterUrl.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        trailerUrl: formData.trailerUrl.trim() || undefined,
        totalEpisodes: formData.totalEpisodes,
        rating: formData.rating,
        director: formData.director.trim(),
        status: formData.status,
        lang: formData.lang,
        tmdbScore: formData.tmdbScore,
        imdbScore: formData.imdbScore,
        genres: selectedGenreObjects,
        country: selectedCountryObjects,
        actors: selectedActorObjects.map(actor => ({
          id: `${Date.now()}-${actor.id}`, // Temporary ID
          actorId: actor.id,
          movieId: editingMovie?.id || 0,
          actor,
          characterName: 'Vai diễn', // Default character name
        })),
        episodes: editingMovie?.episodes || []
      };

      onSave(movieData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu phim' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const movieTypes = getMovieTypes();
  const movieStatuses = getMovieStatuses();
  const movieLanguages = getMovieLanguages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-600">
            {editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadingOptions ? (
          <div className="text-center py-8">
            <div className="text-lg">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên phim <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.title}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên gốc <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      name="originalName"
                      value={formData.originalName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.originalName && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.originalName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm phát hành <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      name="releaseYear"
                      type="number"
                      value={formData.releaseYear.toString()}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.releaseYear && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.releaseYear}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại phim <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      filter={formData.type}
                      onChange={(value) => handleSelectChange('type', value)}
                      options={movieTypes}
                    />
                    {errors.type && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.type}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời lượng <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="VD: 120 min hoặc 45 min/ep"
                    />
                    {errors.duration && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.duration}
                      </div>
                    )}
                  </div>
                  
                  {(formData.type === 'Series' || formData.type === 'Phim bộ') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tổng số tập
                      </label>
                      <FormInput
                        name="totalEpisodes"
                        type="number"
                        value={formData.totalEpisodes?.toString() || ''}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                      {errors.totalEpisodes && (
                        <div className="mt-2 text-red-600 text-sm">
                          {errors.totalEpisodes}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đạo diễn <span className="text-red-500">*</span>
                    </label>
                    <FormInput
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.director && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.director}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      filter={formData.status}
                      onChange={(value) => handleSelectChange('status', value)}
                      options={movieStatuses}
                    />
                    {errors.status && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.status}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngôn ngữ <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      filter={formData.lang}
                      onChange={(value) => handleSelectChange('lang', value)}
                      options={movieLanguages}
                    />
                    {errors.lang && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.lang}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isSubmitting}
                    placeholder="Nhập mô tả phim..."
                  />
                  {errors.description && (
                    <div className="mt-2 text-red-600 text-sm">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>
              
              {/* URLs and Ratings */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">URLs & Đánh giá</h4>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Poster
                    </label>
                    <FormInput
                      name="posterUrl"
                      value={formData.posterUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="https://..."
                    />
                    {errors.posterUrl && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.posterUrl}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Thumbnail
                    </label>
                    <FormInput
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="https://..."
                    />
                    {errors.thumbnailUrl && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.thumbnailUrl}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Trailer
                    </label>
                    <FormInput
                      name="trailerUrl"
                      value={formData.trailerUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="https://..."
                    />
                    {errors.trailerUrl && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.trailerUrl}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá (0-10)
                    </label>
                    <FormInput
                      name="rating"
                      type="number"
                      value={formData.rating.toString()}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    {errors.rating && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.rating}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm TMDB
                    </label>
                    <FormInput
                      name="tmdbScore"
                      type="number"
                      value={formData.tmdbScore?.toString() || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    {errors.tmdbScore && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.tmdbScore}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm IMDB
                    </label>
                    <FormInput
                      name="imdbScore"
                      type="number"
                      value={formData.imdbScore?.toString() || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    {errors.imdbScore && (
                      <div className="mt-2 text-red-600 text-sm">
                        {errors.imdbScore}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Multi-selects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thể loại <span className="text-red-500">*</span>
                </label>
                <select
                  multiple
                  value={formData.selectedGenres}
                  onChange={(e) => handleMultiSelectChange('selectedGenres', Array.from(e.target.selectedOptions, option => option.value))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                    errors.selectedGenres ? 'border-red-500' : 'border-gray-300'
                  }`}
                  size={5}
                  disabled={isSubmitting}
                >
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.genresName}
                    </option>
                  ))}
                </select>
                {errors.selectedGenres && (
                  <div className="mt-2 text-red-600 text-sm">
                    {errors.selectedGenres}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quốc gia <span className="text-red-500">*</span>
                </label>
                <select
                  multiple
                  value={formData.selectedCountries}
                  onChange={(e) => handleMultiSelectChange('selectedCountries', Array.from(e.target.selectedOptions, option => option.value))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                    errors.selectedCountries ? 'border-red-500' : 'border-gray-300'
                  }`}
                  size={5}
                  disabled={isSubmitting}
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.countryName}
                    </option>
                  ))}
                </select>
                {errors.selectedCountries && (
                  <div className="mt-2 text-red-600 text-sm">
                    {errors.selectedCountries}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diễn viên
                </label>
                <select
                  multiple
                  value={formData.selectedActors}
                  onChange={(e) => handleMultiSelectChange('selectedActors', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  size={5}
                  disabled={isSubmitting}
                >
                  {actors.map(actor => (
                    <option key={actor.id} value={actor.id}>
                      {actor.originName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {errors.submit}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-4 mt-8">
              <button 
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 shadow-md"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <div className="flex-1">
                <GradientButton 
                  disabled={isSubmitting} 
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    editingMovie ? 'Cập nhật' : 'Thêm mới'
                  )}
                </GradientButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}