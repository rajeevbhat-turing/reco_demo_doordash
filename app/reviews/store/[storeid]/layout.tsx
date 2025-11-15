'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useAppStore } from '@/store/app-store';

export default function StoreReviewsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useUserStore(state => state.currentUser);
  const setRouteBeforeAuth = useAppStore(state => state.setRouteBeforeAuth);

  useEffect(() => {
    // If not authenticated, save current path and redirect to auth page
    if (currentUser === null) {
      setRouteBeforeAuth(pathname);
      router.push('/auth');
    }
  }, [currentUser, router, pathname, setRouteBeforeAuth]);

  // Don't render children if not authenticated
  if (currentUser === null) {
    return null;
  }

  return <>{children}</>;
}
