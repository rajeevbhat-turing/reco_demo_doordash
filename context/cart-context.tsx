"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/types"

// Define default cart config if not available
const defaultCartConfig = {
  freeDeliveryThreshold: 35,
  defaultDeliveryFee: 6.64,
  serviceFeePercentage: 0.15,
  minServiceFee: 5.49,
}

interface CartItem extends Product {
  quantity: number
  storeId?: string // Add store ID to track items from different stores
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, storeId?: string) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  serviceFee: number
  deliveryFee: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [serviceFee, setServiceFee] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(defaultCartConfig.defaultDeliveryFee)
  const [total, setTotal] = useState(0)

  // Calculate totals whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(newSubtotal)

    // Calculate service fee (percentage with minimum)
    const calculatedServiceFee = Math.max(
      newSubtotal * defaultCartConfig.serviceFeePercentage,
      defaultCartConfig.minServiceFee,
    )
    setServiceFee(calculatedServiceFee)

    // Delivery fee is $0 if subtotal is over threshold, otherwise default fee
    const newDeliveryFee =
      newSubtotal >= defaultCartConfig.freeDeliveryThreshold ? 0 : defaultCartConfig.defaultDeliveryFee
    setDeliveryFee(newDeliveryFee)

    // Calculate total
    setTotal(newSubtotal + calculatedServiceFee + newDeliveryFee)
  }, [items])

  // Add product to cart
  const addToCart = (product: Product, storeId?: string) => {
    setItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id)

      if (existingItemIndex >= 0) {
        // Product exists, increment quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        }
        return updatedItems
      } else {
        // Product doesn't exist, add new item
        return [...prevItems, { ...product, quantity: 1, storeId }]
      }
    })
  }

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  // Update product quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
  }

  // Calculate total items in cart
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    serviceFee,
    deliveryFee,
    total,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
