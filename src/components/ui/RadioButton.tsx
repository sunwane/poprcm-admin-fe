import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={className || 'space-y-3'}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
              selectedValue === option.value
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 bg-white hover:border-blue-400'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            {selectedValue === option.value && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

export default RadioButton;