export interface FormInputProps {
    type?: string;
    name: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
}

export default function FormInput( { type = "text", name, placeholder = "", value, onChange, required = false, disabled = false, autoComplete = "on" }: FormInputProps) {
  return (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:outline-transparent"
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        />
  );
}