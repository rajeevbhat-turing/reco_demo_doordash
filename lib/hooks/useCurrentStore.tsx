'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react'
import { useMerchantPersistedState } from './useMerchantPersistedState'
import { merchantStoreData, StoreMerchantData } from '@/constants/merchant-store-data'
import { initializeStoreData, loadStoreDataIntoStores } from '@/lib/utils/store-data-loader'

interface CurrentStoreContextType {
  currentStoreId: string
  setCurrentStoreId: (storeId: string) => void
  currentStoreData: StoreMerchantData | null
}

// Default store ID
const DEFAULT_STORE_ID = 'philz-coffee'

// Get default store data
const getDefaultStoreData = (storeId: string): StoreMerchantData | null => {
  return merchantStoreData[storeId] || merchantStoreData[DEFAULT_STORE_ID] || null
}

// Create context with default value to prevent "must be used within provider" errors
const CurrentStoreContext = createContext<CurrentStoreContextType>({
  currentStoreId: DEFAULT_STORE_ID,
  setCurrentStoreId: () => {},
  currentStoreData: getDefaultStoreData(DEFAULT_STORE_ID)
})

export function CurrentStoreProvider({ children }: { children: ReactNode }) {
  const [currentStoreId, setCurrentStoreId] = useMerchantPersistedState('app', 'store', 'currentStoreId', DEFAULT_STORE_ID)
  
  // Initialize store data immediately with default, then update in useEffect
  const [currentStoreData, setCurrentStoreData] = useState<StoreMerchantData | null>(() => {
    // Initialize with default store data immediately
    return getDefaultStoreData(currentStoreId)
  })

  useEffect(() => {
    // Initialize store data in localStorage if needed
    initializeStoreData(currentStoreId)
    
    // Load store data
    const storeData = merchantStoreData[currentStoreId]
    if (storeData) {
      setCurrentStoreData(storeData)
      // Trigger store updates
      loadStoreDataIntoStores(currentStoreId)
    } else {
      // Fallback to default if store not found
      const defaultData = getDefaultStoreData(DEFAULT_STORE_ID)
      if (defaultData) {
        setCurrentStoreData(defaultData)
        loadStoreDataIntoStores(DEFAULT_STORE_ID)
      }
    }
  }, [currentStoreId])

  // Note: currentStoreId can be either:
  // 1. Numeric ID as string from database (e.g., "24") - used when restaurant is selected from StoreSelector
  // 2. Slug from merchant-store-data (e.g., "philz-coffee") - used for initialization
  // Components should handle both by finding the restaurant first

  const handleSetStoreId = (storeId: string) => {
    setCurrentStoreId(storeId)
    // Data will be loaded in useEffect
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentStoreId,
    setCurrentStoreId: handleSetStoreId,
    currentStoreData
  }), [currentStoreId, currentStoreData])

  return (
    <CurrentStoreContext.Provider value={contextValue}>
      {children}
    </CurrentStoreContext.Provider>
  )
}

export function useCurrentStore() {
  const context = useContext(CurrentStoreContext)
  // No need to check for undefined since we provide a default value
  return context
}

