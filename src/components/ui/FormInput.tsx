export interface FormInputProps {
    id?: string;
    type?: string;
    name: string;
    placeholder?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    readonly?: boolean;
    className?: string;
    error?: string;
    hasError?: boolean;
}

export default function FormInput( { 
  id, 
  type = "text", 
  name, 
  placeholder = "", 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  autoComplete = "on", 
  readonly = false, 
  className = "",
  error,
  hasError = false
}: FormInputProps) {
  const errorClass = error || hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
  
  return (
    <div className="w-full">
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border bg-white rounded-lg focus:ring-3 focus:outline-transparent ${errorClass} ${className}`}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        readOnly={readonly}
      />
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}