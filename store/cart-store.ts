import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Product, AppliedModification } from '@/types';
import { useVerifierStore } from './verifier-store';
import { useAppStore } from './app-store';
import { useUserStore } from './user-store';
import { checkDealCriteriaBoolean, fetchDealById } from '@/lib/utils/deal-utils';
import { haveSameModifications, generateCartItemId } from '@/lib/utils/cart-merge';

// Define supported cart categories
export type CartCategory = 'restaurant' | 'grocery' | 'retail' | 'convenience' | 'pets';

// Base cart item interface (simplified - no vendor info)
export interface CartItem {
  id: number | string
  itemName: string
  price: number | string
  image: string
  quantity: number
  customizations?: string
  appliedModifications?: AppliedModification[]
  menuCategoryId?: string
  menuCategoryName?: string
}

// Cart interface - represents a cart for a single vendor/store
export interface Cart {
  storeId: string; // Vendor ID (can be restaurant or store)
  storeName: string; // Vendor name
  storeCategory: CartCategory; // Type of store
  items: CartItem[]; // Items in this cart
  selectedCard?: any; // Selected payment method for this cart
  isReorder?: boolean; // Flag to indicate if this cart is a reorder
  userId?: string; // User ID who owns this cart
}

// Category-specific configurations
interface CategoryConfig {
  serviceFeePercentage: number;
  minServiceFee: number;
}

// Default configuration by category (only restaurant is actively used)
const categoryConfigs: Record<CartCategory, CategoryConfig> = {
  restaurant: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  // Placeholder configs for other categories (not currently used)
  grocery: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  retail: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  convenience: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  pets: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
};

// Helper function to get store name from store ID
const getStoreNameFromStoreId = (storeId: string, _category?: CartCategory): string => {
  // For stores, use the existing formatting logic
  return storeId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Cart store interface
interface CartStore {
  // State
  carts: Cart[]; // Multiple carts - one per vendor
  isGroupOrder: boolean;
  groupOrderId: string | null;
  isInitialized: boolean; // Track if store has been initialized from DB

  // Cart sidebar control
  shouldOpenCart: boolean;

  // Helper methods to get current state from app-store
  getCurrentCategory: () => CartCategory;
  getCurrentStoreId: () => string | null;
  getCurrentRestaurantId: () => string | null;

  // Helper method to find a cart by vendor
  findCart: (storeId: string, storeCategory: CartCategory) => Cart | undefined;

  // Category methods
  setCategory: (category: CartCategory) => void;
  getConfig: () => CategoryConfig;

  // Cart operations
  addItem: (
    item: Omit<CartItem, 'quantity'>,
    category?: CartCategory,
    storeName?: string,
    storeId?: string
  ) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: (storeId?: string, storeCategory?: CartCategory) => void;
  clearAllCarts: () => void;
  setSelectedCard: (storeId: string, storeCategory: CartCategory, card: any) => void;

  // Group order methods
  startGroupOrder: () => string;
  joinGroupOrder: (groupOrderId: string) => void;
  leaveGroupOrder: () => void;

  // Cart calculations (optionally for specific cart)
  getTotalItems: (storeId?: string, category?: CartCategory) => number;
  getSubtotal: (storeId?: string, category?: CartCategory) => number;
  getServiceFee: (storeId?: string, category?: CartCategory) => number;
  getDeliveryFee: (storeId?: string, category?: CartCategory) => number;
  getTotal: (storeId?: string, category?: CartCategory) => number;
  getTotalPrice: (storeId?: string, category?: CartCategory) => string;

  // Enhanced fee calculations with dynamic factors
  getDynamicDeliveryFee: (
    storeId?: string,
    category?: CartCategory,
    options?: {
      restaurant?: any;
      customerAddress?: any;
      distance?: number;
      appliedDeal?: any;
      deliveryOption?: 'standard' | 'express' | 'schedule';
    }
  ) => number;
  getDynamicServiceFee: (
    storeId?: string,
    category?: CartCategory,
    options?: {
      restaurant?: any;
      distance?: number;
    }
  ) => number;
  getEstimatedTax: (
    storeId?: string,
    category?: CartCategory,
    options?: {
      customerAddress?: any;
      subtotal?: number;
      deliveryFee?: number;
      serviceFee?: number;
    }
  ) => number;

  // Reorder methods
  startReorder: (
    items: CartItem[],
    category: CartCategory,
    storeId: string,
    storeName: string
  ) => void;

  // Cart sidebar control methods
  triggerOpenCart: () => void;
  resetOpenCartTrigger: () => void;

  // Initialize carts from database
  initializeCartsFromDB: (carts: Cart[]) => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        carts: [], // Multiple carts - one per vendor
        isGroupOrder: false,
        groupOrderId: null,
        isInitialized: false,
        shouldOpenCart: false,

        // Get current category from app-store
        getCurrentCategory: () => {
          const appStore = useAppStore.getState();
          return appStore.currentCategory || 'restaurant'; // Default to restaurant
        },

        // Get current store ID from app-store
        getCurrentStoreId: () => {
          const appStore = useAppStore.getState();
          const store = appStore.currentStore;
          // Return store ID if it's not a restaurant
          if (store?.id && store?.type !== 'restaurant') {
            return store.id;
          }
          return null;
        },

        // Get current restaurant ID from app-store
        getCurrentRestaurantId: () => {
          const appStore = useAppStore.getState();
          const store = appStore.currentStore;
          // Return restaurant ID if it's a restaurant
          if (
            store?.id &&
            (store?.type === 'restaurant' || appStore.currentCategory === 'restaurant')
          ) {
            return store.id;
          }
          return null;
        },

        // Find a cart by storeId and storeCategory, filtered by current user
        // Guest users see carts without userId, logged-in users see only their carts
        findCart: (storeId: string, storeCategory: CartCategory) => {
          const currentUser = useUserStore.getState().currentUser;
          return get().carts.find(
            cart =>
              cart.storeId === storeId &&
              cart.storeCategory === storeCategory &&
              (currentUser ? cart.userId === currentUser.id : !cart.userId)
          );
        },

        // Set active category (now delegates to app-store)
        setCategory: (category: CartCategory) => {
          const currentCategory = get().getCurrentCategory();

          // Just log - the category should be set via app-store's setCurrentStore
          if (currentCategory !== category) {
            console.log(`[CART] Category change requested from ${currentCategory} to ${category}`);
            console.log(
              `[CART] Note: Category should be set via app-store's setCurrentStore method`
            );
          }
        },

        // Get configuration for current category
        getConfig: () => {
          const currentCategory = get().getCurrentCategory();
          return categoryConfigs[currentCategory];
        },

        // Add item to cart
        addItem: (item, category, storeName, storeId) => {
          const { carts, findCart, getCurrentCategory, getCurrentStoreId, getCurrentRestaurantId } =
            get();
          const verifierStore = useVerifierStore.getState();

          // Determine vendor info
          const itemCategory = category || getCurrentCategory();
          const itemStoreId =
            storeId || getCurrentStoreId() || getCurrentRestaurantId() || 'unknown';

          // Determine store name
          let resolvedStoreName: string = storeName || '';
          if (!resolvedStoreName) {
            // Try to get from app-store first
            const appStore = useAppStore.getState();
            if (appStore.currentStore?.name) {
              resolvedStoreName = appStore.currentStore.name;
            } else {
              resolvedStoreName =
                getStoreNameFromStoreId(itemStoreId, itemCategory) || 'Unknown Store';
            }
          }

          console.log(
            `[CART] Adding item: ${item.itemName} to ${resolvedStoreName} (${itemCategory})`
          );

          // Find existing cart for this vendor
          const existingCart = findCart(itemStoreId, itemCategory);

          if (!existingCart) {
            // Create new cart for this vendor
            console.log(`[CART] Creating new cart for ${resolvedStoreName}`);

            // Get current user ID
            const currentUser = useUserStore.getState().currentUser;

            const newCart: Cart = {
              storeId: itemStoreId,
              storeName: resolvedStoreName,
              storeCategory: itemCategory,
              items: [
                {
                  ...item,
                  quantity: 1,
                },
              ],
              ...(currentUser?.id ? { userId: currentUser.id } : {}),
            };

            verifierStore.updateMaxItemsReached(1);

            if (verifierStore.lastClearInfo !== null) {
              verifierStore.resetClearInfo();
            }

            set({ carts: [...carts, newCart] });
            verifierStore.resetVerifierConsumed();
            return;
          }

          // Cart exists for this vendor - add or update item
          // Generate unique cart item ID based on base ID + modifications
          const uniqueCartItemId = generateCartItemId(item.id, item.appliedModifications);

          // Compare by ID AND modifications - items with same ID but different modifications are separate
          const existingItemIndex = existingCart.items.findIndex(i =>
            haveSameModifications(i, item as CartItem)
          );
          let newItems: CartItem[];

          if (existingItemIndex >= 0) {
            // Increment quantity if item already exists with same modifications
            // Also update ID to unique ID if it's still using base ID (for consistency)
            newItems = existingCart.items.map((i, idx) =>
              idx === existingItemIndex
                ? { ...i, id: uniqueCartItemId, quantity: i.quantity + 1 }
                : i
            );
            console.log(`[CART] Updated item quantity to ${newItems[existingItemIndex].quantity}`);
          } else {
            // Add new item with quantity 1 (different modifications = different cart item)
            // Use unique cart item ID instead of base item ID
            newItems = [
              ...existingCart.items,
              {
                ...item,
                id: uniqueCartItemId, // Use unique ID that includes modifications
                quantity: 1,
              },
            ];
            console.log(
              `[CART] Added new item to existing cart (different modifications) with ID: ${uniqueCartItemId}`
            );
          }

          const newTotalItems = newItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
          verifierStore.updateMaxItemsReached(newTotalItems);

          if (verifierStore.lastClearInfo !== null) {
            verifierStore.resetClearInfo();
          }

          // Update the specific cart in the carts array (filtered by userId)
          const currentUser = useUserStore.getState().currentUser;
          const updatedCarts = carts.map(cart =>
            cart.storeId === itemStoreId &&
            cart.storeCategory === itemCategory &&
            (currentUser ? cart.userId === currentUser.id : !cart.userId)
              ? { ...cart, items: newItems }
              : cart
          );

          set({ carts: updatedCarts });
          verifierStore.resetVerifierConsumed();
        },

        // Remove item from cart
        removeItem: id => {
          const { carts } = get();
          const verifierStore = useVerifierStore.getState();
          const currentUser = useUserStore.getState().currentUser;

          console.log(`[CART] Removing item with id: ${id}`);

          // Filter carts by current user
          const userCarts = carts.filter(cart =>
            currentUser ? cart.userId === currentUser.id : !cart.userId
          );

          // Find which cart contains the item (only in user's carts)
          let removedItem: CartItem | undefined;
          let targetCart: Cart | undefined;

          for (const cart of userCarts) {
            const item = cart.items.find(item => item.id === id);
            if (item) {
              removedItem = item;
              targetCart = cart;
              break;
            }
          }

          if (!targetCart || !removedItem) {
            console.log(`[CART] Item not found in any cart`);
            return;
          }

          // Remove item from the cart
          const newItems = targetCart.items.filter(item => item.id !== id);
          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);

          console.log(`[CART] After removing from ${targetCart.storeName}: ${newTotalItems} items`);

          // Track removal for verifiers
          verifierStore.recordRemoval([removedItem]);

          // Check if cart became empty after having 3+ items
          const maxItemsReached = verifierStore.maxItemsReached;
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            verifierStore.recordClearInfo(maxItemsReached);
            verifierStore.resetMaxItemsReached();
          }

          let updatedCarts: Cart[];

          // If cart is empty, remove it from the carts array (filtered by userId)
          if (newItems.length === 0) {
            updatedCarts = carts.filter(
              cart =>
                !(
                  cart.storeId === targetCart!.storeId &&
                  cart.storeCategory === targetCart!.storeCategory &&
                  (currentUser ? cart.userId === currentUser.id : !cart.userId)
                )
            );
            console.log(`[CART] Removed empty cart for ${targetCart.storeName}`);
          } else {
            // Update the cart with new items (filtered by userId)
            updatedCarts = carts.map(cart =>
              cart.storeId === targetCart!.storeId &&
              cart.storeCategory === targetCart!.storeCategory &&
              (currentUser ? cart.userId === currentUser.id : !cart.userId)
                ? { ...cart, items: newItems }
                : cart
            );
          }

          set({ carts: updatedCarts });

          // Check if deal should be removed after removing item
          if (targetCart) {
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`;
            // Dynamically import to avoid circular dependency
            import('@/store/deals-store').then(async ({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState();
              const appliedDealId = dealsStore.getAppliedDealId(cartId);

              if (appliedDealId) {
                // Check if the removed item is a free item from the deal
                const freeItemIds = dealsStore.getFreeItemIds(cartId);
                let removedItemId =
                  typeof removedItem.id === 'string' ? removedItem.id : removedItem.id.toString();

                // If item ID starts with store ID, remove it before checking
                if (targetCart.storeId && removedItemId.startsWith(targetCart.storeId + '-')) {
                  removedItemId = removedItemId.substring(targetCart.storeId.length + 1);
                }

                // Check if removed item matches any free item ID
                const isRemovedItemFree = freeItemIds.some(freeId => {
                  // Check if the removed item ID starts with the free item ID or matches exactly
                  return removedItemId === freeId || removedItemId.startsWith(freeId + '-');
                });

                if (isRemovedItemFree) {
                  // Removed item is a free item - automatically remove the deal
                  console.log(`[CART] Removed free item from deal, removing deal from cart`);
                  dealsStore.removeDeal(cartId);
                  return;
                }

                // If cart is empty, remove the deal
                if (newItems.length === 0) {
                  dealsStore.removeDeal(cartId);
                  return;
                }

                // Fetch the full deal object from API to check criteria
                const appliedDeal = await fetchDealById(appliedDealId, targetCart.storeId);

                if (appliedDeal) {
                  // Check if deal criteria are still met
                  const criteriaMet = checkDealCriteriaBoolean(
                    appliedDeal,
                    newItems,
                    get().getSubtotal(targetCart.storeId, targetCart.storeCategory)
                  );

                  if (!criteriaMet) {
                    // Criteria no longer met - remove the deal
                    dealsStore.removeDeal(cartId);
                  }
                }
              }
            });
          }

          // Reset verifier consumption on any cart change
          verifierStore.resetVerifierConsumed();
        },

        // Update item quantity
        updateQuantity: (id, quantity) => {
          const { carts } = get();
          const verifierStore = useVerifierStore.getState();
          const currentUser = useUserStore.getState().currentUser;

          console.log(`[CART] Updating quantity for item ${id} to ${quantity}`);

          // Filter carts by current user
          const userCarts = carts.filter(cart =>
            currentUser ? cart.userId === currentUser.id : !cart.userId
          );

          // Find which cart contains the item (only in user's carts)
          let existingItem: CartItem | undefined;
          let targetCart: Cart | undefined;

          for (const cart of userCarts) {
            const item = cart.items.find(item => item.id === id);
            if (item) {
              existingItem = item;
              targetCart = cart;
              break;
            }
          }

          if (!targetCart || !existingItem) {
            console.log(`[CART] Item not found in any cart`);
            return;
          }

          let newItems: CartItem[];

          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            newItems = targetCart.items.filter(item => item.id !== id);
          } else {
            // Update quantity
            newItems = targetCart.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            );

            // Track quantity change for verifiers
            if (existingItem.quantity !== quantity) {
              verifierStore.recordQuantityChange(
                existingItem.itemName,
                existingItem.quantity,
                quantity
              );
            }
          }

          const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
          console.log(
            `[CART] After quantity update in ${targetCart.storeName}: ${newTotalItems} items`
          );

          // Check if cart became empty after having 3+ items
          const maxItemsReached = verifierStore.maxItemsReached;
          if (newTotalItems === 0 && maxItemsReached >= 3) {
            verifierStore.recordClearInfo(maxItemsReached);
            verifierStore.resetMaxItemsReached();
          }

          let updatedCarts: Cart[];

          // If cart is empty, remove it from the carts array (filtered by userId)
          if (newItems.length === 0) {
            updatedCarts = carts.filter(
              cart =>
                !(
                  cart.storeId === targetCart!.storeId &&
                  cart.storeCategory === targetCart!.storeCategory &&
                  (currentUser ? cart.userId === currentUser.id : !cart.userId)
                )
            );
            console.log(`[CART] Removed empty cart for ${targetCart.storeName}`);
          } else {
            // Update the cart with new items (filtered by userId)
            updatedCarts = carts.map(cart =>
              cart.storeId === targetCart!.storeId &&
              cart.storeCategory === targetCart!.storeCategory &&
              (currentUser ? cart.userId === currentUser.id : !cart.userId)
                ? { ...cart, items: newItems }
                : cart
            );
          }

          set({ carts: updatedCarts });

          // Check if deal criteria are still met after updating quantity
          if (targetCart && newItems.length > 0) {
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`;
            // Dynamically import to avoid circular dependency
            import('@/store/deals-store').then(async ({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState();
              const appliedDealId = dealsStore.getAppliedDealId(cartId);

              if (appliedDealId) {
                // Fetch the full deal object from API
                const appliedDeal = await fetchDealById(appliedDealId, targetCart.storeId);

                if (appliedDeal) {
                  // Check if deal criteria are still met
                  const criteriaMet = checkDealCriteriaBoolean(
                    appliedDeal,
                    newItems,
                    get().getSubtotal(targetCart.storeId, targetCart.storeCategory)
                  );

                  if (!criteriaMet) {
                    // Criteria no longer met - remove the deal
                    dealsStore.removeDeal(cartId);
                  }
                }
              }
            });
          } else if (targetCart && newItems.length === 0) {
            // Cart is empty - remove any applied deal
            const cartId = `${targetCart.storeId}-${targetCart.storeCategory}`;
            import('@/store/deals-store').then(({ useDealsStore }) => {
              const dealsStore = useDealsStore.getState();
              dealsStore.removeDeal(cartId);
            });
          }

          // Reset verifier consumption on any cart change
          verifierStore.resetVerifierConsumed();
        },

        // Clear a specific cart or current cart
        clearCart: (storeId?, storeCategory?) => {
          const { carts, getCurrentStoreId, getCurrentRestaurantId, getCurrentCategory } = get();
          const verifierStore = useVerifierStore.getState();
          const currentUser = useUserStore.getState().currentUser;

          // If no storeId provided, try to clear the current store's cart
          const targetStoreId = storeId || getCurrentStoreId() || getCurrentRestaurantId();
          const targetCategory = storeCategory || getCurrentCategory();

          if (!targetStoreId) {
            console.log(`[CART] No cart to clear - no storeId specified`);
            return;
          }

          // Find the cart to clear (filtered by userId)
          const cartToClear = carts.find(
            cart =>
              cart.storeId === targetStoreId &&
              cart.storeCategory === targetCategory &&
              (currentUser ? cart.userId === currentUser.id : !cart.userId)
          );

          if (!cartToClear) {
            console.log(`[CART] No cart found for ${targetStoreId} (${targetCategory})`);
            return;
          }

          const currentTotalItems = cartToClear.items.reduce(
            (total, item) => total + item.quantity,
            0
          );
          const maxItemsReached = verifierStore.maxItemsReached;

          console.log(
            `[CART] Clearing cart for ${cartToClear.storeName}: ${currentTotalItems} items`
          );

          const itemsBeforeClear = Math.max(currentTotalItems, maxItemsReached);
          verifierStore.recordClearInfo(itemsBeforeClear);
          verifierStore.resetMaxItemsReached();
          verifierStore.resetVerifierConsumed();

          // Remove the cart from carts array (filtered by userId)
          const updatedCarts = carts.filter(
            cart =>
              !(
                cart.storeId === targetStoreId &&
                cart.storeCategory === targetCategory &&
                (currentUser ? cart.userId === currentUser.id : !cart.userId)
              )
          );

          set({ carts: updatedCarts });
        },

        // Clear all carts (only current user's carts)
        clearAllCarts: () => {
          const { carts } = get();
          const verifierStore = useVerifierStore.getState();
          const currentUser = useUserStore.getState().currentUser;

          // Filter carts by current user
          const userCarts = carts.filter(cart =>
            currentUser ? cart.userId === currentUser.id : !cart.userId
          );

          const totalItems = userCarts.reduce(
            (total, cart) => total + cart.items.reduce((sum, item) => sum + item.quantity, 0),
            0
          );

          console.log(`[CART] Clearing all ${userCarts.length} carts: ${totalItems} items`);

          const maxItemsReached = verifierStore.maxItemsReached;
          const itemsBeforeClear = Math.max(totalItems, maxItemsReached);
          verifierStore.recordClearInfo(itemsBeforeClear);
          verifierStore.resetMaxItemsReached();
          verifierStore.resetVerifierConsumed();

          // Remove only current user's carts, keep other users' carts
          const remainingCarts = carts.filter(cart =>
            currentUser ? cart.userId !== currentUser.id : cart.userId
          );

          set({ carts: remainingCarts });
        },

        // Set selected card for a cart
        setSelectedCard: (storeId, storeCategory, card) => {
          const { carts } = get();
          const currentUser = useUserStore.getState().currentUser;
          const updatedCarts = carts.map(cart => {
            if (
              cart.storeId === storeId &&
              cart.storeCategory === storeCategory &&
              (currentUser ? cart.userId === currentUser.id : !cart.userId)
            ) {
              return { ...cart, selectedCard: card };
            }
            return cart;
          });
          set({ carts: updatedCarts });
        },

        // Start a group order and return the group order ID
        startGroupOrder: () => {
          // Generate a random ID for the group order
          const groupOrderId = Math.random().toString(36).substring(2, 10);

          set({
            isGroupOrder: true,
            groupOrderId,
          });

          return groupOrderId;
        },

        // Join an existing group order
        joinGroupOrder: (groupOrderId: string) => {
          set({
            isGroupOrder: true,
            groupOrderId,
            // Keep the items and other cart state since we're joining an existing order
          });
        },

        // Leave a group order
        leaveGroupOrder: () => {
          set({
            isGroupOrder: false,
            groupOrderId: null,
            // Keep the items since the user might want to order for themselves
          });
        },

        // Get total items count for specific cart or all carts
        getTotalItems: (storeId?, category?) => {
          const { carts, findCart } = get();
          const currentUser = useUserStore.getState().currentUser;

          // If storeId and category provided, calculate for specific cart
          if (storeId && category) {
            const cart = findCart(storeId, category);
            if (!cart) return 0;
            return cart.items.reduce((sum, item) => sum + item.quantity, 0);
          }

          // Otherwise calculate across all carts (filtered by userId)
          const userCarts = carts.filter(cart =>
            currentUser ? cart.userId === currentUser.id : !cart.userId
          );
          return userCarts.reduce(
            (total, cart) => total + cart.items.reduce((sum, item) => sum + item.quantity, 0),
            0
          );
        },

        // Calculate subtotal for specific cart or all carts
        getSubtotal: (storeId?, category?) => {
          const { carts, findCart } = get();
          const currentUser = useUserStore.getState().currentUser;

          // If storeId and category provided, calculate for specific cart
          if (storeId && category) {
            const cart = findCart(storeId, category);
            if (!cart) return 0;
            return cart.items.reduce((sum, item) => {
              const price =
                typeof item.price === 'number'
                  ? item.price
                  : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
              return sum + price * item.quantity;
            }, 0);
          }

          // Otherwise calculate across all carts (filtered by userId)
          const userCarts = carts.filter(cart =>
            currentUser ? cart.userId === currentUser.id : !cart.userId
          );
          return userCarts.reduce(
            (cartTotal, cart) =>
              cartTotal +
              cart.items.reduce((sum, item) => {
                const price =
                  typeof item.price === 'number'
                    ? item.price
                    : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                return sum + price * item.quantity;
              }, 0),
            0
          );
        },

        // Calculate service fee for specific cart or all carts
        getServiceFee: (storeId?, category?) => {
          const { getSubtotal, getConfig } = get();
          const config = getConfig();
          const subtotal = getSubtotal(storeId, category);
          return Math.max(subtotal * config.serviceFeePercentage, config.minServiceFee);
        },

        // Calculate delivery fee for specific cart or all carts
        // Note: This is a fallback - actual delivery fee is calculated dynamically in checkout
        // based on distance and restaurant's minDeliveryFee
        getDeliveryFee: (_storeId?, _category?) => {
          // Return 0 as a placeholder - actual fee is calculated via getDynamicDeliveryFee
          // which takes into account distance and restaurant's min delivery fee
          return 0;
        },

        // Calculate total (includes all fees - for checkout) for specific cart or all carts
        getTotal: (storeId?, category?) => {
          const { getSubtotal, getServiceFee, getDeliveryFee } = get();
          return (
            getSubtotal(storeId, category) +
            getServiceFee(storeId, category) +
            getDeliveryFee(storeId, category)
          );
        },

        // Enhanced dynamic fee calculations
        getDynamicDeliveryFee: (storeId?, category?, options?) => {
          try {
            const { calculateFees } = require('@/lib/utils/fee-calculator');
            const { getSubtotal } = get();
            const currentCategory = category || get().getCurrentCategory();
            const subtotal = getSubtotal(storeId, category);

            // If no options provided, fall back to old calculation
            if (!options || !options.restaurant) {
              return get().getDeliveryFee(storeId, category);
            }

            const feeResult = calculateFees({
              subtotal,
              distance: options.distance || 0,
              restaurant: options.restaurant,
              customerAddress: options.customerAddress,
              appliedDeal: options.appliedDeal,
              deliveryOption: options.deliveryOption || 'standard',
              category: currentCategory,
            });

            return feeResult.deliveryFee;
          } catch (_error) {
            // Fallback to old calculation on error
            return get().getDeliveryFee(storeId, category);
          }
        },

        getDynamicServiceFee: (storeId?, category?, options?) => {
          try {
            const { calculateFees } = require('@/lib/utils/fee-calculator');
            const { getSubtotal } = get();
            const currentCategory = category || get().getCurrentCategory();
            const subtotal = getSubtotal(storeId, category);

            // If no options provided, fall back to old calculation
            if (!options || !options.restaurant) {
              return get().getServiceFee(storeId, category);
            }

            const feeResult = calculateFees({
              subtotal,
              distance: options.distance || 0,
              restaurant: options.restaurant,
              customerAddress: null,
              appliedDeal: null,
              deliveryOption: 'standard',
              category: currentCategory,
            });

            return feeResult.serviceFee;
          } catch (_error) {
            // Fallback to old calculation on error
            return get().getServiceFee(storeId, category);
          }
        },

        getEstimatedTax: (storeId?, category?, options?) => {
          try {
            const { calculateFees } = require('@/lib/utils/fee-calculator');
            const { getSubtotal, getServiceFee, getDeliveryFee } = get();
            const currentCategory = category || get().getCurrentCategory();

            // If no options provided, use basic calculation
            if (!options || !options.customerAddress) {
              const subtotal = options?.subtotal || getSubtotal(storeId, category);
              const deliveryFee = options?.deliveryFee || getDeliveryFee(storeId, category);
              const serviceFee = options?.serviceFee || getServiceFee(storeId, category);

              const { calculateEstimatedTax } = require('@/lib/utils/fee-calculator');
              return calculateEstimatedTax(subtotal, deliveryFee, serviceFee, null);
            }

            const subtotal = options.subtotal || getSubtotal(storeId, category);
            // const deliveryFee = options.deliveryFee || getDeliveryFee(storeId, category);
            // const serviceFee = options.serviceFee || getServiceFee(storeId, category);

            const feeResult = calculateFees({
              subtotal,
              distance: 0,
              restaurant: null,
              customerAddress: options.customerAddress,
              appliedDeal: null,
              deliveryOption: 'standard',
              category: currentCategory,
            });

            return feeResult.estimatedTax;
          } catch (_error) {
            // Fallback to default tax calculation
            return 0;
          }
        },

        // Get formatted total price (for cart display - only subtotal, no fees) for specific cart or all carts
        getTotalPrice: (storeId?, category?) => {
          return `$${get().getSubtotal(storeId, category).toFixed(2)}`;
        },

        // Reorder methods
        startReorder: (
          items: CartItem[],
          category: CartCategory,
          storeId: string,
          storeName: string
        ) => {
          const { carts } = get();

          console.log(`[REORDER] Starting reorder with ${items.length} items from ${storeName}`);

          // Get current user ID
          const currentUser = useUserStore.getState().currentUser;

          // Create a new cart for the reorder
          const reorderCart: Cart = {
            storeId: storeId,
            storeName: storeName,
            storeCategory: category,
            items: items,
            selectedCard: undefined,
            isReorder: true, // Mark this cart as a reorder
            ...(currentUser?.id ? { userId: currentUser.id } : {}),
          };

          // Add the reorder cart to existing carts
          set({
            carts: [...carts, reorderCart],
            shouldOpenCart: true, // Trigger cart to open
          });

          console.log(`[REORDER] Reorder cart added with isReorder flag`);
        },

        // Cart sidebar control methods
        triggerOpenCart: () => {
          console.log('[CART] Triggering cart open');
          set({ shouldOpenCart: true });
        },

        resetOpenCartTrigger: () => {
          set({ shouldOpenCart: false });
        },

        // Initialize carts from database
        initializeCartsFromDB: (carts: Cart[]) => {
          const { carts: existingCarts } = get();
          const currentUser = useUserStore.getState().currentUser;

          // Separate guest carts (no userId) from user carts (with userId)
          const guestCarts = existingCarts.filter(cart => !cart?.userId);
          const userCarts = existingCarts.filter(cart => cart?.userId);

          console.log(`[CART] Initializing carts from database`);
          console.log(
            `[CART] Guest carts: ${guestCarts.length}, User carts: ${userCarts.length}, DB carts: ${carts.length}`
          );

          // If user is logged in and there are guest carts, assign userId to them
          let cartsToMerge = guestCarts;
          if (currentUser?.id && guestCarts.length > 0) {
            cartsToMerge = guestCarts.map(cart => ({
              ...cart,
              userId: currentUser.id,
            }));
            console.log(`[CART] Assigned userId to ${guestCarts.length} guest carts`);
          }

          // Import merge utility
          import('@/lib/utils/cart-merge').then(({ mergeGuestCartsWithDBCarts }) => {
            // Step 1: Merge guest carts (now with userId) with existing user carts
            const mergedGuestAndUserCarts = mergeGuestCartsWithDBCarts(cartsToMerge, userCarts);

            // Step 2: If no DB carts, use the merged guest+user carts
            if (carts.length === 0) {
              set({ carts: mergedGuestAndUserCarts, isInitialized: true });
              return;
            }

            // Step 3: Merge the combined guest+user carts with DB carts
            // This will merge any remaining carts
            const finalMergedCarts = mergeGuestCartsWithDBCarts(mergedGuestAndUserCarts, carts);
            set({ carts: finalMergedCarts, isInitialized: true });
          });
        },
      }),
      {
        name: 'carts',
        partialize: state => ({
          carts: state.carts,
          isGroupOrder: state.isGroupOrder,
          groupOrderId: state.groupOrderId,
          isInitialized: state.isInitialized,
        }),
        merge: (persistedState: any, currentState) => {
          let carts: Cart[] = [];

          // Migration from old single cart structure (cart field)
          if (
            persistedState.cart &&
            typeof persistedState.cart === 'object' &&
            persistedState.cart.items
          ) {
            console.log('[CART] Migrating from single cart to multiple carts');
            carts = [persistedState.cart];
          }
          // Migration from old items-based structure
          else if (
            persistedState.items &&
            Array.isArray(persistedState.items) &&
            persistedState.items.length > 0
          ) {
            console.log('[CART] Migrating old items array to new Cart format');

            // Extract store info from first item (old structure had storeId/restaurantId on items)
            const firstItem = persistedState.items[0];
            const storeId = firstItem.restaurantId || firstItem.storeId || 'unknown';
            const category = firstItem.category || 'grocery';
            const storeName = firstItem.storeName || getStoreNameFromStoreId(storeId, category);

            // Create new Cart structure with cleaned items (remove vendor info from items)
            carts = [
              {
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
                })),
              },
            ];
          }
          // Use existing carts if available
          else if (persistedState.carts && Array.isArray(persistedState.carts)) {
            carts = persistedState.carts;
          }

          return {
            ...currentState,
            ...persistedState,
            carts,
          };
        },
      }
    ),
    {
      name: 'CartStore',
      enabled: true,
    }
  )
);

// Helper function to add a product to cart
export function addProductToCart(
  product: Product & { storeName?: string },
  category: CartCategory,
  storeOrRestaurantId: string
) {
  const cartStore = useCartStore.getState();

  // Set the category first to ensure correct behavior
  cartStore.setCategory(category);

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
    storeOrRestaurantId // Pass storeId
  );
}
