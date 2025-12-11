'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './main-layout';

/**
 * Conditional wrapper that applies MainLayout only for non-delivery routes.
 * Delivery routes (/delivery/*) have their own layout and don't need the main app's
 * Header, authentication redirects, or other main layout features.
 */
export function ConditionalMainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // For delivery routes, render children directly without MainLayout
  // The delivery routes have their own layout at app/delivery/layout.tsx
  if (pathname?.startsWith('/delivery')) {
    return <>{children}</>;
  }

  // For all other routes, use the main app's layout
  return <MainLayout>{children}</MainLayout>;
}

