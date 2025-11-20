/**
 * Utility functions for loading store-specific data
 */

import { merchantStoreData, StoreMerchantData } from '@/constants/merchant-store-data'

/**
 * Get store-specific data by store ID
 */
export function getStoreData(storeId: string): StoreMerchantData | null {
  return merchantStoreData[storeId] || null
}

/**
 * Initialize store data if it doesn't exist in localStorage
 */
export function initializeStoreData(storeId: string) {
  const storeData = merchantStoreData[storeId]
  if (!storeData) return

  // Initialize each store's data section if not already present
  const storageKeys = [
    `merchant.${storeId}.home`,
    `merchant.${storeId}.orders`,
    `merchant.${storeId}.menu`,
    `merchant.${storeId}.users`,
    `merchant.${storeId}.settings`,
    `merchant.${storeId}.store-availability`
  ]

  storageKeys.forEach((key, index) => {
    if (typeof window === 'undefined') return
    
    const existing = localStorage.getItem(key)
    if (!existing) {
      const dataSection = [
        storeData.home,
        storeData.orders,
        storeData.menu,
        storeData.users,
        storeData.settings,
        storeData.storeAvailability
      ][index]
      
      if (dataSection) {
        localStorage.setItem(key, JSON.stringify(dataSection))
      }
    }
  })
}

/**
 * Load store data into stores when store changes
 */
export function loadStoreDataIntoStores(storeId: string) {
  const storeData = merchantStoreData[storeId]
  if (!storeData) return

  // Dispatch custom event that stores can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storeDataLoaded', {
      detail: { storeId, storeData }
    }))
  }
}

