'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'

/**
 * Route: /merchant/menu
 * 
 * Redirects to /merchant/store/[id]/menu with the current store ID
 */
export default function MerchantMenuRedirect() {
  const router = useRouter()
  const { currentStoreId } = useCurrentStore()

  useEffect(() => {
    // Redirect to the store-specific menu route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/menu`)
    } else {
      // Fallback to default store if no store ID is set
      router.replace('/merchant/store/1/menu')
    }
  }, [currentStoreId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to menu...</p>
      </div>
    </div>
  )
}
