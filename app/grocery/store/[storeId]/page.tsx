"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import GroceryStorePage from "@/components/grocery-store-page"
import { stores, StoreInfo } from "@/data/store-data"
import { useCartStore } from "@/store/cart-store"

export default function GroceryStorePageRoute() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string
  
  const [storeData, setStoreData] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const { setCurrentStore, clearCurrentStore, setCategory } = useCartStore()

  useEffect(() => {
    // Set category to grocery
    setCategory("grocery")
    
    if (storeId) {
      // Find the grocery store by ID
      const foundStore = stores[storeId]
      
      if (foundStore) {
        setCurrentStore(foundStore)
        setStoreData(foundStore)
      } else {
        // If store not found, redirect back to grocery page
        router.push("/grocery")
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
    <GroceryStorePage 
      onBackClick={() => router.push("/grocery")} 
      storeData={storeData}
    />
  )
}
