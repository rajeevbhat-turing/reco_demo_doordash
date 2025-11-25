'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Route: /merchant
 * 
 * Default merchant route - redirects to /merchant/store/1 (Demo store)
 */
export default function MerchantHomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default store (store ID 1 - Demo store)
    router.replace('/merchant/store/1')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
