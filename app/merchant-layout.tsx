'use client';

import React, { useEffect, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StateWindowInitializer } from '@/components/state-window-initializer';
import Snackbar from '@/components/snackbar';
import { useSimulatedOrders } from '@/lib/hooks/useSimulatedOrders';
import { CurrentStoreProvider } from '@/lib/hooks/useCurrentStore';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useMerchantOrderStatus } from '@/lib/hooks/use-merchant-order-status';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

// Import all merchant stores early to ensure their event listeners are registered
// before the storeDataLoaded event fires
import '@/store/merchant-menu-store';
import '@/store/merchant-modifiers-store';
import '@/store/merchant-orders-store';

// Hooks that only run when authenticated
function AuthenticatedHooks() {
  useSimulatedOrders();
  useMerchantOrderStatus();
  return null;
}

const MerchantComponent = ({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string | null;
}) => {
  const { setCurrentStoreId } = useCurrentStore();
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);

  // Set the current store ID based on the pathname
  useEffect(() => {
    if (!pathname) return;
    const match = /^\/merchant\/store\/([^/]+)/.exec(pathname);
    if (match?.[1]) {
      setCurrentStoreId(match[1]);
    }
  }, [pathname, setCurrentStoreId]);

  return (
    <>
      {/* Only run order simulation and status updates when authenticated */}
      {currentMerchant && <AuthenticatedHooks />}
      {children}
    </>
  );
};

// Gets the redirect URL based on onboarding step
const getOnboardingStepUrl = (step: number): string => {
  switch (step) {
    case 0:
      return '/merchant/onboarding?step=order-protocol';
    case 1:
      return '/merchant/onboarding?step=hours';
    case 2:
      return '/merchant/onboarding?step=menu';
    case 3:
      return '/merchant/onboarding?step=pricing';
    case 4:
      return '/merchant/onboarding?step=payout';
    default:
      return '/merchant/onboarding?step=order-protocol';
  }
};

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);

  // Handle authentication and onboarding redirects
  useLayoutEffect(() => {
    // Auth pages handling (sign-in and sign-up)
    const isAuthPage = pathname === '/merchant/auth' || pathname?.startsWith('/merchant/auth/');
    
    if (isAuthPage) {
      // If logged in, redirect away from auth pages
      if (currentMerchant) {
        if (currentMerchant.onboardingCompleted) {
          router.replace(`/merchant/store/${currentMerchant.primaryStoreId}`);
        } else {
          const onboardingUrl = getOnboardingStepUrl(currentMerchant.onboardingStep || 0);
          router.replace(onboardingUrl);
        }
      }
      return;
    }

    // Not logged in - redirect to auth
    if (!currentMerchant) {
      router.replace('/merchant/auth');
      return;
    }

    // Logged in but onboarding not completed - redirect to onboarding
    if (!currentMerchant.onboardingCompleted) {
      if (!pathname?.startsWith('/merchant/onboarding')) {
        const onboardingUrl = getOnboardingStepUrl(currentMerchant.onboardingStep || 0);
        router.replace(onboardingUrl);
      }
      return;
    }

    // Logged in and onboarding completed - redirect from root merchant paths to primary store
    if (
      pathname === '/merchant' ||
      pathname === '/merchant/' ||
      pathname === '/onboarding' ||
      pathname?.startsWith('/merchant/onboarding')
    ) {
      router.replace(`/merchant/store/${currentMerchant.primaryStoreId}`);
      return;
    }

    // Legacy redirect for /onboarding
    if (pathname === '/onboarding') {
      router.replace('/merchant/onboarding');
      return;
    }

    // Redirect if pathname doesn't start with /merchant
    if (!pathname?.startsWith('/merchant')) {
      router.replace(`/merchant/store/${currentMerchant.primaryStoreId}`);
    }
  }, [pathname, currentMerchant, router]);

  // Show auth pages without wrapper components (only if not logged in)
  const isAuthPage = pathname === '/merchant/auth' || pathname?.startsWith('/merchant/auth/');
  if (isAuthPage) {
    // If logged in, show nothing while redirecting
    if (currentMerchant) {
      return null;
    }
    return <>{children}</>;
  }

  // Show loading state while redirecting unauthenticated users
  if (!currentMerchant) {
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
