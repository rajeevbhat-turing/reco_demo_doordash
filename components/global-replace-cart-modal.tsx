"use client"

import { create } from "zustand"
import { useCartStore, CartItem } from "@/store/cart-store"
import ReplaceCartModal from "@/components/modals/replace-cart-modal"

/**
 * Global state for the replace cart modal
 */
interface ReplaceCartModalState {
  isOpen: boolean
  pendingItem: Omit<CartItem, "quantity" | "category"> | null
  pendingCategory: string | undefined
  pendingStoreName: string | undefined
  conflictType: "restaurant" | "store"
  showModal: (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    storeName?: string,
    conflictType?: "restaurant" | "store"
  ) => void
  handleCancel: () => void
  handleReplace: () => void
}

export const useReplaceCartModalStore = create<ReplaceCartModalState>((set, get) => ({
  isOpen: false,
  pendingItem: null,
  pendingCategory: undefined,
  pendingStoreName: undefined,
  conflictType: "store",
  
  showModal: (item, category, storeName, conflictType = "store") => {
    set({
      isOpen: true,
      pendingItem: item,
      pendingCategory: category,
      pendingStoreName: storeName,
      conflictType,
    })
  },
  
  handleCancel: () => {
    set({
      isOpen: false,
      pendingItem: null,
      pendingCategory: undefined,
      pendingStoreName: undefined,
    })
  },
  
  handleReplace: () => {
    const { pendingItem, pendingCategory, pendingStoreName } = get()
    if (pendingItem) {
      const { replaceCartWithItem } = useCartStore.getState()
      replaceCartWithItem(pendingItem, pendingCategory as any, pendingStoreName)
    }
    set({
      isOpen: false,
      pendingItem: null,
      pendingCategory: undefined,
      pendingStoreName: undefined,
    })
  },
}))

/**
 * Global component that renders the replace cart modal
 * This should be included once at the root level
 */
export default function GlobalReplaceCartModal() {
  const { isOpen, conflictType, handleCancel, handleReplace } = useReplaceCartModalStore()
  
  return (
    <ReplaceCartModal
      isOpen={isOpen}
      onCancel={handleCancel}
      onReplace={handleReplace}
      sourceType={conflictType}
    />
  )
}

