'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'

/**
 * Route: /merchant/reports
 * 
 * Redirects to /merchant/store/[id]/reports with the current store ID
 */
export default function ReportsRedirect() {
  const router = useRouter()
  const { currentStoreId } = useCurrentStore()

  useEffect(() => {
    // Redirect to the store-specific reports route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/reports`)
    } else {
      // Fallback to default store if no store ID is set
      router.replace('/merchant/store/1/reports')
    }
  }, [currentStoreId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to reports...</p>
      </div>
    </div>
  )
}
