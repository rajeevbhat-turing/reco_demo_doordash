'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import LandingPageFooter from '@/components/landing-page-footer';
import LayoutWrapper from '@/components/layout-wrapper';
import Snackbar from '@/components/snackbar';
import { useUserStore } from '@/store/user-store';

// Cached server snapshots to avoid infinite loops
const SERVER_SNAPSHOT_FALSE = false;
const SERVER_SNAPSHOT_NULL = null;

// Cached getSnapshot functions - must be stable references
const getIsAuthenticated = () => useUserStore.getState().isAuthenticated();
const getTempAddress = () => useUserStore.getState().getTempAddress();

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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

  // Handle redirects
  useEffect(() => {
    if (pathname === '/') {
      // If user is logged in or has a temp address, redirect to /home
      if (isAuthenticated || tempAddress) {
        router.replace('/home');
      }
    } else if (pathname === '/home') {
      // If user is not logged in and has no temp address, redirect to /
      if (!isAuthenticated && !tempAddress) {
        router.replace('/');
      }
    }
  }, [pathname, isAuthenticated, tempAddress]);

  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <LandingPageFooter />
        <Snackbar />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LayoutWrapper>{children}</LayoutWrapper>
      <Snackbar />
    </div>
  );
}
