import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Product } from "@/types"
import { restaurants } from "@/constants/restaurants"
import { convenienceStores } from "@/data/convenience-store-data"
import { usePersistedState } from "@/lib/hooks/usePersistedState"

// Define supported cart categories
export type CartCategory = "restaurant" | "grocery" | "retail" | "pets" | "convenience"

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
interface PersistedCartStore {
  // State
  items: CartItem[]
  currentCategory: CartCategory
  currentStoreId: string | null
  currentRestaurantId: string | null
  isGroupOrder: boolean
  groupOrderId: string | null
  totalCartValue: number

  // Category methods
  setCategory: (category: CartCategory) => void
  getConfig: () => CategoryConfig

  // Cart operations
  addItem: (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory, storeName?: string) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void

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

  // Update total cart value
  updateTotalCartValue: () => void
}

// Custom hook that integrates with our persisted state system
export function usePersistedCartStore(runId: string = 'default-cart-run') {
  // Use our persisted state hook for cart items
  const [items, setItems] = usePersistedState<CartItem[]>('persisted-cart.items', [], { runId });
  const [currentCategory, setCurrentCategory] = usePersistedState<CartCategory>('persisted-cart.category', 'grocery', { runId });
  const [currentStoreId, setCurrentStoreId] = usePersistedState<string | null>('persisted-cart.storeId', null, { runId });
  const [currentRestaurantId, setCurrentRestaurantId] = usePersistedState<string | null>('persisted-cart.restaurantId', null, { runId });
  const [isGroupOrder, setIsGroupOrder] = usePersistedState<boolean>('persisted-cart.isGroupOrder', false, { runId });
  const [groupOrderId, setGroupOrderId] = usePersistedState<string | null>('persisted-cart.groupOrderId', null, { runId });
  const [totalCartValue, setTotalCartValue] = usePersistedState<number>('persisted-cart.totalValue', 0, { runId });

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
  };

  const removeItem = (id: string | number) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    
    if (newItems.length === 0) {
      setCurrentStoreId(null);
      setCurrentRestaurantId(null);
    }
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      const newItems = items.map((item) => 
        item.id === id ? { ...item, quantity } : item
      );
      setItems(newItems);
    }
  };

  const clearCart = () => {
    setItems([]);
    setCurrentStoreId(null);
    setCurrentRestaurantId(null);
    setTotalCartValue(0);
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

  return {
    items,
    currentCategory,
    currentStoreId,
    currentRestaurantId,
    isGroupOrder,
    groupOrderId,
    totalCartValue,
    setCategory: setCurrentCategory,
    getConfig,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getServiceFee,
    getDeliveryFee,
    getTotal,
    getTotalPrice,
    hasDifferentStore,
    hasDifferentRestaurant,
    updateTotalCartValue,
  };
}
