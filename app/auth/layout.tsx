'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useAppStore } from '@/store/app-store';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useUserStore(state => state.isAuthenticated());
  const routeBeforeAuth = useAppStore(state => state.routeBeforeAuth);
  const setRouteBeforeAuth = useAppStore(state => state.setRouteBeforeAuth);

  useEffect(() => {
    // If user is logged in, navigate to saved path or home
    if (isAuthenticated) {
      if (routeBeforeAuth) {
        router.replace(routeBeforeAuth);
        // Delay clearing the saved path to ensure navigation completes
        setTimeout(() => {
          setRouteBeforeAuth(null);
        }, 500);
      } else {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, routeBeforeAuth, router, setRouteBeforeAuth]);

  return <>{children}</>;
}
