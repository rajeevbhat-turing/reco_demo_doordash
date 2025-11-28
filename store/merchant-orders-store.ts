'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"
import { merchantStoreData, StoreMerchantData } from "@/constants/merchant-store-data"

export interface Order {
  customer: string
  orderId: string
  orderStatus: "Completed" | "Cancelled - Not Paid" | "Active" | "Scheduled"
  date: string
  time: string
  fulfillmentStatus: string
  fulfillmentType: "Customer pickup" | "DoorDash delivery"
  channel: string
  subtotal: string
}

interface OrdersStore {
  orders: Order[]
  searchQuery: string
  selectedFilter: string
  activeTab: "Active" | "Scheduled" | "History"
  
  // Actions
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
  setSearchQuery: (query: string) => void
  setSelectedFilter: (filter: string) => void
  setActiveTab: (tab: "Active" | "Scheduled" | "History") => void
}

const initialOrders: Order[] = [
  {
    customer: "John Doe",
    orderId: "DD-123456",
    orderStatus: "Completed",
    date: "4/28/2025",
    time: "2:30 PM",
    fulfillmentStatus: "Delivered",
    fulfillmentType: "DoorDash delivery",
    channel: "DoorDash",
    subtotal: "$25.50"
  },
  {
    customer: "Jane Smith",
    orderId: "DD-123457",
    orderStatus: "Cancelled - Not Paid",
    date: "4/27/2025",
    time: "1:15 PM",
    fulfillmentStatus: "Cancelled",
    fulfillmentType: "DoorDash delivery",
    channel: "DoorDash",
    subtotal: "$18.75"
  }
]

let currentStoreId = 'philz-coffee'

export const useMerchantOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      orders: initialOrders,
      searchQuery: "",
      selectedFilter: "All channels",
      activeTab: "Active", // Default to Active tab to show new orders

      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.orderId === orderId ? { ...order, ...updates } : order
          )
        })),
      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.orderId !== orderId)
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      setActiveTab: (tab) => set({ activeTab: tab })
    }),
    {
      name: MerchantStorageKeys.ORDERS
    }
  )
)

// Listen for store changes and reload data
if (typeof window !== 'undefined') {
  window.addEventListener('storeDataLoaded', ((event: CustomEvent<{ storeId: string, storeData: StoreMerchantData }>) => {
    const { storeId, storeData } = event.detail
    currentStoreId = storeId
    
    // Load store-specific data from localStorage or use default from storeData
    const storageKey = `merchant.${storeId}.orders`
    let storedData = storeData.orders
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        storedData = JSON.parse(stored)
      }
    } catch (e) {
      // Use default from storeData
    }
    
    useMerchantOrdersStore.getState().setOrders(storedData.orders)
    useMerchantOrdersStore.getState().setSearchQuery(storedData.searchQuery)
    useMerchantOrdersStore.getState().setSelectedFilter(storedData.selectedFilter)
    useMerchantOrdersStore.getState().setActiveTab(storedData.activeTab)
  }) as EventListener)
}

