'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { useMerchantPersistedState } from './useMerchantPersistedState';
import { StoreMerchantData } from '@/constants/merchant-store-data';
import { initializeStoreData, loadStoreDataIntoStores } from '@/lib/utils/store-data-loader';

interface CurrentStoreContextType {
  currentStoreId: string;
  setCurrentStoreId: (storeId: string) => void;
  currentStoreData: StoreMerchantData | null;
}

// Default store ID
const DEFAULT_STORE_ID = '';

// Create context with default value to prevent "must be used within provider" errors
const CurrentStoreContext = createContext<CurrentStoreContextType>({
  currentStoreId: DEFAULT_STORE_ID,
  setCurrentStoreId: () => {},
  currentStoreData: null,
});

export function CurrentStoreProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  // Use default value initially to prevent hydration mismatch
  const [currentStoreId, setCurrentStoreId] = useMerchantPersistedState(
    'app',
    'store',
    'currentStoreId',
    DEFAULT_STORE_ID
  );
  const [currentStoreData, setCurrentStoreData] = useState<StoreMerchantData | null>(null);

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !currentStoreId) return;

    let cancelled = false;

    const load = async () => {
      const storeData = await initializeStoreData(currentStoreId);
      if (cancelled) return;
      if (storeData) {
        setCurrentStoreData(storeData);
        loadStoreDataIntoStores(currentStoreId, storeData);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentStoreId, isMounted]);

  // Note: currentStoreId can be either:
  // 1. Numeric ID as string from database (e.g., "24") - used when restaurant is selected from StoreSelector
  // 2. Slug from merchant-store-data (e.g., "philz-coffee") - used for initialization
  // Components should handle both by finding the restaurant first

  const handleSetStoreId = useCallback(
    (storeId: string) => {
      setCurrentStoreId(storeId);
      // Data will be loaded in useEffect
    },
    [setCurrentStoreId]
  );

  // Memoize context value to prevent unnecessary re-renders
  // Use default values during SSR to prevent hydration mismatch
  const contextValue = useMemo(() => {
    // During SSR (before mount), use default values
    if (!isMounted) {
      return {
        currentStoreId: DEFAULT_STORE_ID,
        setCurrentStoreId: handleSetStoreId,
        currentStoreData: null,
      };
    }
    return {
      currentStoreId,
      setCurrentStoreId: handleSetStoreId,
      currentStoreData,
    };
  }, [currentStoreId, currentStoreData, isMounted, handleSetStoreId]);

  return (
    <CurrentStoreContext.Provider value={contextValue}>{children}</CurrentStoreContext.Provider>
  );
}

export function useCurrentStore() {
  const context = useContext(CurrentStoreContext);
  // No need to check for undefined since we provide a default value
  return context;
}
