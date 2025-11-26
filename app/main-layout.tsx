'use client';

import { useEffect, useSyncExternalStore, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
// import LandingPageFooter from '@/components/landing-page-footer';
import LayoutWrapper from '@/components/layout-wrapper';
import Snackbar from '@/components/snackbar';
import { useUserStore } from '@/store/user-store';
import { useCarts } from '@/lib/hooks/use-carts';
import { useOrders } from '@/lib/hooks/use-orders';
import { StateWindowInitializer } from '@/components/state-window-initializer';
import NavigationLoader from '@/components/navigation-loader';

// Cached server snapshots to avoid infinite loops
const SERVER_SNAPSHOT_FALSE = false;
const SERVER_SNAPSHOT_NULL = null;

// Cached getSnapshot functions - must be stable references
const getIsAuthenticated = () => useUserStore.getState().isAuthenticated();
const getTempAddress = () => useUserStore.getState().getTempAddress();

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Get authentication status
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    getIsAuthenticated,
    () => SERVER_SNAPSHOT_FALSE
  );

  // Get temp address
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    getTempAddress,
    () => SERVER_SNAPSHOT_NULL
  );

  // Load user's carts from database
  useCarts();

  // Load user's orders from database
  useOrders();

  // Track when component has mounted (client-side hydration complete)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle redirects - only after component has mounted (hydration complete)
  useEffect(() => {
    // Don't redirect until the component has mounted and state is hydrated
    if (!isMounted) return;

    if (pathname === '/') {
      // If user is logged in or has a temp address, redirect to /home
      if (isAuthenticated || tempAddress) {
        router.replace('/home');
      }
    } else if (pathname === '/home') {
      // If user is not logged in and has no temp address, redirect to /
      // Only redirect if we're certain (after hydration)
      if (!isAuthenticated && !tempAddress) {
        router.replace('/');
      }
    } else if (
      !isAuthenticated &&
      !tempAddress &&
      pathname !== '/' &&
      !pathname.startsWith('/auth')
    ) {
      // If user is not logged in, has no temp address, and is not on "/" or "/auth" paths, redirect to "/"
      router.replace('/');
    }
  }, [pathname, isAuthenticated, tempAddress, isMounted, router]);

  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen">
        <StateWindowInitializer />
        <NavigationLoader />
        <main className="flex-1">{children}</main>
        {/* <LandingPageFooter /> */}
        <Snackbar />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StateWindowInitializer />
      <NavigationLoader />
      <Header />
      <LayoutWrapper>{children}</LayoutWrapper>
      <Snackbar />
    </div>
  );
}
