export interface SearchBarProps {
  searchQuery?: string;
  onChange: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
}

export default function SearchBar({ searchQuery = '', onChange, placeholder, isSearching = false }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <img
        src={'/icons/Search.png'}
        alt="Search"
        className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-opacity ${
          isSearching ? 'opacity-75' : 'opacity-50'
        }`}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder || 'Tìm kiếm...'}
        value={searchQuery}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full p-3 pl-10 ${isSearching ? 'pr-10' : 'pr-4'} border bg-white border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-700 focus:outline-transparent transition-all ${
          isSearching ? 'border-blue-400' : ''
        }`}
      />
      {isSearching && (
        <div className="absolute -bottom-6 left-0 text-xs text-blue-600 animate-pulse">
          Đang tìm kiếm... (10s)
        </div>
      )}
    </div>
  );
}