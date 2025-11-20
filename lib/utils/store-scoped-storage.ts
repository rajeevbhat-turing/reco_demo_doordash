/**
 * Store-scoped localStorage utilities
 * All merchant data is scoped by store ID: merchant.{storeId}.{section}
 */

import { MerchantStorageKeys } from './merchant-storage'

/**
 * Get a store-scoped storage key
 */
export function getStoreScopedKey(storeId: string, section: string): string {
  return `merchant.${storeId}.${section}`
}

/**
 * Get store-scoped data from localStorage
 */
export function getStoreScopedStorage<T>(storeId: string, section: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  const key = getStoreScopedKey(storeId, section)
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
 * Set store-scoped data in localStorage
 */
export function setStoreScopedStorage<T>(storeId: string, section: string, value: T): void {
  if (typeof window === 'undefined') return
  
  const key = getStoreScopedKey(storeId, section)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error)
  }
}

/**
 * Remove store-scoped data from localStorage
 */
export function removeStoreScopedStorage(storeId: string, section: string): void {
  if (typeof window === 'undefined') return
  
  const key = getStoreScopedKey(storeId, section)
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}

