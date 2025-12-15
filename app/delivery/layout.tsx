'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import DeliveryHeader from '@/components/delivery/header';
import DeliverySidebar from '@/components/delivery/sidebar';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/delivery/sign-in', '/delivery/sign-up'];

// Routes where we don't show sidebar (auth pages)
const NO_SIDEBAR_ROUTES = ['/delivery/sign-in', '/delivery/sign-up'];

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());

  // Check if current route needs sidebar
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname) && isAuthenticated;

  useEffect(() => {
    // Skip redirect logic for public routes and the index redirect page
    if (PUBLIC_ROUTES.includes(pathname) || pathname === '/delivery') {
      return;
    }

    // If not authenticated and trying to access protected route, redirect to sign-in
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delivery Portal Header */}
      <DeliveryHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 relative pt-16">
        {/* Sidebar - only show when authenticated and not on auth pages */}
        {showSidebar && <DeliverySidebar />}

        {/* Content */}
        <div
          className={`flex-1 w-0 min-w-0 ${
            showSidebar ? 'md:ml-[220px]' : ''
          }`}
        >
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
