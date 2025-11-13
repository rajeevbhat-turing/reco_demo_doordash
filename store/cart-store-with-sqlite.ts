import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Product } from "@/types"
import { restaurants } from "@/constants/restaurants"
import { usePersistedState } from "@/lib/hooks/usePersistedState"
import { useState } from "react"

// Define supported cart categories
export type CartCategory = "restaurant"

// Base cart item interface
export interface CartItem {
  id: number | string
  itemName: string
  price: number | string
  image: string
  quantity: number
  storeId?: string
  restaurantId?: string
  storeName?: string
  customizations?: string
  category: CartCategory
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
  categories?: string[]
  priceRange?: string
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

// Helper function to get store name from store ID
const getStoreNameFromStoreId = (storeId: string, category?: CartCategory): string => {
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
  
  // Fallback logic
  if (convenienceStores[storeId]) {
    return convenienceStores[storeId].name
  }
  
  const { allPetStores } = require("@/data/pet-data")
  const petStore = allPetStores.find((store: any) => store.id === storeId)
  if (petStore) {
    return petStore.name
  }
  
  const { stores } = require("@/data/store-data")
  if (stores[storeId]) {
    return stores[storeId].name
  }
  
  try {
    const { stores: retailStores } = require("@/constants/store")
    if (retailStores[storeId]) {
      return retailStores[storeId].name
    }
  } catch (error) {
    // Ignore if retail stores data is not available
  }
  
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
  currentStore: Record<string, any>
  lastClearInfo: { itemsBeforeClear: number; timestamp: number } | null
  maxItemsReached: number
  verifierConsumed: boolean
  lastSearchInfo: { searchTerm: string; timestamp: number; navigatedFromSearch: boolean } | null
  searchVerifierConsumed: boolean
  lastRemovalInfo: { removedItems: CartItem[]; timestamp: number } | null
  removalVerifierConsumed: boolean
  lastQuantityChangeInfo: { itemName: string; oldQuantity: number; newQuantity: number; timestamp: number } | null
  quantityVerifierConsumed: boolean
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

// Custom hook that integrates SQLite persistence with the existing cart store
export function useCartStoreWithSQLite(runId: string = 'main-app-cart') {
  // Use our persisted state hook for cart items
  const [items, setItems] = usePersistedState<CartItem[]>('cart', []);
  const [currentCategory, setCurrentCategory] = usePersistedState<CartCategory>('cart_category', 'grocery');
  const [currentStoreId, setCurrentStoreId] = usePersistedState<string | null>('cart.storeId', null);
  const [currentRestaurantId, setCurrentRestaurantId] = usePersistedState<string | null>('cart.restaurantId', null);
  const [isGroupOrder, setIsGroupOrder] = usePersistedState<boolean>('cart.isGroupOrder', false);
  const [groupOrderId, setGroupOrderId] = usePersistedState<string | null>('cart.groupOrderId', null);
  const [searchResults, setSearchResults] = usePersistedState<SearchResult[]>('cart.searchResults', []);
  const [totalCartValue, setTotalCartValue] = usePersistedState<number>('cart.totalValue', 0);
  const [currentStore, setCurrentStore] = usePersistedState<Record<string, any>>('cart.currentStore', {});
  const [visitedStores, setVisitedStores] = usePersistedState<string[]>('cart.visitedStores', []);
  
  // Non-persisted state (verifier tracking, etc.)
  const [lastClearInfo, setLastClearInfo] = useState<{ itemsBeforeClear: number; timestamp: number } | null>(null);
  const [maxItemsReached, setMaxItemsReached] = useState(0);
  const [verifierConsumed, setVerifierConsumed] = useState(false);
  const [lastSearchInfo, setLastSearchInfo] = useState<{ searchTerm: string; timestamp: number; navigatedFromSearch: boolean } | null>(null);
  const [searchVerifierConsumed, setSearchVerifierConsumed] = useState(false);
  const [lastRemovalInfo, setLastRemovalInfo] = useState<{ removedItems: CartItem[]; timestamp: number } | null>(null);
  const [removalVerifierConsumed, setRemovalVerifierConsumed] = useState(false);
  const [lastQuantityChangeInfo, setLastQuantityChangeInfo] = useState<{ itemName: string; oldQuantity: number; newQuantity: number; timestamp: number } | null>(null);
  const [quantityVerifierConsumed, setQuantityVerifierConsumed] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState<{ 
    orderId: string
    tipAmount: number
    orderTotal: number
    timestamp: number
    isCompleted: boolean
    storeName: string
    category: string
    items: CartItem[]
  } | null>(null);
  const [orderVerifierConsumed, setOrderVerifierConsumed] = useState(false);

  const getConfig = () => categoryConfigs[currentCategory];

  const addItem = (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory, storeName?: string) => {
    const itemCategory = category || currentCategory;
    const itemName = item.itemName || "Unknown Item";

    let resolvedStoreName = storeName;
    if (!resolvedStoreName) {
      if (item.restaurantId) {
        resolvedStoreName = getStoreNameFromRestaurantId(item.restaurantId);
      } else if (item.storeId) {
        resolvedStoreName = getStoreNameFromStoreId(item.storeId, itemCategory);
      } else {
        resolvedStoreName = "Unknown Store";
      }
    }

    const existingItem = items.find((i) => i.id === item.id);
    let newItems: CartItem[];

    if (existingItem) {
      newItems = items.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newItems = [
        ...items,
        {
          ...item,
          itemName,
          storeName: resolvedStoreName,
          quantity: 1,
          category: itemCategory,
        },
      ];
    }

    setItems(newItems);
    setCurrentCategory(itemCategory);
    setCurrentStoreId(item.storeId || currentStoreId);
    setCurrentRestaurantId(item.restaurantId || currentRestaurantId);
    
    // Update max items reached
    const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
    setMaxItemsReached(Math.max(maxItemsReached, newTotalItems));
    
    // Reset verifier consumption
    setVerifierConsumed(false);
  };

  const removeItem = (id: string | number) => {
    const removedItem = items.find((item) => item.id === id);
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    
    if (newItems.length === 0) {
      setCurrentStoreId(null);
      setCurrentRestaurantId(null);
    }
    
    // Track removal for verifiers
    if (removedItem) {
      setLastRemovalInfo({ removedItems: [removedItem], timestamp: Date.now() });
    }
    
    // Check if cart became empty after having 3+ items
    const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
    if (newTotalItems === 0 && maxItemsReached >= 3) {
      setLastClearInfo({ itemsBeforeClear: maxItemsReached, timestamp: Date.now() });
    }
    
    setVerifierConsumed(false);
    setRemovalVerifierConsumed(false);
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    const existingItem = items.find((item) => item.id === id);
    
    let newItems: CartItem[];
    if (quantity <= 0) {
      newItems = items.filter((item) => item.id !== id);
    } else {
      newItems = items.map((item) => 
        item.id === id ? { ...item, quantity } : item
      );
      
      // Track quantity change for verifiers
      if (existingItem && existingItem.quantity !== quantity) {
        setLastQuantityChangeInfo({ 
          itemName: existingItem.itemName, 
          oldQuantity: existingItem.quantity, 
          newQuantity: quantity, 
          timestamp: Date.now() 
        });
      }
    }
    
    setItems(newItems);
    
    if (newItems.length === 0) {
      setCurrentStoreId(null);
      setCurrentRestaurantId(null);
    }
    
    // Check if cart became empty after having 3+ items
    const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
    if (newTotalItems === 0 && maxItemsReached >= 3) {
      setLastClearInfo({ itemsBeforeClear: maxItemsReached, timestamp: Date.now() });
    }
    
    setVerifierConsumed(false);
    setQuantityVerifierConsumed(false);
  };

  const clearCart = () => {
    const currentTotalItems = items.reduce((total, item) => total + item.quantity, 0);
    const itemsBeforeClear = Math.max(currentTotalItems, maxItemsReached);
    
    setItems([]);
    setCurrentStoreId(null);
    setCurrentRestaurantId(null);
    setTotalCartValue(0);
    setLastClearInfo({ itemsBeforeClear, timestamp: Date.now() });
    setMaxItemsReached(0);
    setVerifierConsumed(false);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = typeof item.price === "number" 
        ? item.price 
        : Number.parseFloat(item.price.toString().replace(/[^0-9.]/g, ""));
      return sum + price * item.quantity;
    }, 0);
  };

  const getServiceFee = () => {
    const config = getConfig();
    return Math.max(getSubtotal() * config.serviceFeePercentage, config.minServiceFee);
  };

  const getDeliveryFee = () => {
    const config = getConfig();
    return getSubtotal() >= config.freeDeliveryThreshold ? 0 : config.defaultDeliveryFee;
  };

  const getTotal = () => {
    return getSubtotal() + getServiceFee() + getDeliveryFee();
  };

  const getTotalPrice = () => {
    return `$${getSubtotal().toFixed(2)}`;
  };

  const hasDifferentStore = (storeId: string) => {
    return currentStoreId !== null && currentStoreId !== storeId;
  };

  const hasDifferentRestaurant = (restaurantId: string) => {
    return currentRestaurantId !== null && currentRestaurantId !== restaurantId;
  };

  const updateTotalCartValue = () => {
    setTotalCartValue(getTotal());
  };

  const checkConflict = (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory) => {
    if (items.length === 0) {
      return { hasConflict: false, conflictType: null };
    }

    const itemCategory = category || currentCategory;
    let hasConflict = false;
    let conflictType: "restaurant" | "store" | null = null;

    // Check for category conflicts
    const existingCategories = [...new Set(items.map((cartItem) => cartItem.category))];
    if (existingCategories.length > 0 && !existingCategories.includes(itemCategory)) {
      hasConflict = true;
      if (existingCategories.includes("restaurant") || itemCategory === "restaurant") {
        conflictType = "restaurant";
      } else {
        conflictType = "store";
      }
    }

    // Check for restaurant conflict
    if (itemCategory === "restaurant" && item.restaurantId && currentRestaurantId && item.restaurantId !== currentRestaurantId) {
      hasConflict = true;
      conflictType = "restaurant";
    }

    // Check for store conflict
    if (itemCategory !== "restaurant" && item.storeId && currentStoreId && item.storeId !== currentStoreId) {
      hasConflict = true;
      conflictType = "store";
    }

    return { hasConflict, conflictType };
  };

  const replaceCartWithItem = (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory, storeName?: string) => {
    const itemCategory = category || currentCategory;
    const itemName = item.itemName || "Unknown Item";

    let resolvedStoreName = storeName;
    if (!resolvedStoreName) {
      if (item.restaurantId) {
        resolvedStoreName = getStoreNameFromRestaurantId(item.restaurantId);
      } else if (item.storeId) {
        resolvedStoreName = getStoreNameFromStoreId(item.storeId, itemCategory);
      } else {
        resolvedStoreName = "Unknown Store";
      }
    }

    setItems([{
      ...item,
      itemName,
      storeName: resolvedStoreName,
      quantity: 1,
      category: itemCategory,
    }]);
    setCurrentCategory(itemCategory);
    setCurrentStoreId(item.storeId || null);
    setCurrentRestaurantId(item.restaurantId || null);
  };

  const startGroupOrder = () => {
    const groupOrderId = Math.random().toString(36).substring(2, 10);
    setIsGroupOrder(true);
    setGroupOrderId(groupOrderId);
    return groupOrderId;
  };

  const joinGroupOrder = (groupOrderId: string) => {
    setIsGroupOrder(true);
    setGroupOrderId(groupOrderId);
  };

  const leaveGroupOrder = () => {
    setIsGroupOrder(false);
    setGroupOrderId(null);
  };

  const updateSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const setCurrentStoreWithVisited = (store: Record<string, any>) => {
    console.log(`[STORE] Setting current store: ${store.name}`)
    
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
      setVisitedStores(newVisitedStores)
    }
    
    setCurrentStore(store);
    setSearchVerifierConsumed(false);
  };

  const clearCurrentStore = () => {
    setCurrentStore({});
  };

  const markVerifierConsumed = () => {
    setVerifierConsumed(true);
  };

  const recordSearch = (searchTerm: string) => {
    setLastSearchInfo({ 
      searchTerm, 
      timestamp: Date.now(), 
      navigatedFromSearch: false 
    });
    setSearchVerifierConsumed(false);
  };

  const recordNavigationFromSearch = () => {
    if (lastSearchInfo) {
      setLastSearchInfo({ 
        ...lastSearchInfo, 
        navigatedFromSearch: true 
      });
    }
  };

  const markSearchVerifierConsumed = () => {
    setSearchVerifierConsumed(true);
  };

  const markRemovalVerifierConsumed = () => {
    setRemovalVerifierConsumed(true);
  };

  const markQuantityVerifierConsumed = () => {
    setQuantityVerifierConsumed(true);
  };

  const recordOrderCompletion = (orderInfo: {
    orderId: string
    tipAmount: number
    orderTotal: number
    storeName: string
    category: string
    items: CartItem[]
  }) => {
    setLastOrderInfo({
      ...orderInfo,
      timestamp: Date.now(),
      isCompleted: true,
    });
    setOrderVerifierConsumed(false);
  };

  const markOrderVerifierConsumed = () => {
    setOrderVerifierConsumed(true);
  };

  return {
    items,
    currentCategory,
    currentStoreId,
    currentRestaurantId,
    isGroupOrder,
    groupOrderId,
    searchResults,
    totalCartValue,
    currentStore,
    visitedStores,
    lastClearInfo,
    maxItemsReached,
    verifierConsumed,
    lastSearchInfo,
    searchVerifierConsumed,
    lastRemovalInfo,
    removalVerifierConsumed,
    lastQuantityChangeInfo,
    quantityVerifierConsumed,
    lastOrderInfo,
    orderVerifierConsumed,
    setCategory: setCurrentCategory,
    getConfig,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkConflict,
    replaceCartWithItem,
    startGroupOrder,
    joinGroupOrder,
    leaveGroupOrder,
    getTotalItems,
    getSubtotal,
    getServiceFee,
    getDeliveryFee,
    getTotal,
    getTotalPrice,
    hasDifferentStore,
    hasDifferentRestaurant,
    updateSearchResults,
    clearSearchResults,
    updateTotalCartValue,
    setCurrentStore: setCurrentStoreWithVisited,
    clearCurrentStore,
    markVerifierConsumed,
    recordSearch,
    recordNavigationFromSearch,
    markSearchVerifierConsumed,
    markRemovalVerifierConsumed,
    markQuantityVerifierConsumed,
    recordOrderCompletion,
    markOrderVerifierConsumed,
  };
}
