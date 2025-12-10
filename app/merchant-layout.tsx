'use client';

import React, { useEffect, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StateWindowInitializer } from '@/components/state-window-initializer';
import Snackbar from '@/components/snackbar';
import { useSimulatedOrders } from '@/lib/hooks/useSimulatedOrders';
import { CurrentStoreProvider } from '@/lib/hooks/useCurrentStore';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useMerchantOrderStatus } from '@/lib/hooks/use-merchant-order-status';

// Import all merchant stores early to ensure their event listeners are registered
// before the storeDataLoaded event fires
import '@/store/merchant-menu-store';
import '@/store/merchant-modifiers-store';
import '@/store/merchant-orders-store';

const MerchantComponent = ({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string | null;
}) => {
  const { setCurrentStoreId } = useCurrentStore();
  // Simulate orders
  useSimulatedOrders();
  // Automatically update merchant order statuses
  useMerchantOrderStatus();

  // Set the current store ID based on the pathname
  useEffect(() => {
    if (!pathname) return;
    const match = /^\/merchant\/store\/([^/]+)/.exec(pathname);
    if (match?.[1]) {
      setCurrentStoreId(match[1]);
    }
  }, [pathname, setCurrentStoreId]);

  return <>{children}</>;
};

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to /merchant/onboarding if pathname is /onboarding
  // Redirect to /merchant if pathname doesn't start with /merchant and is not /onboarding
  useLayoutEffect(() => {
    if (pathname === '/onboarding') {
      router.replace('/merchant/onboarding');
    } else if (!pathname?.startsWith('/merchant')) {
      router.replace('/merchant');
    }
  }, [pathname]);

  // Don't render children if pathname doesn't start with /merchant
  if (!pathname?.startsWith('/merchant')) {
    return null;
  }

  return (
    <CurrentStoreProvider>
      <MerchantComponent pathname={pathname}>
        <div className="flex flex-col min-h-screen">
          <StateWindowInitializer />
          <main className="flex-1">{children}</main>
          <Snackbar />
        </div>
      </MerchantComponent>
    </CurrentStoreProvider>
  );
}
