import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import type { Product } from "@/types"
import { restaurants } from "@/constants/restaurants"
import { convenienceStores } from "@/data/convenience-store-data"

// Define supported cart categories
export type CartCategory = "restaurant" | "grocery" | "retail" | "pets" | "convenience"

// Base cart item interface
export interface CartItem {
  id: number | string
  itemName: string // Renamed from 'name' to 'itemName'
  price: number | string
  image: string
  quantity: number
  storeId?: string
  restaurantId?: string
  storeName?: string // Added storeName property
  customizations?: string
  category: CartCategory // Add category to each cart item
}

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
}

// Category-specific configurations
interface CategoryConfig {
  freeDeliveryThreshold: number
  defaultDeliveryFee: number
  serviceFeePercentage: number
  minServiceFee: number
}

// Default configuration by category
const categoryConfigs: Record<CartCategory, CategoryConfig> = {
  restaurant: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  grocery: {
    freeDeliveryThreshold: 35,
    defaultDeliveryFee: 6.64,
    serviceFeePercentage: 0.15,
    minServiceFee: 5.49,
  },
  retail: {
    freeDeliveryThreshold: 40,
    defaultDeliveryFee: 7.99,
    serviceFeePercentage: 0.12,
    minServiceFee: 4.99,
  },
  pets: {
    freeDeliveryThreshold: 35,
    defaultDeliveryFee: 6.99,
    serviceFeePercentage: 0.14,
    minServiceFee: 5.29,
  },
  convenience: {
    freeDeliveryThreshold: 25,
    defaultDeliveryFee: 4.99,
    serviceFeePercentage: 0.12,
    minServiceFee: 3.99,
  },
}

// Helper function to get store name from restaurant ID
const getStoreNameFromRestaurantId = (restaurantId: string): string => {
  const restaurant = restaurants.find((r) => r.id === restaurantId)
  return restaurant ? restaurant.name : "Unknown Store"
}

// Helper function to get store name from store ID (for grocery/retail/convenience stores)
const getStoreNameFromStoreId = (storeId: string): string => {
  // Check convenience stores first
  if (convenienceStores[storeId]) {
    return convenienceStores[storeId].name
  }
  
  // For other stores, use the existing formatting logic
  return storeId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Cart store interface
interface CartStore {
  // State
  items: CartItem[]
  currentCategory: CartCategory
  currentStoreId: string | null
  currentRestaurantId: string | null
  isGroupOrder: boolean
  groupOrderId: string | null
  searchResults: SearchResult[]
  totalCartValue: number
  // Current store object
  currentStore: Record<string, any>
  // Clear tracking for verifiers
  lastClearInfo: { itemsBeforeClear: number; timestamp: number } | null
  // Track the maximum items reached for verifier support
  maxItemsReached: number
  // Track if verifier has been consumed (passed once already)
  verifierConsumed: boolean
  // Search tracking for search verifiers
  lastSearchInfo: { searchTerm: string; timestamp: number; navigatedFromSearch: boolean } | null
  searchVerifierConsumed: boolean
  // Removal tracking for removal verifiers
  lastRemovalInfo: { removedItems: CartItem[]; timestamp: number } | null
  removalVerifierConsumed: boolean
  // Quantity change tracking for quantity verifiers
  lastQuantityChangeInfo: { itemName: string; oldQuantity: number; newQuantity: number; timestamp: number } | null
  quantityVerifierConsumed: boolean
  
  // Order completion tracking for order verifiers
  lastOrderInfo: { 
    orderId: string
    tipAmount: number
    orderTotal: number
    timestamp: number
    isCompleted: boolean
    storeName: string
    category: string
    items: CartItem[]
  } | null
  orderVerifierConsumed: boolean

  // Category methods
  setCategory: (category: CartCategory) => void
  getConfig: () => CategoryConfig

  // Cart operations
  addItem: (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory, storeName?: string) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void

  // Conflict detection methods
  checkConflict: (
    item: Omit<CartItem, "quantity" | "category">,
    category?: CartCategory,
  ) => {
    hasConflict: boolean
    conflictType: "restaurant" | "store" | null
  }
  replaceCartWithItem: (
    item: Omit<CartItem, "quantity" | "category">,
    category?: CartCategory,
    storeName?: string,
  ) => void

  // Group order methods
  startGroupOrder: () => string
  joinGroupOrder: (groupOrderId: string) => void
  leaveGroupOrder: () => void

  // Cart calculations
  getTotalItems: () => number
  getSubtotal: () => number
  getServiceFee: () => number
  getDeliveryFee: () => number
  getTotal: () => number
  getTotalPrice: () => string

  // Item source checks
  hasDifferentStore: (storeId: string) => boolean
  hasDifferentRestaurant: (restaurantId: string) => boolean

  // Search results methods
  updateSearchResults: (results: SearchResult[]) => void
  clearSearchResults: () => void

  // Update total cart value
  updateTotalCartValue: () => void

  // Current store methods
  setCurrentStore: (store: Record<string, any>) => void
  clearCurrentStore: () => void
  
  // Verifier consumption tracking
  markVerifierConsumed: () => void

  // Search tracking methods
  recordSearch: (searchTerm: string) => void
  recordNavigationFromSearch: () => void
  markSearchVerifierConsumed: () => void
  
  // Removal tracking methods
  markRemovalVerifierConsumed: () => void
  
  // Quantity change tracking methods
  markQuantityVerifierConsumed: () => void
  
  // Order completion tracking methods
  recordOrderCompletion: (orderInfo: {
    orderId: string
    tipAmount: number
    orderTotal: number
    storeName: string
    category: string
    items: CartItem[]
  }) => void
  markOrderVerifierConsumed: () => void
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        items: [],
        currentCategory: "grocery" as CartCategory, // Default to grocery
        currentStoreId: null,
        currentRestaurantId: null,
        isGroupOrder: false,
        groupOrderId: null,
        searchResults: [],
        totalCartValue: 0,
        currentStore: {},
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

        // Set active category without clearing cart
        setCategory: (category: CartCategory) => {
          const { currentCategory } = get()

          // Just update the category, don't clear the cart
          if (currentCategory !== category) {
            console.log(`Changing category from ${currentCategory} to ${category} - keeping cart`)
            set({ currentCategory: category })
          }
        },

        // Get configuration for current category
        getConfig: () => {
          const { currentCategory } = get()
          return categoryConfigs[currentCategory]
        },

        // Add item to cart (without automatic conflict resolution)
        addItem: (item, category, storeName) => {
          const { items, currentCategory, currentStoreId, currentRestaurantId, maxItemsReached } = get()

          console.log(`[CART] Adding item: ${item.itemName}, current cart size: ${items.length}`)

          // Use provided category or default to current category
          const itemCategory = category || currentCategory

          // Handle backward compatibility with 'name' property
          const itemName = item.itemName || "Unknown Item"

          // Determine store name based on available information
          let resolvedStoreName = storeName

          if (!resolvedStoreName) {
            if (item.restaurantId) {
              resolvedStoreName = getStoreNameFromRestaurantId(item.restaurantId)
            } else if (item.storeId) {
              resolvedStoreName = getStoreNameFromStoreId(item.storeId)
            } else {
              resolvedStoreName = "Unknown Store"
            }
          }

          // Standard add to cart logic (for all items)
          const existingItem = items.find((i) => i.id === item.id)

          let newItems
          if (existingItem) {
            // Increment quantity if item already exists
            newItems = items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
          } else {
            // Add new item with quantity 1
            newItems = [
              ...items,
              {
                ...item,
                itemName, // Use the determined itemName
                storeName: resolvedStoreName, // Use resolved storeName
                quantity: 1,
                category: itemCategory,
              },
            ]
          }

          // Calculate new total items
          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0)
          const newMaxItemsReached = Math.max(maxItemsReached, newTotalItems)

          console.log(`[CART] After adding: ${newTotalItems} items, max reached: ${newMaxItemsReached}`)

          // Reset lastClearInfo when adding items after a clear (so verifier only passes once)
          const shouldResetClearInfo = get().lastClearInfo !== null
          if (shouldResetClearInfo) {
            console.log(`[CART] Resetting clear info since new items are being added`)
          }

          set({
            items: newItems,
            currentCategory: itemCategory,
            currentStoreId: item.storeId || currentStoreId,
            currentRestaurantId: item.restaurantId || currentRestaurantId,
            maxItemsReached: newMaxItemsReached,
            lastClearInfo: shouldResetClearInfo ? null : get().lastClearInfo,
            verifierConsumed: false, // Reset verifier consumption when adding items
          })

          // After adding the item, update the total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Remove item from cart
        removeItem: (id) => {
          const { items, maxItemsReached } = get()
          console.log(`[CART] Removing item with id: ${id}, current cart size: ${items.length}`)
          
          // Find the item being removed for tracking
          const removedItem = items.find((item) => item.id === id)
          
          const newItems = items.filter((item) => item.id !== id)
          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0)
          
          console.log(`[CART] After removing: ${newTotalItems} items, max was: ${maxItemsReached}`)
          
          // Track removal for verifiers
          let newLastRemovalInfo = null
          if (removedItem) {
            newLastRemovalInfo = { removedItems: [removedItem], timestamp: Date.now() }
            console.log(`[CART] Recording removal of item: ${removedItem.itemName}`)
          }
          
          // Check if cart became empty after having 3+ items
          let newLastClearInfo = get().lastClearInfo
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            newLastClearInfo = { itemsBeforeClear: maxItemsReached, timestamp: Date.now() }
            console.log(`[CART] Cart became empty after having ${maxItemsReached} items - recording clear info`)
          }

          set({
            items: newItems,
            currentStoreId: newItems.length > 0 ? get().currentStoreId : null,
            currentRestaurantId: newItems.length > 0 ? get().currentRestaurantId : null,
            lastClearInfo: newLastClearInfo,
            lastRemovalInfo: newLastRemovalInfo,
            // Reset maxItemsReached when cart becomes empty
            maxItemsReached: newTotalItems === 0 ? 0 : maxItemsReached,
            verifierConsumed: false, // Reset verifier consumption on any cart change
            removalVerifierConsumed: false, // Reset removal verifier consumption
          })
          // After removing the item, update the total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Update item quantity
        updateQuantity: (id, quantity) => {
          const { items, maxItemsReached } = get()
          console.log(`[CART] Updating quantity for item ${id} to ${quantity}, current cart size: ${items.length}`)

          // Find the item being updated for tracking
          const existingItem = items.find((item) => item.id === id)
          
          let newItems
          let newLastQuantityChangeInfo = null
          
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            newItems = items.filter((item) => item.id !== id)
          } else {
            // Update quantity
            newItems = items.map((item) => (item.id === id ? { ...item, quantity } : item))
            
            // Track quantity change for verifiers
            if (existingItem && existingItem.quantity !== quantity) {
              newLastQuantityChangeInfo = { 
                itemName: existingItem.itemName, 
                oldQuantity: existingItem.quantity, 
                newQuantity: quantity, 
                timestamp: Date.now() 
              }
              console.log(`[CART] Recording quantity change for ${existingItem.itemName}: ${existingItem.quantity} -> ${quantity}`)
            }
          }

          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0)
          console.log(`[CART] After quantity update: ${newTotalItems} items, max was: ${maxItemsReached}`)

          // Check if cart became empty after having 3+ items
          let newLastClearInfo = get().lastClearInfo
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            newLastClearInfo = { itemsBeforeClear: maxItemsReached, timestamp: Date.now() }
            console.log(`[CART] Cart became empty after having ${maxItemsReached} items - recording clear info`)
          }

          set({
            items: newItems,
            currentStoreId: newItems.length > 0 ? get().currentStoreId : null,
            currentRestaurantId: newItems.length > 0 ? get().currentRestaurantId : null,
            lastClearInfo: newLastClearInfo,
            lastQuantityChangeInfo: newLastQuantityChangeInfo,
            // Reset maxItemsReached when cart becomes empty
            maxItemsReached: newTotalItems === 0 ? 0 : maxItemsReached,
            verifierConsumed: false, // Reset verifier consumption on any cart change
            quantityVerifierConsumed: false, // Reset quantity verifier consumption
          })

          // After updating quantity, update the total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Clear cart
        clearCart: () => {
          const { items, maxItemsReached } = get()
          const currentTotalItems = items.reduce((total, item) => total + item.quantity, 0)
          console.log(`[CART] Clearing cart: ${currentTotalItems} items, max was: ${maxItemsReached}`)
          
          const itemsBeforeClear = Math.max(currentTotalItems, maxItemsReached)
          console.log(`[CART] Recording clear info with ${itemsBeforeClear} items before clear`)
          
          set({
            items: [],
            currentStoreId: null,
            currentRestaurantId: null,
            totalCartValue: 0,
            lastClearInfo: { itemsBeforeClear, timestamp: Date.now() },
            maxItemsReached: 0,
            verifierConsumed: false, // Reset verifier consumption on any cart change
          })
        },

        // Start a group order and return the group order ID
        startGroupOrder: () => {
          // Generate a random ID for the group order
          const groupOrderId = Math.random().toString(36).substring(2, 10)

          set({
            isGroupOrder: true,
            groupOrderId,
          })

          return groupOrderId
        },

        // Join an existing group order
        joinGroupOrder: (groupOrderId: string) => {
          set({
            isGroupOrder: true,
            groupOrderId,
            // Keep the items and other cart state since we're joining an existing order
          })
        },

        // Leave a group order
        leaveGroupOrder: () => {
          set({
            isGroupOrder: false,
            groupOrderId: null,
            // Keep the items since the user might want to order for themselves
          })
        },

        // Get total items count
        getTotalItems: () => {
          return get().items.reduce((total, item) => total + item.quantity, 0)
        },

        // Calculate subtotal
        getSubtotal: () => {
          return get().items.reduce((sum, item) => {
            const price =
              typeof item.price === "number"
                ? item.price
                : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
            return sum + price * item.quantity
          }, 0)
        },

        // Calculate service fee
        getServiceFee: () => {
          const { getSubtotal, getConfig } = get()
          const config = getConfig()
          return Math.max(getSubtotal() * config.serviceFeePercentage, config.minServiceFee)
        },

        // Calculate delivery fee
        getDeliveryFee: () => {
          const { getSubtotal, getConfig } = get()
          const config = getConfig()
          return getSubtotal() >= config.freeDeliveryThreshold ? 0 : config.defaultDeliveryFee
        },

        // Calculate total (includes all fees - for checkout)
        getTotal: () => {
          const { getSubtotal, getServiceFee, getDeliveryFee } = get()
          return getSubtotal() + getServiceFee() + getDeliveryFee()
        },

        // Get formatted total price (for cart display - only subtotal, no fees)
        getTotalPrice: () => {
          return `$${get().getSubtotal().toFixed(2)}`
        },

        // Check if item is from a different store
        hasDifferentStore: (storeId: string) => {
          const { currentStoreId } = get()
          return currentStoreId !== null && currentStoreId !== storeId
        },

        // Check if item is from a different restaurant
        hasDifferentRestaurant: (restaurantId: string) => {
          const { currentRestaurantId } = get()
          return currentRestaurantId !== null && currentRestaurantId !== restaurantId
        },

        // Conflict detection methods
        checkConflict: (item, category) => {
          const { currentCategory, currentStoreId, currentRestaurantId, items } = get()

          // If cart is empty, no conflict
          if (items.length === 0) {
            return { hasConflict: false, conflictType: null }
          }

          const itemCategory = category || currentCategory
          let hasConflict = false
          let conflictType: "restaurant" | "store" | null = null

          // Check for category conflicts first
          const existingCategories = [...new Set(items.map((cartItem) => cartItem.category))]

          // If we have items from different categories, that's a conflict
          if (existingCategories.length > 0 && !existingCategories.includes(itemCategory)) {
            hasConflict = true
            // Determine conflict type based on what's in the cart vs what we're adding
            if (existingCategories.includes("restaurant") || itemCategory === "restaurant") {
              conflictType = "restaurant"
            } else {
              conflictType = "store"
            }
          }

          // Check for restaurant conflict (within restaurant category)
          if (
            itemCategory === "restaurant" &&
            item.restaurantId &&
            currentRestaurantId &&
            item.restaurantId !== currentRestaurantId
          ) {
            hasConflict = true
            conflictType = "restaurant"
          }

          // Check for store conflict (within non-restaurant categories)
          if (itemCategory !== "restaurant" && item.storeId && currentStoreId && item.storeId !== currentStoreId) {
            hasConflict = true
            conflictType = "store"
          }

          return { hasConflict, conflictType }
        },

        replaceCartWithItem: (item, category, storeName) => {
          const itemCategory = category || get().currentCategory

          // Handle backward compatibility with 'name' property
          const itemName = item.itemName || "Unknown Item"

          // Determine store name based on available information
          let resolvedStoreName = storeName

          if (!resolvedStoreName) {
            if (item.restaurantId) {
              resolvedStoreName = getStoreNameFromRestaurantId(item.restaurantId)
            } else if (item.storeId) {
              resolvedStoreName = getStoreNameFromStoreId(item.storeId)
            } else {
              resolvedStoreName = "Unknown Store"
            }
          }

          set({
            items: [
              {
                ...item,
                itemName, // Use the determined itemName
                storeName: resolvedStoreName, // Use resolved storeName
                quantity: 1,
                category: itemCategory,
              },
            ],
            currentCategory: itemCategory,
            currentStoreId: item.storeId || null,
            currentRestaurantId: item.restaurantId || null,
          })

          // Update total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Update search results
        updateSearchResults: (results: SearchResult[]) => {
          set({ searchResults: results })
        },

        // Clear search results
        clearSearchResults: () => {
          set({ searchResults: [] })
        },

        // Update total cart value
        updateTotalCartValue: () => {
          const total = get().getTotal()
          set({ totalCartValue: total })
        },
        // Set current store object
        setCurrentStore: (store: Record<string, any>) => {
          console.log(`[STORE] Setting current store: ${store.name}`)
          
          // Check if this might be navigation from search results
          const { lastSearchInfo } = get()
          if (lastSearchInfo && !lastSearchInfo.navigatedFromSearch) {
            console.log(`[STORE] Navigation from search detected`)
            set({ 
              currentStore: store,
              lastSearchInfo: { ...lastSearchInfo, navigatedFromSearch: true },
              searchVerifierConsumed: false, // Reset search verifier consumption on new navigation
            })
          } else {
            set({ 
              currentStore: store,
              searchVerifierConsumed: false, // Reset search verifier consumption on store change
            })
          }
        },

        // Clear current store object
        clearCurrentStore: () => {
          set({ currentStore: {} })
        },

        // Verifier consumption tracking
        markVerifierConsumed: () => {
          set({ verifierConsumed: true })
        },

        // Search tracking methods
        recordSearch: (searchTerm: string) => {
          console.log(`[SEARCH] Recording search for: ${searchTerm}`)
          set({ 
            lastSearchInfo: { 
              searchTerm, 
              timestamp: Date.now(), 
              navigatedFromSearch: false 
            },
            searchVerifierConsumed: false, // Reset consumption on new search
          })
        },
        recordNavigationFromSearch: () => {
          const { lastSearchInfo } = get()
          if (lastSearchInfo) {
            console.log(`[SEARCH] Recording navigation from search for: ${lastSearchInfo.searchTerm}`)
            set({ 
              lastSearchInfo: { 
                ...lastSearchInfo, 
                navigatedFromSearch: true 
              } 
            })
          }
        },
        markSearchVerifierConsumed: () => {
          set({ searchVerifierConsumed: true })
        },
        
        // Removal tracking methods
        markRemovalVerifierConsumed: () => {
          set({ removalVerifierConsumed: true })
        },
        
        // Quantity change tracking methods
        markQuantityVerifierConsumed: () => {
          set({ quantityVerifierConsumed: true })
        },

        // Order completion tracking methods
        recordOrderCompletion: (orderInfo: {
          orderId: string
          tipAmount: number
          orderTotal: number
          storeName: string
          category: string
          items: CartItem[]
        }) => {
          console.log(`[ORDER] Recording order completion:`, orderInfo)
          set({
            lastOrderInfo: {
              ...orderInfo,
              timestamp: Date.now(),
              isCompleted: true,
            },
            // Reset orderVerifierConsumed for new orders so the verifier can be tested again
            orderVerifierConsumed: false,
          })
        },
        markOrderVerifierConsumed: () => {
          set({ orderVerifierConsumed: true })
        },
      }),
      {
        name: "multicategory-cart",
        partialize: (state) => ({
          // Persist all state fields
          items: state.items,
          currentCategory: state.currentCategory,
          currentStoreId: state.currentStoreId,
          currentRestaurantId: state.currentRestaurantId,
          isGroupOrder: state.isGroupOrder,
          groupOrderId: state.groupOrderId,
          searchResults: state.searchResults,
          totalCartValue: state.totalCartValue,
          currentStore: state.currentStore,
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
        }),
        merge: (persistedState: any, currentState) => {
          // Handle migration of old cart items
          const migratedItems =
            persistedState.items?.map((item: any) => {
              const migratedItem = { ...item }

              // Fix storeName if it's "Unknown Store" and we have restaurantId or storeId
              if ((!item.storeName || item.storeName === "Unknown Store") && (item.restaurantId || item.storeId)) {
                if (item.restaurantId) {
                  migratedItem.storeName = getStoreNameFromRestaurantId(item.restaurantId)
                } else if (item.storeId) {
                  migratedItem.storeName = getStoreNameFromStoreId(item.storeId)
                }
              }

              // Remove the name property if it exists
              if (migratedItem.name) {
                delete migratedItem.name
              }

              return migratedItem
            }) || []

          return {
            ...currentState,
            ...persistedState,
            items: migratedItems,
            currentStore: persistedState.currentStore || {},
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
          }
        },
      },
    ),
    {
      name: "CartStore",
      enabled: true,
    },
  ),
)

// Helper function to add a product to cart
export function addProductToCart(
  product: Product & { storeName?: string },
  category: CartCategory,
  storeOrRestaurantId: string,
) {
  const cartStore = useCartStore.getState()

  // Set the category first to ensure correct behavior
  cartStore.setCategory(category)

  if (category === "restaurant") {
    cartStore.addItem(
      {
        id: product.id,
        itemName: product.name, // This maps product.name to itemName, which is fine
        price: product.price,
        image: product.image,
        restaurantId: storeOrRestaurantId,
      },
      category,
      product.storeName, // Pass storeName to addItem (will be resolved if not provided)
    )
  } else {
    cartStore.addItem(
      {
        id: product.id,
        itemName: product.name, // This maps product.name to itemName, which is fine
        price: product.price,
        image: product.image,
        storeId: storeOrRestaurantId,
      },
      category,
      product.storeName, // Pass storeName to addItem (will be resolved if not provided)
    )
  }
}
