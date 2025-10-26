import { ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GradientButton({ children, onClick, disabled }: GradientButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`bg-linear-to-br from-blue-400 to-blue-800 text-white space-x-1 px-6 py-3 rounded-lg hover:from-blue-500 hover:to-indigo-900 transition-all flex items-center justify-center w-full ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}