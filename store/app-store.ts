import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"

// Search result interface for storing search results
export interface SearchResult {
  id: string
  name: string
  logo: string
  description: string
  dashPass?: boolean
  type: "restaurant" | "menu-item"
  restaurantId?: string
  matchedItem?: string
  categories?: string[]
  priceRange?: string
}

// Application store interface
interface AppStore {
  // State
  searchResults: SearchResult[]
  currentStore: Record<string, any>
  visitedStores: string[]

  // Search methods
  updateSearchResults: (results: SearchResult[]) => void
  clearSearchResults: () => void

  // Store management methods
  setCurrentStore: (store: Record<string, any>) => void
  clearCurrentStore: () => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        searchResults: [],
        currentStore: {},
        visitedStores: [],

        // Update search results
        updateSearchResults: (results: SearchResult[]) => {
          set({ searchResults: results })
        },

        // Clear search results
        clearSearchResults: () => {
          set({ searchResults: [] })
        },

        // Set current store object
        setCurrentStore: (store: Record<string, any>) => {
          console.log(`[STORE] Setting current store: ${store.name}`)
          
          const { visitedStores } = get()
          
          // Add store to visitedStores if it has an id
          if (store.id) {
            // Check if store is already in visitedStores to avoid duplicates
            const existingStoreIndex = visitedStores.findIndex(visitedStoreId => 
              visitedStoreId === store.id
            )
            
            let newVisitedStores
            if (existingStoreIndex >= 0) {
              // Move existing store to the beginning of the array
              newVisitedStores = [
                store.id,
                ...visitedStores.filter((_, index) => index !== existingStoreIndex)
              ]
            } else {
              // Add new store to the beginning of the array
              newVisitedStores = [store.id, ...visitedStores]
            }
            
            console.log(`[STORE] Added to visited stores: ${store.id}`)
            
            set({ 
              currentStore: store,
              visitedStores: newVisitedStores,
            })
          } else {
            // If store doesn't have required fields, just set currentStore without updating visitedStores
            set({ currentStore: store })
          }
        },

        // Clear current store object
        clearCurrentStore: () => {
          set({ currentStore: {} })
        },
      }),
      {
        name: "app-state",
        partialize: (state) => ({
          searchResults: state.searchResults,
          currentStore: state.currentStore,
          visitedStores: state.visitedStores,
        }),
      },
    ),
    {
      name: "AppStore",
      enabled: true,
    },
  ),
)

