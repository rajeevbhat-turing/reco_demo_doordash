"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useCartStore, CartItem } from "@/store/cart-store"
import { usePersistedState } from "@/lib/hooks/usePersistedState"
import ReplaceCartModal from "@/components/modals/replace-cart-modal"

interface ReplaceCartContextType {
  showReplaceModal: (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    conflictType?: "restaurant" | "store"
  ) => void
  addItemWithConflictCheck: (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string
  ) => void
}

const ReplaceCartContext = createContext<ReplaceCartContextType | undefined>(undefined)

interface ReplaceCartProviderProps {
  children: ReactNode
  runId?: string
}

export function ReplaceCartProviderWithSQLite({ children, runId = "main-app-cart" }: ReplaceCartProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingItem, setPendingItem] = useState<Omit<CartItem, "quantity" | "category"> | null>(null)
  const [pendingCategory, setPendingCategory] = useState<string | undefined>(undefined)
  const [conflictType, setConflictType] = useState<"restaurant" | "store">("store")
  
  const { addItem, checkConflict, replaceCartWithItem, items, clearCart } = useCartStore()
  
  // Use our persisted state hook for SQLite persistence
  const [sqliteItems, setSqliteItems] = usePersistedState<CartItem[]>('cart.items', [], { runId })
  const [sqliteCategory, setSqliteCategory] = usePersistedState<string>('cart.category', 'grocery', { runId })
  
  // Sync Zustand store with SQLite persistence
  useEffect(() => {
    // When Zustand store changes, update SQLite
    if (JSON.stringify(items) !== JSON.stringify(sqliteItems)) {
      console.log('🔄 Syncing Zustand to SQLite:', items.length, 'items')
      setSqliteItems(items)
    }
  }, [items, sqliteItems])

  // When SQLite data changes, update Zustand store
  useEffect(() => {
    if (JSON.stringify(sqliteItems) !== JSON.stringify(items)) {
      console.log('🔄 Syncing SQLite to Zustand:', sqliteItems.length, 'items')
      
      // Clear current cart and add SQLite items
      clearCart()
      sqliteItems.forEach(item => {
        addItem({
          id: item.id,
          itemName: item.itemName,
          price: item.price,
          image: item.image,
          storeId: item.storeId,
          restaurantId: item.restaurantId,
        }, item.category as any, item.storeName)
      })
    }
  }, [sqliteItems])

  const showReplaceModal = (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    conflictType: "restaurant" | "store" = "store"
  ) => {
    setPendingItem(item)
    setPendingCategory(category)
    setConflictType(conflictType)
    setIsModalOpen(true)
  }

  const addItemWithConflictCheck = (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string
  ) => {
    const conflict = checkConflict(item, category as any)
    
    if (conflict.hasConflict && conflict.conflictType) {
      showReplaceModal(item, category, conflict.conflictType)
    } else {
      addItem(item, category as any)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setPendingItem(null)
    setPendingCategory(undefined)
  }

  const handleReplace = () => {
    if (pendingItem) {
      replaceCartWithItem(pendingItem, pendingCategory as any)
    }
    setIsModalOpen(false)
    setPendingItem(null)
    setPendingCategory(undefined)
  }

  return (
    <ReplaceCartContext.Provider value={{ showReplaceModal, addItemWithConflictCheck }}>
      {children}
      <ReplaceCartModal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onReplace={handleReplace}
        sourceType={conflictType}
      />
    </ReplaceCartContext.Provider>
  )
}

export function useReplaceCart() {
  const context = useContext(ReplaceCartContext)
  if (context === undefined) {
    throw new Error("useReplaceCart must be used within a ReplaceCartProvider")
  }
  return context
}
