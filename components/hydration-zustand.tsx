'use client';

import { useEffect, useState, ReactNode } from 'react';

const HydrationZustand = ({ children }: { children: ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <>{isHydrated ? children : null}</>;
};

export default HydrationZustand;
