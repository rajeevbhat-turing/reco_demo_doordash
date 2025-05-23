import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Product } from "@/types"

// Define supported cart categories
export type CartCategory = "restaurant" | "grocery" | "retail" | "pets"

// Base cart item interface
export interface CartItem {
  id: number | string
  name: string
  price: number | string
  image: string
  quantity: number
  storeId?: string
  restaurantId?: string
  customizations?: string
  category: CartCategory // Add category to each cart item
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
}

// Cart store interface
interface CartStore {
  // State
  items: CartItem[]
  currentCategory: CartCategory
  currentStoreId: string | null
  currentRestaurantId: string | null
  
  // Category methods
  setCategory: (category: CartCategory) => void
  getConfig: () => CategoryConfig
  
  // Cart operations
  addItem: (item: Omit<CartItem, "quantity" | "category">, category?: CartCategory) => void
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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      currentCategory: "grocery" as CartCategory, // Default to grocery
      currentStoreId: null,
      currentRestaurantId: null,
      
      // Set active category and clear cart if changing categories
      setCategory: (category: CartCategory) => {
        const { currentCategory } = get()
        
        // Always reset the cart when changing categories
        if (currentCategory !== category) {
          console.log(`Changing category from ${currentCategory} to ${category} - resetting cart`)
          set({
            items: [],
            currentCategory: category,
            currentStoreId: null,
            currentRestaurantId: null,
          })
        } else {
          set({ currentCategory: category })
        }
      },
      
      // Get configuration for current category
      getConfig: () => {
        const { currentCategory } = get()
        return categoryConfigs[currentCategory]
      },
      
      // Add item to cart
      addItem: (item, category) => {
        const { 
          items, 
          currentCategory, 
          currentStoreId, 
          currentRestaurantId, 
          hasDifferentStore, 
          hasDifferentRestaurant 
        } = get()
        
        // Use provided category or default to current category
        const itemCategory = category || currentCategory
        
        // Handle restaurant items
        if (item.restaurantId) {
          // Set category to restaurant if different
          if (currentCategory !== "restaurant") {
            set({ 
              currentCategory: "restaurant",
              items: [],
              currentStoreId: null,
              currentRestaurantId: null
            })
          }
          
          // Check if from different restaurant
          if (currentRestaurantId && hasDifferentRestaurant(item.restaurantId)) {
            // Clear cart and add new item
            set({
              items: [{ ...item, quantity: 1, category: "restaurant" }],
              currentRestaurantId: item.restaurantId,
            })
            return
          }
        }
        
        // Handle store items (grocery, retail, pets)
        if (item.storeId) {
          // Check if from different store
          if (currentStoreId && hasDifferentStore(item.storeId)) {
            // Clear cart and add new item
            set({
              items: [{ ...item, quantity: 1, category: itemCategory }],
              currentStoreId: item.storeId,
            })
            return
          }
        }
        
        // Standard add to cart logic (for all items)
        const existingItem = items.find((i) => i.id === item.id)
        
        if (existingItem) {
          // Increment quantity if item already exists
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          // Add new item with quantity 1
          set({
            items: [...items, { ...item, quantity: 1, category: itemCategory }],
            currentStoreId: item.storeId || currentStoreId,
            currentRestaurantId: item.restaurantId || currentRestaurantId,
          })
        }
      },
      
      // Remove item from cart
      removeItem: (id) => {
        const { items } = get()
        const newItems = items.filter((item) => item.id !== id)
        
        set({
          items: newItems,
          currentStoreId: newItems.length > 0 ? get().currentStoreId : null,
          currentRestaurantId: newItems.length > 0 ? get().currentRestaurantId : null,
        })
      },
      
      // Update item quantity
      updateQuantity: (id, quantity) => {
        const { items } = get()
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          set({
            items: items.filter((item) => item.id !== id),
          })
        } else {
          // Update quantity
          set({
            items: items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          })
        }
        
        // Update store and restaurant IDs if cart is empty
        const updatedItems = get().items
        if (updatedItems.length === 0) {
          set({
            currentStoreId: null,
            currentRestaurantId: null,
          })
        }
      },
      
      // Clear cart
      clearCart: () => {
        set({
          items: [],
          currentStoreId: null,
          currentRestaurantId: null,
        })
      },
      
      // Get total items count
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      // Calculate subtotal
      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = typeof item.price === 'number' 
            ? item.price 
            : parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
          return sum + price * item.quantity
        }, 0)
      },
      
      // Calculate service fee
      getServiceFee: () => {
        const { getSubtotal, getConfig } = get()
        const config = getConfig()
        return Math.max(
          getSubtotal() * config.serviceFeePercentage,
          config.minServiceFee
        )
      },
      
      // Calculate delivery fee
      getDeliveryFee: () => {
        const { getSubtotal, getConfig } = get()
        const config = getConfig()
        return getSubtotal() >= config.freeDeliveryThreshold 
          ? 0 
          : config.defaultDeliveryFee
      },
      
      // Calculate total
      getTotal: () => {
        const { getSubtotal, getServiceFee, getDeliveryFee } = get()
        return getSubtotal() + getServiceFee() + getDeliveryFee()
      },
      
      // Get formatted total price (for display)
      getTotalPrice: () => {
        return `$${get().getTotal().toFixed(2)}`
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
    }),
    {
      name: "multicategory-cart",
    },
  ),
)

// Helper function to add a product to cart
export function addProductToCart(
  product: Product,
  category: CartCategory,
  storeOrRestaurantId: string
) {
  const cartStore = useCartStore.getState()
  
  // Set the category first to ensure correct behavior
  cartStore.setCategory(category)
  
  if (category === "restaurant") {
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      restaurantId: storeOrRestaurantId,
    }, category)
  } else {
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: storeOrRestaurantId,
    }, category)
  }
}