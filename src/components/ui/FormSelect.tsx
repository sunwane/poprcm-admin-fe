import { useState } from "react";

export interface FormSelectProps {
  filter?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function FormSelect({ filter, onChange, options}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  return (
    <div className="relative w-full"> {/* Đảm bảo container chiếm toàn bộ chiều rộng */}
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-600 focus:outline-transparent appearance-none w-full flex items-center justify-between relative"
      >
        <span>{options.find(option => option.value === filter)?.label || "Chọn"}</span>
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-full">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}