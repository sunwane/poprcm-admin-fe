import { ReactNode } from "react";

export default function GradientButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="bg-linear-to-br  from-blue-400 to-blue-800 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-indigo-900 transition-all flex items-center space-x-2"
        >
            {children}
        </button>
    );
}