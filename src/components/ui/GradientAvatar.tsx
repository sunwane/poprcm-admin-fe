export default function GradientAvatar({ initial }: { initial: string }) {
    return (
        <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-800 rounded-full flex items-center justify-center text-white font-semibold">
        { initial }
        </div>
    );
}