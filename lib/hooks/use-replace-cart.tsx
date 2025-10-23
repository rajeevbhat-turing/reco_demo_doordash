"use client"

import { useCartStore, CartItem } from "@/store/cart-store"
import { useReplaceCartModalStore } from "@/components/global-replace-cart-modal"

/**
 * Custom hook to handle cart replacement logic without Context API
 * This hook uses a global zustand store for the modal state
 */
export function useReplaceCart() {
  const { addItem, checkConflict } = useCartStore()
  const { showModal } = useReplaceCartModalStore()

  const addItemWithConflictCheck = (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    storeName?: string
  ) => {
    const conflict = checkConflict(item, category as any)
    
    if (conflict.hasConflict && conflict.conflictType) {
      showModal(item, category, storeName, conflict.conflictType)
    } else {
      addItem(item, category as any, storeName)
    }
  }

  return {
    addItemWithConflictCheck,
  }
}

