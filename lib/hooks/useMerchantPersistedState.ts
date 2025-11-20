import { useState, useEffect } from 'react'
import { getMerchantStorage, setMerchantStorage } from '@/lib/utils/merchant-storage'

/**
 * Hook for persisting component-level state to localStorage
 * Uses the merchant storage structure: merchant.{section}.{component}.{field}
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useMerchantPersistedState(
 *   'orders',
 *   'search',
 *   'query',
 *   ''
 * )
 */
export function useMerchantPersistedState<T>(
  section: string,
  component: string,
  field: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `merchant.${section}.${component}.${field}` as any
  
  const [value, setValue] = useState<T>(defaultValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (isHydrated) return

    const storedValue = getMerchantStorage(storageKey, defaultValue)
    setValue(storedValue)
    setIsHydrated(true)
  }, [storageKey, defaultValue, isHydrated])

  // Persist to localStorage when value changes
  useEffect(() => {
    if (!isHydrated) return
    setMerchantStorage(storageKey, value)
  }, [value, storageKey, isHydrated])

  const setPersistedValue = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue
      return resolvedValue
    })
  }

  return [value, setPersistedValue]
}

/**
 * Hook for persisting multiple fields at once
 * 
 * @example
 * const [state, setState] = useMerchantPersistedStates('orders', 'filters', {
 *   searchQuery: '',
 *   selectedFilter: 'All channels',
 *   activeTab: 'History'
 * })
 */
export function useMerchantPersistedStates<T extends Record<string, any>>(
  section: string,
  component: string,
  defaultValues: T
): [T, (updates: Partial<T> | ((prev: T) => T)) => void] {
  const [values, setValues] = useState<T>(defaultValues)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (isHydrated) return

    const storedValues: Partial<T> = {}
    Object.keys(defaultValues).forEach((key) => {
      const storageKey = `merchant.${section}.${component}.${key}` as any
      storedValues[key as keyof T] = getMerchantStorage(storageKey, defaultValues[key])
    })
    
    setValues({ ...defaultValues, ...storedValues })
    setIsHydrated(true)
  }, [section, component, defaultValues, isHydrated])

  // Persist to localStorage when values change
  useEffect(() => {
    if (!isHydrated) return
    
    Object.keys(values).forEach((key) => {
      const storageKey = `merchant.${section}.${component}.${key}` as any
      setMerchantStorage(storageKey, values[key])
    })
  }, [values, section, component, isHydrated])

  const setPersistedValues = (updates: Partial<T> | ((prev: T) => T)) => {
    setValues((prev) => {
      const resolvedUpdates = typeof updates === 'function' 
        ? updates(prev)
        : updates
      return { ...prev, ...resolvedUpdates }
    })
  }

  return [values, setPersistedValues]
}

