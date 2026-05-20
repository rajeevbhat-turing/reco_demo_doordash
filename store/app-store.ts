import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Cart category type (imported from cart-store concept)
export type CartCategory = 'restaurant';

// Search result interface for storing search results
export interface SearchResult {
  id: string;
  name: string;
  logo: string;
  description: string;
  dashPass?: boolean;
  type: 'restaurant' | 'menu-item';
  restaurantId?: string;
  matchedItem?: string;
  categories?: string[];
  priceRange?: string;
}

// Application store interface
interface AppStore {
  // State
  searchResults: SearchResult[];
  currentStore: Record<string, any>;
  currentCategory: CartCategory | null;
  visitedStores: string[];
  routeBeforeAuth: string | null;
  /** Phase 3 demo: which reco engine, if any, is re-ranking /home. */
  activeRecoEngine: string | null;

  // Search methods
  updateSearchResults: (results: SearchResult[]) => void;
  clearSearchResults: () => void;

  // Store management methods
  setCurrentStore: (store: Record<string, any>, category?: CartCategory) => void;
  clearCurrentStore: () => void;

  // Route management methods
  setRouteBeforeAuth: (path: string | null) => void;

  // Reco demo
  setActiveRecoEngine: (name: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        searchResults: [],
        currentStore: {},
        currentCategory: null,
        visitedStores: [],
        routeBeforeAuth: null,
        activeRecoEngine: null,

        // Update search results
        updateSearchResults: (results: SearchResult[]) => {
          set({ searchResults: results });
        },

        // Clear search results
        clearSearchResults: () => {
          set({ searchResults: [] });
        },

        // Set current store object and category
        setCurrentStore: (store: Record<string, any>, category?: CartCategory) => {
          console.log(
            `[STORE] Setting current store: ${store.name}${category ? ` with category: ${category}` : ''}`
          );

          const { visitedStores } = get();

          // Add store to visitedStores if it has an id
          if (store.id) {
            // Check if store is already in visitedStores to avoid duplicates
            const existingStoreIndex = visitedStores.findIndex(
              visitedStoreId => visitedStoreId === store.id
            );

            let newVisitedStores;
            if (existingStoreIndex >= 0) {
              // Move existing store to the beginning of the array
              newVisitedStores = [
                store.id,
                ...visitedStores.filter((_, index) => index !== existingStoreIndex),
              ];
            } else {
              // Add new store to the beginning of the array
              newVisitedStores = [store.id, ...visitedStores];
            }

            console.log(`[STORE] Added to visited stores: ${store.id}`);

            set({
              currentStore: store,
              currentCategory: category || null,
              visitedStores: newVisitedStores,
            });
          } else {
            // If store doesn't have required fields, just set currentStore without updating visitedStores
            set({
              currentStore: store,
              currentCategory: category || null,
            });
          }
        },

        // Clear current store object and category
        clearCurrentStore: () => {
          set({
            currentStore: {},
            currentCategory: null,
          });
        },

        // Set route before auth (for redirecting after authentication)
        setRouteBeforeAuth: (path: string | null) => {
          set({ routeBeforeAuth: path });
        },

        // Reco demo: pick which engine re-ranks /home (null = production behaviour)
        setActiveRecoEngine: (name: string | null) => {
          set({ activeRecoEngine: name });
        },
      }),
      {
        name: 'app-state',
        partialize: state => ({
          searchResults: state.searchResults,
          currentStore: state.currentStore,
          currentCategory: state.currentCategory,
          visitedStores: state.visitedStores,
          routeBeforeAuth: state.routeBeforeAuth,
          activeRecoEngine: state.activeRecoEngine,
        }),
      }
    ),
    {
      name: 'AppStore',
      enabled: true,
    }
  )
);
