'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Custom hook to track navigation state
function useNavigationState() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 200); // Reduced from 500ms to 200ms
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return isNavigating;
}

export default function LoadingBar() {
  const isNavigating = useNavigationState();

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-primary animate-[loading_0.5s_ease-out_infinite]" /> {/* Faster animation */}
    </div>
  );
}