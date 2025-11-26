'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'

/**
 * Route: /merchant/financials/payouts
 * 
 * Redirects to /merchant/store/[id]/financials/payouts with the current store ID
 */
export default function PayoutsRedirect() {
  const router = useRouter()
  const { currentStoreId } = useCurrentStore()

  useEffect(() => {
    // Redirect to the store-specific payouts route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/financials/payouts`)
    } else {
      // Fallback to default store if no store ID is set
      router.replace('/merchant/store/1/financials/payouts')
    }
  }, [currentStoreId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to payouts...</p>
      </div>
    </div>
  )
}
