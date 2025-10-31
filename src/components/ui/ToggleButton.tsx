interface ToggleButtonProps {
  viewMode: 'table' | 'grid';
  onToggle: (mode: 'table' | 'grid') => void;
}

export default function ToggleButton({ viewMode, onToggle }: ToggleButtonProps) {
  return (
    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
      <button
        onClick={() => onToggle('table')}
        className={`px-3 py-2 rounded-md transition-colors ${
          viewMode === 'table'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:text-blue-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => onToggle('grid')}
        className={`px-3 py-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:text-blue-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  );
}