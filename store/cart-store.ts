import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import type { Product, AppliedModification } from "@/types"
import { restaurants } from "@/constants/restaurants"
import { convenienceStores } from "@/data/convenience-store-data"
import { useVerifierStore } from "./verifier-store"
import { useAppStore } from "./app-store"
import { checkDealCriteriaBoolean } from "@/lib/utils/deal-utils"

// Define supported cart categories
export type CartCategory = "restaurant" | "grocery" | "retail" | "pets" | "convenience"

// Base cart item interface (simplified - no vendor info)
export interface CartItem {
  id: number | string
  itemName: string
  price: number | string
  image: string
  quantity: number
  customizations?: string
  appliedModifications?: AppliedModification[]
}

// Cart interface - represents a cart for a single vendor/store
export interface Cart {
  storeId: string // Vendor ID (can be restaurant or store)
  storeName: string // Vendor name
  storeCategory: CartCategory // Type of store
  items: CartItem[] // Items in this cart
  selectedCard?: any // Selected payment method for this cart
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

// Helper function to get store name from store ID (for grocery/retail/convenience/pets stores)
const getStoreNameFromStoreId = (storeId: string, category?: CartCategory): string => {
  // If category is specified, check that category first
  if (category) {
    switch (category) {
      case 'convenience':
        if (convenienceStores[storeId]) {
          return convenienceStores[storeId].name
        }
        break
      case 'pets':
        const { allPetStores } = require("@/data/pet-data")
        const petStore = allPetStores.find((store: any) => store.id === storeId)
        if (petStore) {
          return petStore.name
        }
        break
      case 'grocery':
        const { stores } = require("@/data/store-data")
        if (stores[storeId]) {
          return stores[storeId].name
        }
        break
      case 'retail':
        try {
          const { stores: retailStores } = require("@/constants/store")
          if (retailStores[storeId]) {
            return retailStores[storeId].name
          }
        } catch (error) {
          // Ignore if retail stores data is not available
        }
        break
    }
  }

  // Fallback: check all categories in order (for backward compatibility)
  // Check convenience stores first
  if (convenienceStores[storeId]) {
    return convenienceStores[storeId].name
  }

  // Check pet stores
  const { allPetStores } = require("@/data/pet-data")
  const petStore = allPetStores.find((store: any) => store.id === storeId)
  if (petStore) {
    return petStore.name
  }

  // Check grocery stores
  const { stores } = require("@/data/store-data")
  if (stores[storeId]) {
    return stores[storeId].name
  }

  // Check retail stores
  try {
    const { stores: retailStores } = require("@/constants/store")
    if (retailStores[storeId]) {
      return retailStores[storeId].name
    }
  } catch (error) {
    // Ignore if retail stores data is not available
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
  carts: Cart[] // Multiple carts - one per vendor
  isGroupOrder: boolean
  groupOrderId: string | null
  totalCartValue: number

  // Helper methods to get current state from app-store
  getCurrentCategory: () => CartCategory
  getCurrentStoreId: () => string | null
  getCurrentRestaurantId: () => string | null

  // Helper method to find a cart by vendor
  findCart: (storeId: string, storeCategory: CartCategory) => Cart | undefined

  // Category methods
  setCategory: (category: CartCategory) => void
  getConfig: () => CategoryConfig

  // Cart operations
  addItem: (item: Omit<CartItem, "quantity">, category?: CartCategory, storeName?: string, storeId?: string) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: (storeId?: string, storeCategory?: CartCategory) => void
  clearAllCarts: () => void
  setSelectedCard: (storeId: string, storeCategory: CartCategory, card: any) => void

  // Group order methods
  startGroupOrder: () => string
  joinGroupOrder: (groupOrderId: string) => void
  leaveGroupOrder: () => void

  // Cart calculations (optionally for specific cart)
  getTotalItems: (storeId?: string, category?: CartCategory) => number
  getSubtotal: (storeId?: string, category?: CartCategory) => number
  getServiceFee: (storeId?: string, category?: CartCategory) => number
  getDeliveryFee: (storeId?: string, category?: CartCategory) => number
  getTotal: (storeId?: string, category?: CartCategory) => number
  getTotalPrice: (storeId?: string, category?: CartCategory) => string

  // Update total cart value
  updateTotalCartValue: () => void
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        carts: [], // Multiple carts - one per vendor
        isGroupOrder: false,
        groupOrderId: null,
        totalCartValue: 0,

        // Get current category from app-store
        getCurrentCategory: () => {
          const appStore = useAppStore.getState()
          return appStore.currentCategory || "grocery" // Default to grocery
        },

        // Get current store ID from app-store
        getCurrentStoreId: () => {
          const appStore = useAppStore.getState()
          const store = appStore.currentStore
          // Return store ID if it's not a restaurant
          if (store?.id && store?.type !== 'restaurant') {
            return store.id
          }
          return null
        },

        // Get current restaurant ID from app-store
        getCurrentRestaurantId: () => {
          const appStore = useAppStore.getState()
          const store = appStore.currentStore
          // Return restaurant ID if it's a restaurant
          if (store?.id && (store?.type === 'restaurant' || appStore.currentCategory === 'restaurant')) {
            return store.id
          }
          return null
        },

        // Find a cart by storeId and storeCategory
        findCart: (storeId: string, storeCategory: CartCategory) => {
          return get().carts.find(cart =>
            cart.storeId === storeId && cart.storeCategory === storeCategory
          )
        },

        // Set active category (now delegates to app-store)
        setCategory: (category: CartCategory) => {
          const currentCategory = get().getCurrentCategory()

          // Just log - the category should be set via app-store's setCurrentStore
          if (currentCategory !== category) {
            console.log(`[CART] Category change requested from ${currentCategory} to ${category}`)
            console.log(`[CART] Note: Category should be set via app-store's setCurrentStore method`)
          }
        },

        // Get configuration for current category
        getConfig: () => {
          const currentCategory = get().getCurrentCategory()
          return categoryConfigs[currentCategory]
        },

        // Add item to cart
        addItem: (item, category, storeName, storeId) => {
          const { carts, findCart, getCurrentCategory, getCurrentStoreId, getCurrentRestaurantId } = get()
          const verifierStore = useVerifierStore.getState()

          // Determine vendor info
          const itemCategory = category || getCurrentCategory()
          const itemStoreId = storeId || getCurrentStoreId() || getCurrentRestaurantId() || "unknown"

          // Determine store name
          let resolvedStoreName: string = storeName || ""
          if (!resolvedStoreName) {
            // Try to get from app-store first
            const appStore = useAppStore.getState()
            if (appStore.currentStore?.name) {
              resolvedStoreName = appStore.currentStore.name
            } else {
              resolvedStoreName = getStoreNameFromStoreId(itemStoreId, itemCategory) || "Unknown Store"
            }
          }

          console.log(`[CART] Adding item: ${item.itemName} to ${resolvedStoreName} (${itemCategory})`)

          // Find existing cart for this vendor
          const existingCart = findCart(itemStoreId, itemCategory)

          if (!existingCart) {
            // Create new cart for this vendor
            console.log(`[CART] Creating new cart for ${resolvedStoreName}`)

            const newCart: Cart = {
              storeId: itemStoreId,
              storeName: resolvedStoreName,
              storeCategory: itemCategory,
              items: [{
                ...item,
                quantity: 1,
              }]
            }

            verifierStore.updateMaxItemsReached(1)

            if (verifierStore.lastClearInfo !== null) {
              verifierStore.resetClearInfo()
            }

            set({ carts: [...carts, newCart] })
            verifierStore.resetVerifierConsumed()
            setTimeout(() => get().updateTotalCartValue(), 0)
            return
          }

          // Cart exists for this vendor - add or update item
          const existingItemIndex = existingCart.items.findIndex((i) => i.id === item.id)
          let newItems: CartItem[]

          if (existingItemIndex >= 0) {
            // Increment quantity if item already exists
            newItems = existingCart.items.map((i, idx) =>
              idx === existingItemIndex ? { ...i, quantity: i.quantity + 1 } : i
            )
            console.log(`[CART] Updated item quantity to ${newItems[existingItemIndex].quantity}`)
          } else {
            // Add new item with quantity 1
            newItems = [
              ...existingCart.items,
              {
                ...item,
                quantity: 1,
              }
            ]
            console.log(`[CART] Added new item to existing cart`)
          }

          const newTotalItems = newItems.reduce((total, cartItem) => total + cartItem.quantity, 0)
          verifierStore.updateMaxItemsReached(newTotalItems)

          if (verifierStore.lastClearInfo !== null) {
            verifierStore.resetClearInfo()
          }

          // Update the specific cart in the carts array
          const updatedCarts = carts.map(cart =>
            cart.storeId === itemStoreId && cart.storeCategory === itemCategory
              ? { ...cart, items: newItems }
              : cart
          )

          set({ carts: updatedCarts })
          verifierStore.resetVerifierConsumed()
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Remove item from cart
        removeItem: (id) => {
          const { carts } = get()
          const verifierStore = useVerifierStore.getState()

          console.log(`[CART] Removing item with id: ${id}`)

          // Find which cart contains the item
          let removedItem: CartItem | undefined
          let targetCart: Cart | undefined

          for (const cart of carts) {
            const item = cart.items.find((item) => item.id === id)
            if (item) {
              removedItem = item
              targetCart = cart
              break
            }
          }

          if (!targetCart || !removedItem) {
            console.log(`[CART] Item not found in any cart`)
            return
          }

          // Remove item from the cart
          const newItems = targetCart.items.filter((item) => item.id !== id)
          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0)

          console.log(`[CART] After removing from ${targetCart.storeName}: ${newTotalItems} items`)

          // Track removal for verifiers
          verifierStore.recordRemoval([removedItem])

          // Check if cart became empty after having 3+ items
          const maxItemsReached = verifierStore.maxItemsReached
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            verifierStore.recordClearInfo(maxItemsReached)
            verifierStore.resetMaxItemsReached()
          }

          let updatedCarts: Cart[]

          // If cart is empty, remove it from the carts array
          if (newItems.length === 0) {
            updatedCarts = carts.filter(cart =>
              !(cart.storeId === targetCart!.storeId && cart.storeCategory === targetCart!.storeCategory)
            )
            console.log(`[CART] Removed empty cart for ${targetCart.storeName}`)
          } else {
            // Update the cart with new items
            updatedCarts = carts.map(cart =>
              cart.storeId === targetCart!.storeId && cart.storeCategory === targetCart!.storeCategory
                ? { ...cart, items: newItems }
                : cart
            )
          }

          set({ carts: updatedCarts })

          // Check if deal criteria are still met after removing item
          if (targetCart && newItems.length > 0) {
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`
            // Dynamically import to avoid circular dependency
            import('@/store/deals-store').then(({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState()
              const appliedDeal = dealsStore.getAppliedDeal(cartId)

              if (appliedDeal) {
                // Check if deal criteria are still met
                const criteriaMet = checkDealCriteriaBoolean(appliedDeal, newItems, get().getSubtotal(targetCart.storeId, targetCart.storeCategory))

                if (!criteriaMet) {
                  // Criteria no longer met - remove the deal
                  dealsStore.removeDeal(cartId)
                }
              }
            })
          } else if (targetCart && newItems.length === 0) {
            // Cart is empty - remove any applied deal
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`
            import('@/store/deals-store').then(({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState()
              dealsStore.removeDeal(cartId)
            })
          }

          // Reset verifier consumption on any cart change
          verifierStore.resetVerifierConsumed()

          // After removing the item, update the total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Update item quantity
        updateQuantity: (id, quantity) => {
          const { carts } = get()
          const verifierStore = useVerifierStore.getState()

          console.log(`[CART] Updating quantity for item ${id} to ${quantity}`)

          // Find which cart contains the item
          let existingItem: CartItem | undefined
          let targetCart: Cart | undefined

          for (const cart of carts) {
            const item = cart.items.find((item) => item.id === id)
            if (item) {
              existingItem = item
              targetCart = cart
              break
            }
          }

          if (!targetCart || !existingItem) {
            console.log(`[CART] Item not found in any cart`)
            return
          }

          let newItems: CartItem[]

          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            newItems = targetCart.items.filter((item) => item.id !== id)
          } else {
            // Update quantity
            newItems = targetCart.items.map((item) => (item.id === id ? { ...item, quantity } : item))

            // Track quantity change for verifiers
            if (existingItem.quantity !== quantity) {
              verifierStore.recordQuantityChange(existingItem.itemName, existingItem.quantity, quantity)
            }
          }

          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0)
          console.log(`[CART] After quantity update in ${targetCart.storeName}: ${newTotalItems} items`)

          // Check if cart became empty after having 3+ items
          const maxItemsReached = verifierStore.maxItemsReached
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            verifierStore.recordClearInfo(maxItemsReached)
            verifierStore.resetMaxItemsReached()
          }

          let updatedCarts: Cart[]

          // If cart is empty, remove it from the carts array
          if (newItems.length === 0) {
            updatedCarts = carts.filter(cart =>
              !(cart.storeId === targetCart!.storeId && cart.storeCategory === targetCart!.storeCategory)
            )
            console.log(`[CART] Removed empty cart for ${targetCart.storeName}`)
          } else {
            // Update the cart with new items
            updatedCarts = carts.map(cart =>
              cart.storeId === targetCart!.storeId && cart.storeCategory === targetCart!.storeCategory
                ? { ...cart, items: newItems }
                : cart
            )
          }

          set({ carts: updatedCarts })

          // Check if deal criteria are still met after updating quantity
          if (targetCart && newItems.length > 0) {
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`
            // Dynamically import to avoid circular dependency
            import('@/store/deals-store').then(({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState()
              const appliedDeal = dealsStore.getAppliedDeal(cartId)

              if (appliedDeal) {
                // Check if deal criteria are still met
                const criteriaMet = checkDealCriteriaBoolean(appliedDeal, newItems, get().getSubtotal(targetCart.storeId, targetCart.storeCategory))

                if (!criteriaMet) {
                  // Criteria no longer met - remove the deal
                  dealsStore.removeDeal(cartId)
                }
              }
            })
          } else if (targetCart && newItems.length === 0) {
            // Cart is empty - remove any applied deal
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`
            import('@/store/deals-store').then(({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState()
              dealsStore.removeDeal(cartId)
            })
          }

          // Reset verifier consumption on any cart change
          verifierStore.resetVerifierConsumed()

          // After updating quantity, update the total cart value
          setTimeout(() => get().updateTotalCartValue(), 0)
        },

        // Clear a specific cart or current cart
        clearCart: (storeId?, storeCategory?) => {
          const { carts, getCurrentStoreId, getCurrentRestaurantId, getCurrentCategory } = get()
          const verifierStore = useVerifierStore.getState()

          // If no storeId provided, try to clear the current store's cart
          const targetStoreId = storeId || getCurrentStoreId() || getCurrentRestaurantId()
          const targetCategory = storeCategory || getCurrentCategory()

          if (!targetStoreId) {
            console.log(`[CART] No cart to clear - no storeId specified`)
            return
          }

          // Find the cart to clear
          const cartToClear = carts.find(cart =>
            cart.storeId === targetStoreId && cart.storeCategory === targetCategory
          )

          if (!cartToClear) {
            console.log(`[CART] No cart found for ${targetStoreId} (${targetCategory})`)
            return
          }

          const currentTotalItems = cartToClear.items.reduce((total, item) => total + item.quantity, 0)
          const maxItemsReached = verifierStore.maxItemsReached

          console.log(`[CART] Clearing cart for ${cartToClear.storeName}: ${currentTotalItems} items`)

          const itemsBeforeClear = Math.max(currentTotalItems, maxItemsReached)
          verifierStore.recordClearInfo(itemsBeforeClear)
          verifierStore.resetMaxItemsReached()
          verifierStore.resetVerifierConsumed()

          // Remove the cart from carts array
          const updatedCarts = carts.filter(cart =>
            !(cart.storeId === targetStoreId && cart.storeCategory === targetCategory)
          )

          set({
            carts: updatedCarts,
            totalCartValue: updatedCarts.length === 0 ? 0 : get().totalCartValue,
          })
        },

        // Clear all carts
        clearAllCarts: () => {
          const { carts } = get()
          const verifierStore = useVerifierStore.getState()

          const totalItems = carts.reduce((total, cart) =>
            total + cart.items.reduce((sum, item) => sum + item.quantity, 0), 0
          )

          console.log(`[CART] Clearing all ${carts.length} carts: ${totalItems} items`)

          const maxItemsReached = verifierStore.maxItemsReached
          const itemsBeforeClear = Math.max(totalItems, maxItemsReached)
          verifierStore.recordClearInfo(itemsBeforeClear)
          verifierStore.resetMaxItemsReached()
          verifierStore.resetVerifierConsumed()

          set({
            carts: [],
            totalCartValue: 0,
          })
        },

        // Set selected card for a cart
        setSelectedCard: (storeId, storeCategory, card) => {
          const { carts } = get()
          const updatedCarts = carts.map((cart) => {
            if (cart.storeId === storeId && cart.storeCategory === storeCategory) {
              return { ...cart, selectedCard: card }
            }
            return cart
          })
          set({ carts: updatedCarts })
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

        // Get total items count for specific cart or all carts
        getTotalItems: (storeId?, category?) => {
          const { carts, findCart } = get()

          // If storeId and category provided, calculate for specific cart
          if (storeId && category) {
            const cart = findCart(storeId, category)
            if (!cart) return 0
            return cart.items.reduce((sum, item) => sum + item.quantity, 0)
          }

          // Otherwise calculate across all carts
          return carts.reduce((total, cart) =>
            total + cart.items.reduce((sum, item) => sum + item.quantity, 0), 0
          )
        },

        // Calculate subtotal for specific cart or all carts
        getSubtotal: (storeId?, category?) => {
          const { carts, findCart } = get()

          // If storeId and category provided, calculate for specific cart
          if (storeId && category) {
            const cart = findCart(storeId, category)
            if (!cart) return 0
            return cart.items.reduce((sum, item) => {
              const price =
                typeof item.price === "number"
                  ? item.price
                  : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
              return sum + price * item.quantity
            }, 0)
          }

          // Otherwise calculate across all carts
          return carts.reduce((cartTotal, cart) =>
            cartTotal + cart.items.reduce((sum, item) => {
              const price =
                typeof item.price === "number"
                  ? item.price
                  : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
              return sum + price * item.quantity
            }, 0), 0
          )
        },

        // Calculate service fee for specific cart or all carts
        getServiceFee: (storeId?, category?) => {
          const { getSubtotal, getConfig } = get()
          const config = getConfig()
          const subtotal = getSubtotal(storeId, category)
          return Math.max(subtotal * config.serviceFeePercentage, config.minServiceFee)
        },

        // Calculate delivery fee for specific cart or all carts
        getDeliveryFee: (storeId?, category?) => {
          const { getSubtotal, getConfig } = get()
          const config = getConfig()
          const subtotal = getSubtotal(storeId, category)
          return subtotal >= config.freeDeliveryThreshold ? 0 : config.defaultDeliveryFee
        },

        // Calculate total (includes all fees - for checkout) for specific cart or all carts
        getTotal: (storeId?, category?) => {
          const { getSubtotal, getServiceFee, getDeliveryFee } = get()
          return getSubtotal(storeId, category) + getServiceFee(storeId, category) + getDeliveryFee(storeId, category)
        },

        // Get formatted total price (for cart display - only subtotal, no fees) for specific cart or all carts
        getTotalPrice: (storeId?, category?) => {
          return `$${get().getSubtotal(storeId, category).toFixed(2)}`
        },

        // Update total cart value
        updateTotalCartValue: () => {
          const total = get().getTotal()
          set({ totalCartValue: total })
        },
      }),
      {
        name: "carts",
        partialize: (state) => ({
          carts: state.carts,
          isGroupOrder: state.isGroupOrder,
          groupOrderId: state.groupOrderId,
          totalCartValue: state.totalCartValue,
        }),
        merge: (persistedState: any, currentState) => {
          let carts: Cart[] = []

          // Migration from old single cart structure (cart field)
          if (persistedState.cart && typeof persistedState.cart === 'object' && persistedState.cart.items) {
            console.log('[CART] Migrating from single cart to multiple carts')
            carts = [persistedState.cart]
          }
          // Migration from old items-based structure
          else if (persistedState.items && Array.isArray(persistedState.items) && persistedState.items.length > 0) {
            console.log('[CART] Migrating old items array to new Cart format')

            // Extract store info from first item (old structure had storeId/restaurantId on items)
            const firstItem = persistedState.items[0]
            const storeId = firstItem.restaurantId || firstItem.storeId || 'unknown'
            const category = firstItem.category || 'grocery'
            const storeName = firstItem.storeName || getStoreNameFromStoreId(storeId, category)

            // Create new Cart structure with cleaned items (remove vendor info from items)
            carts = [{
              storeId,
              storeName,
              storeCategory: category,
              items: persistedState.items.map((item: any) => ({
                id: item.id,
                itemName: item.itemName || item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
                customizations: item.customizations,
              }))
            }]
          }
          // Use existing carts if available
          else if (persistedState.carts && Array.isArray(persistedState.carts)) {
            carts = persistedState.carts
          }

          return {
            ...currentState,
            ...persistedState,
            carts,
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

  // Add item with storeId (no need to distinguish between restaurant and store)
  cartStore.addItem(
    {
      id: product.id,
      itemName: product.name,
      price: product.price,
      image: product.image,
    },
    category,
    product.storeName, // Pass storeName
    storeOrRestaurantId, // Pass storeId
  )
}
