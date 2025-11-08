'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Deal, getDealsByRestaurantId, getCommonDeals, dashpassDeal, deals } from '@/constants/deals';

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
  getAppliedDeal: (cartId: string) => Deal | null;
  getAppliedDealId: (cartId: string) => string | null;
  getFreeItemIds: (cartId: string) => string[];
  isFreeItem: (cartId: string, itemId: string) => boolean;
  getAllDeals: () => Deal[];
  getDealsByRestaurantId: (restaurantId: string) => Deal[];
  getCommonDeals: () => Deal[];
  getDashpassDeal: () => Deal;
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

        getAppliedDeal: (cartId: string) => {
          const state = get();
          const appliedDeal = state.appliedDeals.find(deal => deal.cartId === cartId);
          if (!appliedDeal) return null;

          // Find the deal from constants
          const allDeals = [...deals, dashpassDeal];
          return allDeals.find(deal => deal.id === appliedDeal.dealId) || null;
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

        getAllDeals: () => {
          return [...deals, dashpassDeal];
        },

        getDealsByRestaurantId: (restaurantId: string) => {
          return getDealsByRestaurantId(restaurantId);
        },

        getCommonDeals: () => {
          const commonDeals = getCommonDeals();
          return commonDeals;
        },

        getDashpassDeal: () => {
          return dashpassDeal;
        },
      }),
      {
        name: 'deals-storage',
      }
    )
  )
);

