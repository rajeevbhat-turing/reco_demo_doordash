'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  day: string
  slots: TimeSlot[]
  closed: boolean
}

interface StoreAvailabilityStore {
  storeStatus: "Active" | "Paused" | "Deactivated"
  pauseUntil?: string
  menuHours: DaySchedule[]
  selectedMenu: string
  
  // Actions
  setStoreStatus: (status: "Active" | "Paused" | "Deactivated") => void
  setPauseUntil: (date: string) => void
  setMenuHours: (hours: DaySchedule[]) => void
  updateDaySchedule: (day: string, schedule: DaySchedule) => void
  setSelectedMenu: (menu: string) => void
}

const initialMenuHours: DaySchedule[] = [
  { day: "Monday", slots: [{ start: "07:00 AM", end: "11:00 AM" }, { start: "01:00 PM", end: "08:00 PM" }], closed: false },
  { day: "Tuesday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
  { day: "Wednesday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
  { day: "Thursday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
  { day: "Friday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
  { day: "Saturday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
  { day: "Sunday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false }
]

export const useMerchantStoreAvailabilityStore = create<StoreAvailabilityStore>()(
  persist(
    (set) => ({
      storeStatus: "Paused",
      pauseUntil: "12:16 AM PDT on 4/29/2025",
      menuHours: initialMenuHours,
      selectedMenu: "Grid Iron Waffle | TEST TEST TEST SSME",

      setStoreStatus: (status) => set({ storeStatus: status }),
      setPauseUntil: (date) => set({ pauseUntil: date }),
      setMenuHours: (hours) => set({ menuHours: hours }),
      updateDaySchedule: (day, schedule) =>
        set((state) => ({
          menuHours: state.menuHours.map((h) =>
            h.day === day ? schedule : h
          )
        })),
      setSelectedMenu: (menu) => set({ selectedMenu: menu })
    }),
    {
      name: MerchantStorageKeys.STORE_AVAILABILITY
    }
  )
)

