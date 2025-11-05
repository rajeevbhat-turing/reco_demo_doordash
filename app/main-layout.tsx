'use client';

import { useEffect, useSyncExternalStore, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import LandingPageFooter from '@/components/landing-page-footer';
import LayoutWrapper from '@/components/layout-wrapper';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';

// Cached server snapshots to avoid infinite loops
const SERVER_SNAPSHOT_FALSE = false;
const SERVER_SNAPSHOT_NULL = null;
const SERVER_SNAPSHOT_EMPTY_ADDRESSES: Address[] = [];

// Cached getSnapshot functions - must be stable references
const getIsAuthenticated = () => useUserStore.getState().isAuthenticated();
const getTempAddress = () => useUserStore.getState().getTempAddress();

// Stable getAddresses snapshot function
const getAddressesSnapshot = () => {
  const state = useUserStore.getState();
  // Return the actual array reference from state, or cached empty array
  return state.currentUser?.addresses || SERVER_SNAPSHOT_EMPTY_ADDRESSES;
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Get authentication status
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    getIsAuthenticated,
    () => SERVER_SNAPSHOT_FALSE
  );

  // Get addresses - use stable snapshot function
  const addresses = useSyncExternalStore(
    useUserStore.subscribe,
    getAddressesSnapshot,
    () => SERVER_SNAPSHOT_EMPTY_ADDRESSES
  );

  // Get temp address
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    getTempAddress,
    () => SERVER_SNAPSHOT_NULL
  );

  // Check if user has a default address (memoized to avoid recalculation)
  const hasDefaultAddress = useMemo(
    () => addresses.some((address: Address) => address.default),
    [addresses]
  );

  // Determine if user should be redirected to /home
  const shouldRedirectToHome =
    (isAuthenticated && hasDefaultAddress) || (!isAuthenticated && tempAddress);

  // Handle redirects
  useEffect(() => {
    if (pathname === '/') {
      // If user has address (authenticated with default address or has a temp address), redirect to /home
      if (shouldRedirectToHome) {
        router.replace('/home');
      }
    } else {
      // If user doesn't have address, redirect to /
      if (!shouldRedirectToHome) {
        router.replace('/');
      }
    }
  }, [pathname, shouldRedirectToHome]);

  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <LandingPageFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
