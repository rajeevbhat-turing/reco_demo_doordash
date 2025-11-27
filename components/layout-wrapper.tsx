'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';
import { useUserStore } from '@/store/user-store';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/password_reset');

  // Check if it's an order detail page (e.g., /orders/123) but not the order list page (/orders)
  const isOrderDetailPage = pathname?.startsWith('/orders/') && pathname !== '/orders';

  // Get store data using Zustand hooks
  const isAuthenticated = useUserStore(state => state.isAuthenticated());
  const addresses = useUserStore(state => state.getAddresses());
  const tempAddress = useUserStore(state => state.getTempAddress());

  // Determine if content should be shown
  // Hide content if:
  // 1. User is not logged in AND there is no temp address, OR
  // 2. User is logged in AND there are no addresses
  const shouldShowContent = isAuthenticated
    ? addresses.length > 0
    : isAuthPage || tempAddress !== null;

  return (
    <>
      <div className="flex flex-1 relative">
        {!isCheckoutPage && !isAuthPage && !isOrderDetailPage && <Sidebar />}
        <div
          className={`flex-1 w-0 min-w-0 ${
            !isCheckoutPage && !isAuthPage && !isOrderDetailPage ? 'md:ml-[220px]' : ''
          }`}
        >
          {shouldShowContent ? (
            <main className="flex-1">{children}</main>
          ) : (
            <main className="flex-1"></main>
          )}
        </div>
      </div>
      {/* {!isCheckoutPage && <Footer />} */}
    </>
  );
}
