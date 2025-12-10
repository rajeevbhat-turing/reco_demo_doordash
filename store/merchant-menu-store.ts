'use client'

import { create } from "zustand"
import { persist, StateStorage } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"
import { setStoreScopedStorage } from "@/lib/utils/store-scoped-storage"
import { StoreMerchantData } from "@/constants/merchant-store-data"

export type ItemStatus = 
  | "In stock"
  | "Out of stock - 4 hours"
  | "Out of stock - Today"
  | "Out of stock - 1 week"
  | "Out of stock - Custom"
  | "Out of stock - Indefinitely"

export interface MenuItem {
  id: string
  name: string
  image: string
  pickupPrice: string
  deliveryPrice: string
  status: ItemStatus
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface MerchantMenuStore {
  categories: MenuCategory[]
  expandedCategories: Set<string>
  showBanner: boolean
  deletedItemIds: Set<string>
  
  // Actions
  setCategories: (categories: MenuCategory[]) => void
  updateItemStatus: (itemId: string, status: ItemStatus) => void
  toggleCategory: (categoryId: string) => void
  setShowBanner: (show: boolean) => void
  addItem: (categoryId: string, item: MenuItem) => void
  updateItem: (itemId: string, updates: Partial<MenuItem>) => void
  deleteItem: (itemId: string) => void
  addDeletedItem: (itemId: string) => void
}

// Store instance - will be updated when store changes
let currentStoreId = ''

const scopedStorage: () => StateStorage = () => {
  const noop: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
  if (typeof window === 'undefined') return noop
  const storeKey = currentStoreId ? `merchant.${currentStoreId}.menu` : null
  if (!storeKey) return noop
  return {
    getItem: (name: string) => localStorage.getItem(storeKey) ?? localStorage.getItem(name),
    setItem: (name: string, value: string) => {
      localStorage.setItem(storeKey, value)
      localStorage.setItem(name, value)
    },
    removeItem: (name: string) => {
      localStorage.removeItem(storeKey)
      localStorage.removeItem(name)
    },
  }
}

export const useMerchantMenuStore = create<MerchantMenuStore>()(
  persist(
    (set, get) => ({
      categories: [],
      expandedCategories: new Set(),
      showBanner: true,
      deletedItemIds: new Set(),

      setCategories: (categories) => {
        if (!currentStoreId) return
        set({ categories })
        if (typeof window !== 'undefined') {
          setStoreScopedStorage(currentStoreId, 'menu', {
            categories,
            expandedCategories: Array.from(get().expandedCategories),
            showBanner: get().showBanner,
            deletedItemIds: Array.from(get().deletedItemIds)
          })
        }
      },

      updateItemStatus: (itemId, status) =>
        set((state) => {
          if (!currentStoreId) return state
          const updated = {
            categories: state.categories.map((category) => ({
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, status } : item
              )
            })),
            deletedItemIds: state.deletedItemIds
          }
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              ...updated,
              expandedCategories: Array.from(state.expandedCategories),
              showBanner: state.showBanner
            })
          }
          return updated
        }),

      toggleCategory: (categoryId) =>
        set((state) => {
          if (!currentStoreId) return state
          const currentSet =
            state.expandedCategories instanceof Set
              ? (state.expandedCategories as Set<string>)
              : new Set<string>(state.expandedCategories as any)
          const newExpanded = new Set<string>(currentSet)
          if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
          } else {
            newExpanded.add(categoryId)
          }
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              categories: state.categories,
              expandedCategories: Array.from(newExpanded),
              showBanner: state.showBanner
            })
          }
          return { expandedCategories: newExpanded }
        }),

      setShowBanner: (show) => {
        if (!currentStoreId) return
        set({ showBanner: show })
        if (typeof window !== 'undefined') {
          setStoreScopedStorage(currentStoreId, 'menu', {
            categories: get().categories,
            expandedCategories: Array.from(get().expandedCategories),
            showBanner: show
          })
        }
      },

      addItem: (categoryId, item) =>
        set((state) => {
          if (!currentStoreId) return state
          const updated = {
            categories: state.categories.map((category) =>
              category.id === categoryId
                ? { ...category, items: [...category.items, item] }
                : category
            ),
            deletedItemIds: state.deletedItemIds
          }
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              ...updated,
              expandedCategories: Array.from(state.expandedCategories),
              showBanner: state.showBanner
            })
          }
          return updated
        }),

      updateItem: (itemId, updates) =>
        set((state) => {
          if (!currentStoreId) return state
          const updated = {
            categories: state.categories.map((category) => ({
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            })),
            deletedItemIds: state.deletedItemIds
          }
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              ...updated,
              expandedCategories: Array.from(state.expandedCategories),
              showBanner: state.showBanner
            })
          }
          return updated
        }),

      deleteItem: (itemId) =>
        set((state) => {
          if (!currentStoreId) return state
          const updatedDeleted = new Set(state.deletedItemIds)
          updatedDeleted.add(itemId)
          const updated = {
            categories: state.categories.map((category) => ({
              ...category,
              items: category.items.filter((item) => item.id !== itemId)
            })),
            deletedItemIds: updatedDeleted
          }
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              ...updated,
              expandedCategories: Array.from(state.expandedCategories),
              showBanner: state.showBanner
            })
          }
          return updated
        }),

      addDeletedItem: (itemId) =>
        set((state) => {
          if (!currentStoreId) return state
          const updatedDeleted = new Set(state.deletedItemIds)
          updatedDeleted.add(itemId)
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'menu', {
              categories: state.categories,
              expandedCategories: Array.from(state.expandedCategories),
              showBanner: state.showBanner,
              deletedItemIds: Array.from(updatedDeleted)
            })
          }
          return { deletedItemIds: updatedDeleted }
        })
    }),
    {
      name: MerchantStorageKeys.MENU,
      getStorage: scopedStorage,
      // Custom serialization for Set
      partialize: (state): Partial<MerchantMenuStore> => ({
        categories: state.categories,
        expandedCategories: Array.from(state.expandedCategories) as unknown as Set<string>,
        showBanner: state.showBanner,
        deletedItemIds: Array.from(state.deletedItemIds) as unknown as Set<string>
      }),
      // Custom deserialization for Set
      onRehydrateStorage: () => (state) => {
        if (state && state.expandedCategories && !(state.expandedCategories instanceof Set)) {
          state.expandedCategories = new Set(state.expandedCategories as string[])
        }
        if (state && state.deletedItemIds && !(state.deletedItemIds instanceof Set)) {
          state.deletedItemIds = new Set(state.deletedItemIds as string[])
        }
      }
    }
  )
)

// Listen for store changes and reload data
if (typeof window !== 'undefined') {
  window.addEventListener('storeDataLoaded', ((event: CustomEvent<{ storeId: string, storeData: StoreMerchantData }>) => {
    const { storeId, storeData } = event.detail
    currentStoreId = storeId
    
    // Load store-specific data from localStorage or use default from storeData
    const storageKey = `merchant.${storeId}.menu`
    let storedData = storeData.menu
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        storedData = JSON.parse(stored)
      }
    } catch (e) {
      // Use default from storeData
    }
    
    const categories = (storedData.categories || []).map((cat: any) => ({
      ...cat,
      items: (cat.items || []).map((item: any) => ({
        ...item,
        status: item.status as ItemStatus
      }))
    }))

    useMerchantMenuStore.getState().setCategories(categories)
    useMerchantMenuStore.getState().setShowBanner(storedData.showBanner)
    const storedDeleted = (storedData as any)?.deletedItemIds
    if (storedDeleted) {
      const ids = new Set<string>(storedDeleted as string[])
      useMerchantMenuStore.setState({ deletedItemIds: ids })
    }
  }) as EventListener)
}

