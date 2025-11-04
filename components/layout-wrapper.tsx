'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Footer from '@/components/footer'
import { useUserStore } from '@/store/user-store'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCheckoutPage = pathname === '/checkout'

  // Get store data using Zustand hooks
  const isAuthenticated = useUserStore(state => state.isAuthenticated())
  const addresses = useUserStore(state => state.getAddresses())
  const tempAddress = useUserStore(state => state.getTempAddress())

  // Determine if content should be shown
  // Hide content if:
  // 1. User is not logged in AND there is no temp address, OR
  // 2. User is logged in AND there are no addresses
  const shouldShowContent = isAuthenticated 
    ? addresses.length > 0 
    : tempAddress !== null

  return (
    <>
      <div className="flex flex-1 relative">
        {!isCheckoutPage && <Sidebar />}
        <div className={`flex-1 w-0 min-w-0 ${!isCheckoutPage ? 'md:ml-[220px]' : ''}`}>
          {shouldShowContent ? (
            <main className="flex-1">{children}</main>
          ) : (
            <main className="flex-1"></main>
          )}
        </div>
      </div>
      {!isCheckoutPage && <Footer />}
    </>
  )
}

