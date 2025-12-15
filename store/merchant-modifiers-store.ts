'use client'

import { create } from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { MerchantStorageKeys } from '@/lib/utils/merchant-storage'
import { setStoreScopedStorage } from '@/lib/utils/store-scoped-storage'
import { Modifier, StoreMerchantData } from '@/constants/merchant-store-data'

interface MerchantModifiersStore {
  modifiers: Modifier[]

  setModifiers: (modifiers: Modifier[]) => void
  addModifier: (modifier: Modifier) => void
  updateModifier: (modifierId: string, updates: Partial<Modifier>) => void
  deleteModifier: (modifierId: string) => void
  duplicateModifier: (modifierId: string) => void
}

let currentStoreId = ''

const scopedStorage: () => StateStorage = () => {
  const noop: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
  if (typeof window === 'undefined') return noop
  const storeKey = currentStoreId ? `merchant.${currentStoreId}.modifiers` : null
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

const normalizeUsedIn = (modifiers: Modifier[]): Modifier[] =>
  modifiers.map((modifier) => ({
    ...modifier,
    usedIn: (modifier.usedIn || []).map((ref: any) =>
      typeof ref === 'string'
        ? { id: ref, name: ref }
        : {
            id: ref?.id || ref?.name || String(Date.now()),
            name: ref?.name || ref?.id || '',
          }
    ),
  }))

const persistScopedModifiers = (modifiers: Modifier[]) => {
  if (typeof window === 'undefined') return
  setStoreScopedStorage(currentStoreId, 'modifiers', { modifiers })
}

export const useMerchantModifiersStore = create<MerchantModifiersStore>()(
  persist(
    (set, get) => ({
      modifiers: [],

      setModifiers: (modifiers) => {
        if (!currentStoreId) return
        const normalized = normalizeUsedIn(modifiers)
        set({ modifiers: normalized })
        persistScopedModifiers(normalized)
      },

      addModifier: (modifier) => {
        if (!currentStoreId) return
        const normalized = normalizeUsedIn([modifier])[0]
        const updated = [...get().modifiers, normalized]
        set({ modifiers: updated })
        persistScopedModifiers(updated)
      },

      updateModifier: (modifierId, updates) => {
        const updated = get().modifiers.map((modifier) =>
          modifier.id === modifierId ? { ...modifier, ...updates } : modifier
        )
        const normalized = normalizeUsedIn(updated)
        set({ modifiers: normalized })
        persistScopedModifiers(normalized)
      },

      deleteModifier: (modifierId) => {
        const updated = get().modifiers.filter((modifier) => modifier.id !== modifierId)
        set({ modifiers: updated })
        persistScopedModifiers(updated)
      },

      duplicateModifier: (modifierId) => {
        const existing = get().modifiers.find((modifier) => modifier.id === modifierId)
        if (!existing) return

        const clone: Modifier = {
          ...existing,
          id: `${modifierId}-${Date.now()}`,
          name: `${existing.name} Copy`,
        }

        const updated = [...get().modifiers, clone]
        const normalized = normalizeUsedIn(updated)
        set({ modifiers: normalized })
        persistScopedModifiers(normalized)
      },
    }),
    {
      name: MerchantStorageKeys.MODIFIERS,
      getStorage: scopedStorage,
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener(
    'storeDataLoaded',
    ((event: CustomEvent<{ storeId: string; storeData: StoreMerchantData }>) => {
      const { storeId, storeData } = event.detail
      currentStoreId = storeId

      const storageKey = `merchant.${storeId}.modifiers`
      let storedData = storeData.modifiers

      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          storedData = JSON.parse(stored)
        }
      } catch (e) {
        // Use default data from storeData if parsing fails
      }

      if (storedData?.modifiers) {
        useMerchantModifiersStore.getState().setModifiers(storedData.modifiers)
      } else {
        const fallback = storeData.modifiers?.modifiers || []
        useMerchantModifiersStore.getState().setModifiers(fallback)
      }
    }) as EventListener
  )
}


