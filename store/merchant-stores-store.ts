'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MerchantStore {
  id: string;
  storeName: string;
  storeAddress: string;
  email: string;
  phone: string;
  businessType: string;
  ownerId: string; // merchant user id
  createdAt: string;
  // Location coordinates from selected address
  lat?: number;
  lng?: number;
  // Store hours (populated during onboarding)
  openingHours?: {
    open: string;
    close: string;
  };
}

interface MerchantStoresStore {
  stores: MerchantStore[];
  addStore: (store: Omit<MerchantStore, 'id' | 'createdAt'>) => string;
  updateStoreHours: (storeId: string, openingHours: { open: string; close: string }) => void;
  getStoresByOwnerId: (ownerId: string) => MerchantStore[];
  getStoreById: (id: string) => MerchantStore | undefined;
}

// Generate unique store ID
const generateStoreId = () => {
  return `store-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useMerchantStoresStore = create<MerchantStoresStore>()(
  persist(
    (set, get) => ({
      stores: [],

      addStore: storeData => {
        const newStore: MerchantStore = {
          ...storeData,
          id: generateStoreId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ stores: [...state.stores, newStore] }));
        return newStore.id;
      },

      updateStoreHours: (storeId, openingHours) => {
        set(state => ({
          stores: state.stores.map(store =>
            store.id === storeId ? { ...store, openingHours } : store
          ),
        }));
      },

      getStoresByOwnerId: ownerId => {
        return get().stores.filter(store => store.ownerId === ownerId);
      },

      getStoreById: id => {
        return get().stores.find(store => store.id === id);
      },
    }),
    {
      name: 'merchant-stores',
    }
  )
);
