"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Product } from "@/types"
import { CartCategory, useCartStore } from "@/store/cart-store"

// Define the cart context type
interface CartContextType {
  items: any[]
  addToCart: (product: Product, storeId?: string) => void
  removeFromCart: (productId: number | string) => void
  updateQuantity: (productId: number | string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  serviceFee: number
  deliveryFee: number
  total: number
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// CartProvider component that uses the Zustand store internally
export function CartProvider({ 
  children, 
  category = "grocery" 
}: { 
  children: React.ReactNode, 
  category?: CartCategory 
}) {
  // Use the cart store
  const cartStore = useCartStore()
  
  // Local state to force re-renders when cart changes
  const [localVersion, setLocalVersion] = useState(0)
  
  // Set the initial category when the provider mounts
  useEffect(() => {
    cartStore.setCategory(category)
  }, [category])

  // Subscribe to cart store changes
  useEffect(() => {
    // This subscription will trigger a re-render whenever the cart store changes
    const unsubscribe = useCartStore.subscribe(() => {
      setLocalVersion(v => v + 1)
    })
    
    return () => unsubscribe()
  }, [])
  
  // Create value object with Zustand state and methods
  const value = {
    items: cartStore.items,
    addToCart: (product: Product, storeId?: string) => {
      if (category === "restaurant" && storeId) {
        cartStore.addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          restaurantId: storeId,
        })
      } else if (storeId) {
        cartStore.addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          storeId: storeId,
        })
      } else {
        // Default case - just add the product without store ID
        cartStore.addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        })
      }
    },
    removeFromCart: (productId: number | string) => cartStore.removeItem(productId),
    updateQuantity: (productId: number | string, quantity: number) => cartStore.updateQuantity(productId, quantity),
    clearCart: () => cartStore.clearCart(),
    totalItems: cartStore.getTotalItems(),
    subtotal: cartStore.getSubtotal(),
    serviceFee: cartStore.getServiceFee(),
    deliveryFee: cartStore.getDeliveryFee(),
    total: cartStore.getTotal(),
  }
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook to use the cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}