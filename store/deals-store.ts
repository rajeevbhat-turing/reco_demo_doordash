'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface AppliedDeal {
  dealId: string;
  cartId: string; // storeId + category combination
  appliedAt: number;
  freeItemIds?: string[]; // IDs of free items added to cart
}

interface DealsStore {
  // State
  appliedDeals: AppliedDeal[];

  // Actions
  applyDeal: (dealId: string, cartId: string, freeItemIds?: string[]) => void;
  removeDeal: (cartId: string) => void;
  getAppliedDealId: (cartId: string) => string | null;
  getFreeItemIds: (cartId: string) => string[];
  isFreeItem: (cartId: string, itemId: string) => boolean;
}

export const useDealsStore = create<DealsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        appliedDeals: [],

        // Actions
        applyDeal: (dealId: string, cartId: string, freeItemIds?: string[]) => {
          const state = get();
          // Remove any existing deal for this cart
          const filteredDeals = state.appliedDeals.filter(deal => deal.cartId !== cartId);
          // Add new deal
          set({
            appliedDeals: [
              ...filteredDeals,
              {
                dealId,
                cartId,
                appliedAt: Date.now(),
                freeItemIds: freeItemIds || [],
              },
            ],
          });
        },

        removeDeal: (cartId: string) => {
          const state = get();
          set({
            appliedDeals: state.appliedDeals.filter(deal => deal.cartId !== cartId),
          });
        },

        getAppliedDealId: (cartId: string) => {
          const state = get();
          const appliedDeal = state.appliedDeals.find(deal => deal.cartId === cartId);
          return appliedDeal?.dealId || null;
        },

        getFreeItemIds: (cartId: string) => {
          const state = get();
          const appliedDeal = state.appliedDeals.find(deal => deal.cartId === cartId);
          return appliedDeal?.freeItemIds || [];
        },

        isFreeItem: (cartId: string, itemId: string) => {
          const state = get();
          const appliedDeal = state.appliedDeals.find(deal => deal.cartId === cartId);
          return appliedDeal?.freeItemIds?.includes(itemId) || false;
        },
      }),
      {
        name: 'deals-storage',
      }
    )
  )
);
