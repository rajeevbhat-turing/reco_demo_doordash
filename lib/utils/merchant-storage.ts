/**
 * Merchant localStorage key structure
 * 
 * All merchant data is stored under the "merchant" namespace with the following structure:
 * 
 * merchant.home - Home page data (dashboards, metrics, etc.)
 * merchant.orders - Orders data
 * merchant.menu - Menu data (categories, items, etc.)
 * merchant.users - User management data
 * merchant.settings - Settings data (account, store, etc.)
 * merchant.financials - Financial data (transactions, statements, etc.)
 * merchant.customers - Customer data (insights, reviews, etc.)
 * merchant.marketing - Marketing data (campaigns, loyalty, etc.)
 * merchant.store-availability - Store availability settings
 */

export const MerchantStorageKeys = {
  HOME: 'merchant.home',
  ORDERS: 'merchant.orders',
  MENU: 'merchant.menu',
  USERS: 'merchant.users',
  SETTINGS: 'merchant.settings',
  FINANCIALS: 'merchant.financials',
  CUSTOMERS: 'merchant.customers',
  MARKETING: 'merchant.marketing',
  STORE_AVAILABILITY: 'merchant.store-availability',
  REQUEST_DELIVERY: 'merchant.request-delivery',
} as const

export type MerchantStorageKey = typeof MerchantStorageKeys[keyof typeof MerchantStorageKeys]

/**
 * Helper function to get a merchant storage key
 */
export function getMerchantStorageKey(key: MerchantStorageKey): string {
  return key
}

/**
 * Helper function to safely get data from localStorage
 */
export function getMerchantStorage<T>(key: MerchantStorageKey, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Helper function to safely set data in localStorage
 */
export function setMerchantStorage<T>(key: MerchantStorageKey, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error)
  }
}

/**
 * Helper function to remove data from localStorage
 */
export function removeMerchantStorage(key: MerchantStorageKey): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}

/**
 * Helper function to clear all merchant data from localStorage
 */
export function clearAllMerchantStorage(): void {
  if (typeof window === 'undefined') return
  
  Object.values(MerchantStorageKeys).forEach(key => {
    localStorage.removeItem(key)
  })
}

