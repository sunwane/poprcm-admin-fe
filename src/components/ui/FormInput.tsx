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
}

export default function FormInput( { id, type = "text", name, placeholder = "", value, onChange, required = false, disabled = false, autoComplete = "on", readonly = false, className = "" }: FormInputProps) {
  return (
    <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 border bg-white border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:outline-transparent ${className}`}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        readOnly={readonly}
        />
  );
}