'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"

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
  
  // Actions
  setCategories: (categories: MenuCategory[]) => void
  updateItemStatus: (itemId: string, status: ItemStatus) => void
  toggleCategory: (categoryId: string) => void
  setShowBanner: (show: boolean) => void
  addItem: (categoryId: string, item: MenuItem) => void
  updateItem: (itemId: string, updates: Partial<MenuItem>) => void
  deleteItem: (itemId: string) => void
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

export const useMerchantMenuStore = create<MerchantMenuStore>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      expandedCategories: new Set(["paninis"]),
      showBanner: true,

      setCategories: (categories) => set({ categories }),

      updateItemStatus: (itemId, status) =>
        set((state) => ({
          categories: state.categories.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              item.id === itemId ? { ...item, status } : item
            )
          }))
        })),

      toggleCategory: (categoryId) =>
        set((state) => {
          const currentSet = state.expandedCategories instanceof Set 
            ? state.expandedCategories 
            : new Set(state.expandedCategories as any)
          const newExpanded = new Set(currentSet)
          if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
          } else {
            newExpanded.add(categoryId)
          }
          return { expandedCategories: newExpanded }
        }),

      setShowBanner: (show) => set({ showBanner: show }),

      addItem: (categoryId, item) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId
              ? { ...category, items: [...category.items, item] }
              : category
          )
        })),

      updateItem: (itemId, updates) =>
        set((state) => ({
          categories: state.categories.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }))
        })),

      deleteItem: (itemId) =>
        set((state) => ({
          categories: state.categories.map((category) => ({
            ...category,
            items: category.items.filter((item) => item.id !== itemId)
          }))
        }))
    }),
    {
      name: MerchantStorageKeys.MENU,
      // Custom serialization for Set
      partialize: (state) => ({
        categories: state.categories,
        expandedCategories: Array.from(state.expandedCategories),
        showBanner: state.showBanner
      }),
      // Custom deserialization for Set
      onRehydrateStorage: () => (state) => {
        if (state && state.expandedCategories && !(state.expandedCategories instanceof Set)) {
          state.expandedCategories = new Set(state.expandedCategories as string[])
        }
      }
    }
  )
)

