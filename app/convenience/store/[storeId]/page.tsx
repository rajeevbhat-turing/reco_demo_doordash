"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CartProvider } from "@/context/cart-context"
import { useState, useEffect } from "react"
import type { ProductSection } from "@/types/store"
import RetailStorePage from "@/components/store/retail-store-page"
import PetStorePage from "@/components/store/pet-store-page"
import GroceryStorePage from "@/components/grocery-store-page"
import { stores as retailStores } from "@/constants/store"
import { allPetStores } from "@/data/pet-data"
import { stores as groceryStores } from "@/data/store-data"
import { groceryData } from "@/data/grocery-data"

// This is a sample product data for retail stores
// In a real application, this would come from an API
const sampleRetailProducts: ProductSection[] = [
  {
    id: 1,
    title: "Popular Deals",
    products: [
      {
        id: 1,
        name: "Cordless Drill",
        price: 79.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e35cca4a-a694-4eed-823f-7253f72b8e6f-retina-large.jpg"
      },
      {
        id: 2,
        name: "Air Filter",
        price: 12.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d6338d1-1d18-4cb3-b146-232913b74923-retina-large.png"
      },
      {
        id: 3,
        name: "Garden Fertilizer",
        price: 14.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e4bee36-6259-4606-9e83-6656e18cf869-retina-large.jpg"
      }
    ]
  },
  {
    id: 2,
    title: "New Arrivals",
    products: [
      {
        id: 4,
        name: "Smart Home Hub",
        price: 129.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5c392522-4380-4812-a664-814edfa3463d-retina-large.png"
      },
      {
        id: 5,
        name: "Wireless Speaker",
        price: 59.99,
        image: "/placeholder.svg?height=120&width=120"
      },
      {
        id: 6,
        name: "LED Lightbulbs (4-pack)",
        price: 9.99,
        image: "/placeholder.svg?height=120&width=120"
      }
    ]
  },
  {
    id: 3,
    title: "Top Deals",
    products: [
      {
        id: 7,
        name: "Power Washer",
        price: 149.99,
        quantity: "Was $199.99",
        image: "/placeholder.svg?height=120&width=120"
      },
      {
        id: 8,
        name: "Tool Set (108 pc)",
        price: 89.99,
        quantity: "Was $129.99",
        image: "/placeholder.svg?height=120&width=120"
      },
      {
        id: 9,
        name: "Smart Thermostat",
        price: 119.99,
        quantity: "Was $149.99",
        image: "/placeholder.svg?height=120&width=120"
      }
    ]
  }
];

export default function ConvenienceStorePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = params.storeId as string
  const storeType = searchParams.get('storeType') || "retail"
  
  const [storeData, setStoreData] = useState<any>(null)
  const [productData, setProductData] = useState<ProductSection[]>([])

  useEffect(() => {
    if (storeId) {
      // Determine store type based on the storeType parameter or by checking data sources
      let foundStore = null
      let sourceType = storeType
      
      if (storeType === 'grocery' || storeId in groceryStores) {
        foundStore = groceryStores[storeId]
        sourceType = 'grocery'
        setProductData([]) // Simplified for now to avoid type conflicts
      } else if (storeType === 'pets' || allPetStores.some(store => store.id === storeId)) {
        foundStore = allPetStores.find(store => store.id === storeId)
        sourceType = 'pets'
        // Pet product data is handled within the PetStorePage component
        setProductData([])
      } else {
        foundStore = retailStores.find(store => store.id === storeId)
        sourceType = 'retail'
        setProductData(foundStore?.items ?? sampleRetailProducts)
      }
      
      if (foundStore) {
        setStoreData({
          data: foundStore,
          type: sourceType
        })
      } else {
        // If store not found, redirect to main convenience page (would be created later)
        router.push("/convenience")
      }
    }
  }, [storeId, storeType, router])

  if (!storeData) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <CartProvider category={storeData.type as "grocery" | "retail" | "pets"}>
      {storeData.type === 'grocery' ? (
        <GroceryStorePage 
          onBackClick={() => router.push("/grocery")} 
          storeData={storeData.data}
        />
      ) : storeData.type === 'pets' ? (
        <PetStorePage 
          onBackClick={() => router.push("/pets")} 
          storeData={storeData.data}
        />
      ) : (
        <RetailStorePage 
          onBackClick={() => router.push("/retail")} 
          storeData={storeData.data}
          productData={productData}
        />
      )}
    </CartProvider>
  )
}