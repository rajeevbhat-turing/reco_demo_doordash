"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Product } from "@/types"
import { CartCategory, CartItem, useCartStore } from "@/store/cart-store"
import { usePersistedState } from "@/lib/hooks/usePersistedState"

// Define the cart context type
interface CartContextType {
  items: CartItem[]
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

// CartProvider component that uses both Zustand store and SQLite persistence
export function CartProviderWithSQLite({ 
  children, 
  category = "grocery",
  runId = "main-app-cart"
}: { 
  children: React.ReactNode, 
  category?: CartCategory,
  runId?: string
}) {
  // Use the existing cart store
  const cartStore = useCartStore()
  
  // Use our persisted state hook for SQLite persistence
  const [sqliteItems, setSqliteItems] = usePersistedState<CartItem[]>('cart.items', [], { runId })
  const [sqliteCategory, setSqliteCategory] = usePersistedState<CartCategory>('cart.category', category, { runId })
  
  // Local state to force re-renders when cart changes
  const [localVersion, setLocalVersion] = useState(0)
  
  // Set the initial category when the provider mounts
  useEffect(() => {
    cartStore.setCategory(category)
    setSqliteCategory(category)
  }, [category])

  // Sync Zustand store with SQLite persistence
  useEffect(() => {
    // When Zustand store changes, update SQLite
    if (JSON.stringify(cartStore.items) !== JSON.stringify(sqliteItems)) {
      setSqliteItems(cartStore.items)
    }
  }, [cartStore.items, sqliteItems])

  // When SQLite data changes, update Zustand store
  useEffect(() => {
    if (JSON.stringify(sqliteItems) !== JSON.stringify(cartStore.items)) {
      // Update Zustand store with SQLite data
      cartStore.clearCart()
      sqliteItems.forEach(item => {
        cartStore.addItem({
          id: item.id,
          itemName: item.itemName,
          price: item.price,
          image: item.image,
          storeId: item.storeId,
          restaurantId: item.restaurantId,
        }, item.category, item.storeName)
      })
    }
  }, [sqliteItems])

  // Subscribe to cart store changes
  useEffect(() => {
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
          itemName: product.name,
          price: product.price,
          image: product.image,
          restaurantId: storeId,
        }, category)
      } else if (storeId) {
        cartStore.addItem({
          id: product.id,
          itemName: product.name,
          price: product.price,
          image: product.image,
          storeId: storeId,
        }, category)
      } else {
        cartStore.addItem({
          id: product.id,
          itemName: product.name,
          price: product.price,
          image: product.image,
        }, category)
      }
    },
    removeFromCart: (productId: number | string) => cartStore.removeItem(productId),
    updateQuantity: (productId: number | string, quantity: number) => cartStore.updateQuantity(productId, quantity),
    clearCart: () => cartStore.clearCart(),
    totalItems: cartStore.getTotalItems(),
    subtotal: cartStore.getSubtotal(),
    serviceFee: cartStore.getServiceFee(),
    deliveryFee: cartStore.getDeliveryFee(),
    total: cartStore.getSubtotal(), // For cart display, only show subtotal
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
