"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import RetailStorePage from "@/components/store/retail-store-page"
import { stores, Store } from "@/constants/store"
import { useCartStore } from "@/store/cart-store"
import { useAppStore } from "@/store/app-store"

export default function RetailStorePageRoute() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string
  
  const [storeData, setStoreData] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  const { setCategory } = useCartStore()
  const { setCurrentStore, clearCurrentStore } = useAppStore()

  useEffect(() => {
    // Set category to retail
    setCategory("retail")
    
    if (storeId) {
      // Find the retail store by ID
      const foundStore = stores.find((store: Store) => store.id === storeId)
      
      if (foundStore) {
        setStoreData(foundStore)
        setCurrentStore(foundStore, "retail")
      } else {
        // If store not found, redirect back to retail page
        router.push("/retail")
      }
      setLoading(false)
    }
    return () => {
      clearCurrentStore();
    };
  }, [storeId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!storeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Store not found</div>
      </div>
    )
  }

  return (
    <RetailStorePage 
      onBackClick={() => router.push("/retail")} 
      storeData={storeData}
      productData={storeData.items || []}
    />
  )
} 