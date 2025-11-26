'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'

/**
 * Route: /merchant/customers/insights
 * 
 * Redirects to /merchant/store/[id]/customers/insights with the current store ID
 */
export default function CustomerInsightsRedirect() {
  const router = useRouter()
  const { currentStoreId } = useCurrentStore()

  useEffect(() => {
    // Redirect to the store-specific customer insights route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/customers/insights`)
    } else {
      // Fallback to default store if no store ID is set
      router.replace('/merchant/store/1/customers/insights')
    }
  }, [currentStoreId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to customer insights...</p>
      </div>
    </div>
  )
}
