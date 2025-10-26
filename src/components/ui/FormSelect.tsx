import { useState } from "react";

export interface FormSelectProps {
  filter?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  size?: 'small' | 'medium' | 'large'; // Thêm 'large' nếu cần
}

export default function FormSelect({ filter, onChange, options, size = "medium" }: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  // Định nghĩa các class CSS cho từng size
  const sizeClasses = {
    small: {
      button: "px-2.5 py-1.5 pr-8 text-sm",
      icon: "w-4 h-4 right-2",
      dropdown: "text-sm",
      item: "px-3 py-1.5"
    },
    medium: {
      button: "px-4 py-3 pr-10 text-base",
      icon: "w-5 h-5 right-3",
      dropdown: "text-base",
      item: "px-4 py-2"
    },
    large: {
      button: "px-5 py-4 pr-12 text-lg",
      icon: "w-6 h-6 right-4",
      dropdown: "text-lg",
      item: "px-5 py-3"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-white border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-600 focus:outline-transparent 
          appearance-none w-full flex items-center justify-between relative
          ${currentSize.button}
        `}
      >
        <span>{options.find(option => option.value === filter)?.label || "Chọn"}</span>
        <svg
          className={`
            absolute top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none
            ${currentSize.icon}
          `}
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
        <ul className={`
          absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-full
          ${currentSize.dropdown}
        `}>
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                hover:bg-blue-100 cursor-pointer transition-colors
                ${currentSize.item}
                ${option.value === filter ? 'bg-blue-50 text-blue-600' : ''}
              `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}