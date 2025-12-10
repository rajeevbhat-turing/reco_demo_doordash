'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { DeliveryPartner, DeliveryPayoutMethod } from '@/lib/types/delivery-types';

interface DeliveryPartnerStore {
  // State
  partners: DeliveryPartner[];
  currentPartner: DeliveryPartner | null;
  isInitialized: boolean;

  // Actions
  getPartner: (partnerId: string) => DeliveryPartner | null;
  getPartnerByEmail: (email: string) => DeliveryPartner | null;
  getAllPartners: () => DeliveryPartner[];
  setCurrentPartner: (partner: DeliveryPartner | null) => void;
  addPartner: (partner: DeliveryPartner, setAsCurrent: boolean) => void;
  updatePartner: (id: string, updatedPartner: Partial<DeliveryPartner>) => void;
  isAuthenticated: () => boolean;
  logout: () => void;
  clearPartners: () => void;
}

export const useDeliveryPartnerStore = create<DeliveryPartnerStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        partners: [],
        currentPartner: null,
        isInitialized: false,

        // Actions
        getPartner: (partnerId: string) => {
          const state = get();
          return state.partners.find(partner => partner.id === partnerId) || null;
        },

        getPartnerByEmail: (email: string) => {
          const state = get();
          return state.partners.find(partner => partner.email.toLowerCase() === email.toLowerCase()) || null;
        },

        getAllPartners: () => {
          const state = get();
          return state.partners;
        },

        setCurrentPartner: (partner: DeliveryPartner | null) => {
          set({
            currentPartner: partner,
            isInitialized: partner !== null ? true : get().isInitialized,
          });
        },

        addPartner: (partner: DeliveryPartner, setAsCurrent: boolean) => {
          set(state => ({
            partners: [...state.partners, partner],
            currentPartner: setAsCurrent ? partner : state.currentPartner,
            isInitialized: true,
          }));
        },

        updatePartner: (id: string, updatedPartner: Partial<DeliveryPartner>) => {
          const state = get();
          const isCurrentPartner = state.currentPartner?.id === id;

          if (isCurrentPartner && state.currentPartner) {
            const partnerExists = state.partners.some(p => p.id === id);
            const updatedCurrentPartner: DeliveryPartner = { ...state.currentPartner, ...updatedPartner };

            if (partnerExists) {
              set({
                partners: state.partners.map(partner =>
                  partner.id === id ? updatedCurrentPartner : partner
                ),
                currentPartner: updatedCurrentPartner,
              });
            } else {
              set({
                currentPartner: updatedCurrentPartner,
                partners: [...state.partners, updatedCurrentPartner],
              });
            }
          } else {
            const partnerExists = state.partners.some(p => p.id === id);

            if (partnerExists) {
              set({
                partners: state.partners.map(partner =>
                  partner.id === id ? { ...partner, ...updatedPartner } as DeliveryPartner : partner
                ),
              });
            }
          }
        },

        isAuthenticated: () => {
          return get().currentPartner !== null;
        },

        logout: () => {
          set({ currentPartner: null });
        },

        clearPartners: () => {
          set({ partners: [], currentPartner: null, isInitialized: false });
        },
      }),
      {
        // Using 'delivery-partner-store' as the localStorage key with 'delivery' prefix
        name: 'delivery-partner-store',
        partialize: state => ({
          partners: state.partners,
          currentPartner: state.currentPartner,
          isInitialized: state.isInitialized,
        }),
      }
    ),
    {
      name: 'delivery-partner-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

