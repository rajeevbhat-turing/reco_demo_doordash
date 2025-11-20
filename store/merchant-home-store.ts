'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"

interface HomeMetrics {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
}

interface HomeStore {
  metrics: HomeMetrics
  lastUpdated: number
  selectedDateRange: string
  
  // Actions
  setMetrics: (metrics: HomeMetrics) => void
  setLastUpdated: (timestamp: number) => void
  setSelectedDateRange: (range: string) => void
}

const initialMetrics: HomeMetrics = {
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  averageOrderValue: 0
}

export const useMerchantHomeStore = create<HomeStore>()(
  persist(
    (set) => ({
      metrics: initialMetrics,
      lastUpdated: Date.now(),
      selectedDateRange: "Last 7 days",

      setMetrics: (metrics) => set({ metrics }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      setSelectedDateRange: (range) => set({ selectedDateRange: range })
    }),
    {
      name: MerchantStorageKeys.HOME
    }
  )
)

