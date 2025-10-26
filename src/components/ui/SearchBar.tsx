export interface SearchBarProps {
  searchQuery: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({searchQuery, onChange, placeholder}: SearchBarProps) {
  return (
    <div className="relative flex-1">
        <img src={'/icons/Search.png'} alt="Search" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50" />
        <input
          type="text"
          placeholder={placeholder || "Tìm kiếm..."}
          value={searchQuery}
          onChange={(event) => onChange(event.target.value)}
          className="w-full p-3 pl-10 border bg-white border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-700 focus:outline-transparent"
        />
      </div>
  );
}