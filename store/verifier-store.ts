import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { CartItem } from './cart-store';

// Verifier store interface
interface VerifierStore {
  // State
  lastClearInfo: { itemsBeforeClear: number; timestamp: number } | null;
  maxItemsReached: number;
  verifierConsumed: boolean;
  lastSearchInfo: { searchTerm: string; timestamp: number; navigatedFromSearch: boolean } | null;
  searchVerifierConsumed: boolean;
  lastRemovalInfo: { removedItems: CartItem[]; timestamp: number } | null;
  removalVerifierConsumed: boolean;
  lastQuantityChangeInfo: {
    itemName: string;
    oldQuantity: number;
    newQuantity: number;
    timestamp: number;
  } | null;
  quantityVerifierConsumed: boolean;
  lastOrderInfo: {
    orderId: string;
    tipAmount: number;
    orderTotal: number;
    timestamp: number;
    isCompleted: boolean;
    storeName: string;
    category: string;
    items: CartItem[];
  } | null;
  orderVerifierConsumed: boolean;
  lastCheckoutInfo: {
    timestamp: number;
    tipAmount: number;
    navigatedToCheckout: boolean;
    deliveryTime?: string;
  } | null;
  checkoutVerifierConsumed: boolean;

  // Verifier methods
  markVerifierConsumed: () => void;
  recordSearch: (searchTerm: string) => void;
  recordNavigationFromSearch: () => void;
  markSearchVerifierConsumed: () => void;
  markRemovalVerifierConsumed: () => void;
  markQuantityVerifierConsumed: () => void;
  recordOrderCompletion: (orderInfo: {
    orderId: string;
    tipAmount: number;
    orderTotal: number;
    storeName: string;
    category: string;
    items: CartItem[];
  }) => void;
  markOrderVerifierConsumed: () => void;
  recordCheckoutNavigation: () => void;
  recordTipSelection: (tipAmount: number) => void;
  recordDeliveryTimeSelection: (deliveryTime: string) => void;
  markCheckoutVerifierConsumed: () => void;

  // Clear/reset methods
  recordClearInfo: (itemsBeforeClear: number) => void;
  resetClearInfo: () => void;
  updateMaxItemsReached: (itemCount: number) => void;
  resetMaxItemsReached: () => void;
  recordRemoval: (removedItems: CartItem[]) => void;
  recordQuantityChange: (itemName: string, oldQuantity: number, newQuantity: number) => void;
  resetVerifierConsumed: () => void;
}

export const useVerifierStore = create<VerifierStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        lastClearInfo: null,
        maxItemsReached: 0,
        verifierConsumed: false,
        lastSearchInfo: null,
        searchVerifierConsumed: false,
        lastRemovalInfo: null,
        removalVerifierConsumed: false,
        lastQuantityChangeInfo: null,
        quantityVerifierConsumed: false,
        lastOrderInfo: null,
        orderVerifierConsumed: false,
        lastCheckoutInfo: null,
        checkoutVerifierConsumed: false,

        // General verifier consumption tracking
        markVerifierConsumed: () => {
          set({ verifierConsumed: true });
        },

        resetVerifierConsumed: () => {
          set({ verifierConsumed: false });
        },

        // Search tracking methods
        recordSearch: (searchTerm: string) => {
          console.log(`[SEARCH] Recording search for: ${searchTerm}`);
          set({
            lastSearchInfo: {
              searchTerm,
              timestamp: Date.now(),
              navigatedFromSearch: false,
            },
            searchVerifierConsumed: false, // Reset consumption on new search
          });
        },

        recordNavigationFromSearch: () => {
          const { lastSearchInfo } = get();
          if (lastSearchInfo) {
            console.log(
              `[SEARCH] Recording navigation from search for: ${lastSearchInfo.searchTerm}`
            );
            set({
              lastSearchInfo: {
                ...lastSearchInfo,
                navigatedFromSearch: true,
              },
            });
          }
        },

        markSearchVerifierConsumed: () => {
          set({ searchVerifierConsumed: true });
        },

        // Clear tracking methods
        recordClearInfo: (itemsBeforeClear: number) => {
          console.log(`[CART] Recording clear info with ${itemsBeforeClear} items before clear`);
          set({
            lastClearInfo: { itemsBeforeClear, timestamp: Date.now() },
            verifierConsumed: false,
          });
        },

        resetClearInfo: () => {
          set({ lastClearInfo: null });
        },

        // Max items tracking
        updateMaxItemsReached: (itemCount: number) => {
          const { maxItemsReached } = get();
          const newMax = Math.max(maxItemsReached, itemCount);
          if (newMax !== maxItemsReached) {
            set({ maxItemsReached: newMax });
          }
        },

        resetMaxItemsReached: () => {
          set({ maxItemsReached: 0 });
        },

        // Removal tracking methods
        recordRemoval: (removedItems: CartItem[]) => {
          console.log(`[CART] Recording removal of ${removedItems.length} item(s)`);
          set({
            lastRemovalInfo: { removedItems, timestamp: Date.now() },
            removalVerifierConsumed: false,
          });
        },

        markRemovalVerifierConsumed: () => {
          set({ removalVerifierConsumed: true });
        },

        // Quantity change tracking methods
        recordQuantityChange: (itemName: string, oldQuantity: number, newQuantity: number) => {
          console.log(
            `[CART] Recording quantity change for ${itemName}: ${oldQuantity} -> ${newQuantity}`
          );
          set({
            lastQuantityChangeInfo: {
              itemName,
              oldQuantity,
              newQuantity,
              timestamp: Date.now(),
            },
            quantityVerifierConsumed: false,
          });
        },

        markQuantityVerifierConsumed: () => {
          set({ quantityVerifierConsumed: true });
        },

        // Order completion tracking methods
        recordOrderCompletion: (orderInfo: {
          orderId: string;
          tipAmount: number;
          orderTotal: number;
          storeName: string;
          category: string;
          items: CartItem[];
        }) => {
          console.log(`[ORDER] Recording order completion:`, orderInfo);
          set({
            lastOrderInfo: {
              ...orderInfo,
              timestamp: Date.now(),
              isCompleted: true,
            },
            // Reset orderVerifierConsumed for new orders so the verifier can be tested again
            orderVerifierConsumed: false,
          });
        },

        markOrderVerifierConsumed: () => {
          set({ orderVerifierConsumed: true });
        },

        // Checkout tracking methods
        recordCheckoutNavigation: () => {
          console.log('[CHECKOUT] Recording checkout navigation');
          set({
            lastCheckoutInfo: {
              timestamp: Date.now(),
              tipAmount: 0, // Default tip amount, will be updated when tip is selected
              navigatedToCheckout: true,
            },
            checkoutVerifierConsumed: false,
          });
        },

        recordTipSelection: (tipAmount: number) => {
          console.log(`[CHECKOUT] Recording tip selection: $${tipAmount}`);
          const { lastCheckoutInfo } = get();
          set({
            lastCheckoutInfo: {
              timestamp: lastCheckoutInfo?.timestamp || Date.now(),
              tipAmount,
              navigatedToCheckout: lastCheckoutInfo?.navigatedToCheckout || true,
              deliveryTime: lastCheckoutInfo?.deliveryTime,
            },
          });
        },

        recordDeliveryTimeSelection: (deliveryTime: string) => {
          console.log(`[CHECKOUT] Recording delivery time selection: ${deliveryTime}`);
          const { lastCheckoutInfo } = get();
          set({
            lastCheckoutInfo: {
              timestamp: lastCheckoutInfo?.timestamp || Date.now(),
              tipAmount: lastCheckoutInfo?.tipAmount || 0,
              navigatedToCheckout: lastCheckoutInfo?.navigatedToCheckout || true,
              deliveryTime,
            },
          });
        },

        markCheckoutVerifierConsumed: () => {
          set({ checkoutVerifierConsumed: true });
        },
      }),
      {
        name: 'verifier-state',
        partialize: state => ({
          lastClearInfo: state.lastClearInfo,
          maxItemsReached: state.maxItemsReached,
          verifierConsumed: state.verifierConsumed,
          lastSearchInfo: state.lastSearchInfo,
          searchVerifierConsumed: state.searchVerifierConsumed,
          lastRemovalInfo: state.lastRemovalInfo,
          removalVerifierConsumed: state.removalVerifierConsumed,
          lastQuantityChangeInfo: state.lastQuantityChangeInfo,
          quantityVerifierConsumed: state.quantityVerifierConsumed,
          lastOrderInfo: state.lastOrderInfo,
          orderVerifierConsumed: state.orderVerifierConsumed,
          lastCheckoutInfo: state.lastCheckoutInfo,
          checkoutVerifierConsumed: state.checkoutVerifierConsumed,
        }),
        merge: (persistedState: any, currentState) => {
          return {
            ...currentState,
            ...persistedState,
            lastClearInfo: persistedState.lastClearInfo || null,
            maxItemsReached: persistedState.maxItemsReached || 0,
            verifierConsumed: persistedState.verifierConsumed || false,
            lastSearchInfo: persistedState.lastSearchInfo || null,
            searchVerifierConsumed: persistedState.searchVerifierConsumed || false,
            lastRemovalInfo: persistedState.lastRemovalInfo || null,
            removalVerifierConsumed: persistedState.removalVerifierConsumed || false,
            lastQuantityChangeInfo: persistedState.lastQuantityChangeInfo || null,
            quantityVerifierConsumed: persistedState.quantityVerifierConsumed || false,
            lastOrderInfo: persistedState.lastOrderInfo || null,
            orderVerifierConsumed: persistedState.orderVerifierConsumed || false,
            lastCheckoutInfo: persistedState.lastCheckoutInfo || null,
            checkoutVerifierConsumed: persistedState.checkoutVerifierConsumed || false,
          };
        },
      }
    ),
    {
      name: 'VerifierStore',
      enabled: true,
    }
  )
);
