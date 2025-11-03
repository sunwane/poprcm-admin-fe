import React from 'react';
import { Country } from '@/types/Country';
import SearchBar from '@/components/ui/SearchBar';
import GradientButton from '@/components/ui/GradientButton';

interface MovieCountriesFormProps {
  countries: Country[];
  selectedCountryIds: string[];
  countrySearchTerm: string;
  isProcessing: boolean;
  onCountrySearchChange: (value: string) => void;
  onToggleCountry: (countryId: string) => void;
}

const MovieCountriesForm: React.FC<MovieCountriesFormProps> = ({
  countries,
  selectedCountryIds,
  countrySearchTerm,
  isProcessing,
  onCountrySearchChange,
  onToggleCountry
}) => {
  const filteredCountries = countries.filter(country =>
    country.countryName.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const selectedCountries = countries.filter(country => 
    selectedCountryIds.includes(country.id)
  );

  const availableCountries = filteredCountries.filter(country => 
    !selectedCountryIds.includes(country.id)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Search & Available Countries */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Tìm kiếm quốc gia ({availableCountries.length})
          </h4>
          
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              searchQuery={countrySearchTerm}
              onChange={onCountrySearchChange}
              placeholder="Tìm kiếm quốc gia..."
            />
          </div>

          {/* Available Countries List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableCountries.length > 0 ? (
              availableCountries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <span className="font-medium text-gray-900">{country.countryName}</span>
                    </div>
                  </div>
                  
                  <GradientButton
                    onClick={() => onToggleCountry(country.id)}
                    disabled={isProcessing}
                  >
                    Thêm
                  </GradientButton>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">🌍</div>
                <p className="text-gray-500">
                  {countrySearchTerm ? 'Không tìm thấy quốc gia nào' : 'Không có quốc gia nào khả dụng'}
                </p>
                {countrySearchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Selected Countries */}
      <div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            Quốc gia đã chọn ({selectedCountries.length})
          </h4>
          
          {/* Selected Countries List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedCountries.length > 0 ? (
              selectedCountries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <span className="font-medium text-gray-900">{country.countryName}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onToggleCountry(country.id)}
                    disabled={isProcessing}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa quốc gia"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">📍</div>
                <p className="text-gray-500">Chưa chọn quốc gia nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Chọn quốc gia từ danh sách bên trái
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedCountries.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Tóm tắt:</strong> Đã chọn {selectedCountries.length} quốc gia
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {selectedCountries.map(country => country.countryName).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCountriesForm;