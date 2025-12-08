'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"
import { setStoreScopedStorage } from "@/lib/utils/store-scoped-storage"
import { merchantStoreData, StoreMerchantData } from "@/constants/merchant-store-data"

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

const initialCategories: MenuCategory[] = [
  {
    id: "paninis",
    name: "Paninis",
    items: [
      {
        id: "1",
        name: "Build Your Own Panini",
        image: "/placeholder.jpg",
        pickupPrice: "$15.00",
        deliveryPrice: "$15.00",
        status: "In stock"
      },
      {
        id: "2",
        name: "Peppe Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$18.00",
        deliveryPrice: "$18.00",
        status: "In stock"
      },
      {
        id: "3",
        name: "Meatball Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$17.00",
        deliveryPrice: "$17.00",
        status: "In stock"
      },
      {
        id: "4",
        name: "Olga Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$19.00",
        deliveryPrice: "$19.00",
        status: "In stock"
      },
      {
        id: "5",
        name: "Spicy Salame Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$18.00",
        deliveryPrice: "$18.00",
        status: "In stock"
      },
      {
        id: "6",
        name: "Burrata Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$17.00",
        deliveryPrice: "$17.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "entrees",
    name: "Entrées",
    items: [
      {
        id: "7",
        name: "Chicken Parmesan",
        image: "/placeholder.jpg",
        pickupPrice: "$22.00",
        deliveryPrice: "$22.00",
        status: "In stock"
      },
      {
        id: "8",
        name: "Lasagna",
        image: "/placeholder.jpg",
        pickupPrice: "$20.00",
        deliveryPrice: "$20.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "croissant",
    name: "Limited Edition Filled Croissant",
    items: [
      {
        id: "9",
        name: "Chocolate Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$6.00",
        deliveryPrice: "$6.00",
        status: "In stock"
      },
      {
        id: "10",
        name: "Almond Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$6.50",
        deliveryPrice: "$6.50",
        status: "In stock"
      },
      {
        id: "11",
        name: "Ham & Cheese Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$7.00",
        deliveryPrice: "$7.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      {
        id: "12",
        name: "French Fries",
        image: "/placeholder.jpg",
        pickupPrice: "$5.00",
        deliveryPrice: "$5.00",
        status: "In stock"
      },
      {
        id: "13",
        name: "Side Salad",
        image: "/placeholder.jpg",
        pickupPrice: "$6.00",
        deliveryPrice: "$6.00",
        status: "In stock"
      },
      {
        id: "14",
        name: "Soup of the Day",
        image: "/placeholder.jpg",
        pickupPrice: "$7.00",
        deliveryPrice: "$7.00",
        status: "In stock"
      },
      {
        id: "15",
        name: "Garlic Bread",
        image: "/placeholder.jpg",
        pickupPrice: "$4.00",
        deliveryPrice: "$4.00",
        status: "In stock"
      },
      {
        id: "16",
        name: "Mozzarella Sticks",
        image: "/placeholder.jpg",
        pickupPrice: "$8.00",
        deliveryPrice: "$8.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "beverages",
    name: "Beverages",
    items: Array.from({ length: 28 }, (_, i) => ({
      id: `bev-${i + 1}`,
      name: `Beverage ${i + 1}`,
      image: "/placeholder.jpg",
      pickupPrice: "$3.00",
      deliveryPrice: "$3.00",
      status: "In stock" as ItemStatus
    }))
  }
]

// Store instance - will be updated when store changes
let currentStoreId = 'philz-coffee'

export const useMerchantMenuStore = create<MerchantMenuStore>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      expandedCategories: new Set(["paninis"]),
      showBanner: true,
      deletedItemIds: new Set(),

      setCategories: (categories) => {
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
      // Custom serialization for Set
      partialize: (state) => ({
        categories: state.categories,
        expandedCategories: Array.from(state.expandedCategories),
        showBanner: state.showBanner,
        deletedItemIds: Array.from(state.deletedItemIds)
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
    
    // Set expanded categories
    const expandedSet = new Set(storedData.expandedCategories || [])
    storedData.expandedCategories?.forEach((catId: string) => {
      if (!useMerchantMenuStore.getState().expandedCategories.has(catId)) {
        useMerchantMenuStore.getState().toggleCategory(catId)
      }
    })
  }) as EventListener)
}

