// components/Loading.tsx
export default function Loading() {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {/* اسپینر */}
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin [animation-duration:1.5s]"></div>
          </div>
          {/* متن */}
          <p className="text-white text-sm sm:text-lg font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }