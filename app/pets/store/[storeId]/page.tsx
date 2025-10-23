"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import PetStorePage from "@/components/store/pet-store-page"
import { allPetStores } from "@/data/pet-data"
import { useCartStore } from "@/store/cart-store"

export default function PetStorePageRoute() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string
  
  const [storeData, setStoreData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentStore, setCategory } = useCartStore()

  useEffect(() => {
    // Set category to pets
    setCategory("pets")
    
    if (storeId) {
      // Find the pet store by ID
      const foundStore = allPetStores.find(store => store.id === storeId)
      
      if (foundStore) {
        setStoreData(foundStore)
        setCurrentStore(foundStore)
      } else {
        // If store not found, redirect back to pets page
        router.push("/pets")
      }
      setLoading(false)
    }
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
    <PetStorePage 
      onBackClick={() => router.push("/pets")} 
      storeData={storeData}
    />
  )
} 