'use client';

import React, { useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StateWindowInitializer } from '@/components/state-window-initializer';
import Snackbar from '@/components/snackbar';

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
    <div className="flex flex-col min-h-screen">
      <StateWindowInitializer />
      <main className="flex-1">{children}</main>
      <Snackbar />
    </div>
  );
}
