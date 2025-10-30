'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCheckoutPage = pathname === '/checkout'

  return (
    <div className="flex flex-1 relative">
      {!isCheckoutPage && <Sidebar />}
      <div className={`flex-1 w-0 min-w-0 ${!isCheckoutPage ? 'md:ml-[220px]' : ''}`}>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

