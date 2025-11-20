'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"

export interface MerchantUser {
  id: string
  role: string
  email: string
  firstName: string
  lastName: string
}

interface MerchantUsersStore {
  users: MerchantUser[]
  
  // Actions
  setUsers: (users: MerchantUser[]) => void
  addUser: (user: Omit<MerchantUser, 'id'>) => void
  updateUser: (id: string, updates: Partial<MerchantUser>) => void
  deleteUser: (id: string) => void
}

const initialUsers: MerchantUser[] = [
  {
    id: "1",
    role: "Business Admin",
    email: "kkapoor@bombaycafe.com",
    firstName: "Kira",
    lastName: "Kapoor"
  }
]

export const useMerchantUsersStore = create<MerchantUsersStore>()(
  persist(
    (set) => ({
      users: initialUsers,

      setUsers: (users) => set({ users }),

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: Date.now().toString()
            }
          ]
        })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          )
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id)
        }))
    }),
    {
      name: MerchantStorageKeys.USERS
    }
  )
)

