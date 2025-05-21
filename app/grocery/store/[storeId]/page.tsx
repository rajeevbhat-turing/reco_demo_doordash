"use client"
import { useParams, useRouter } from "next/navigation"
import { CartProvider } from "@/context/cart-context"
import GroceryStorePage from "@/components/grocery-store-page"
import { stores } from "@/data/store-data"

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string

  // Get the store data based on the storeId
  const storeData = stores[storeId] || stores["1"] // Fallback to Sprouts if store not found

  return (
    <CartProvider>
      <GroceryStorePage onBackClick={() => router.push("/grocery")} storeData={storeData} />
    </CartProvider>
  )
}
