"use client"

import { useParams, useRouter } from "next/navigation"
import { CartProvider } from "@/context/cart-context"
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

  const { setCurrentStore, clearCurrentStore } = useCartStore()

  useEffect(() => {
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
    <CartProvider category="grocery">
      <GroceryStorePage 
        onBackClick={() => router.push("/grocery")} 
        storeData={storeData}
      />
    </CartProvider>
  )
}
