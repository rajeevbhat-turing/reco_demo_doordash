'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'
import { useAllRestaurants } from '@/lib/hooks/use-restaurants'

/**
 * Route: /store/[id]/merchant
 * 
 * Merchant-specific route for store pages
 * Sets the current store in the merchant portal and redirects to merchant home
 */
export default function StoreMerchantPage() {
  const params = useParams()
  const router = useRouter()
  const { setCurrentStoreId } = useCurrentStore()
  const { data: restaurants, isLoading } = useAllRestaurants()

  const storeIdParam = params.id as string

  useEffect(() => {
    if (isLoading) return

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants?.find(r => r.id === storeIdParam)
    
    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants?.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
        r.name === storeIdParam
      )
    }

    if (restaurant) {
      // Set the current store ID (numeric ID as string)
      setCurrentStoreId(restaurant.id)
      // Redirect to merchant home
      router.replace('/merchant')
    } else {
      // Store not found, redirect to merchant home with default store
      console.warn(`Store not found: ${storeIdParam}`)
      router.replace('/merchant')
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, router])

  // Show loading state while finding store
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading store...</p>
      </div>
    </div>
  )
}

