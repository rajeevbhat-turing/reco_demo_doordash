'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const previousPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    // Only show spinner if pathname actually changed (not on initial mount)
    if (previousPathnameRef.current !== pathname) {
      setIsLoading(true);
      previousPathnameRef.current = pathname;

      // Hide spinner after page has had time to render
      // Minimum display time for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-dashed border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

