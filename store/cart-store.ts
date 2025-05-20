import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  restaurantId: string
  name: string
  price: string
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get()

        // If cart is empty or from the same restaurant
        if (items.length === 0 || restaurantId === item.restaurantId) {
          const existingItem = items.find((i) => i.id === item.id)

          if (existingItem) {
            // Increment quantity if item already exists
            set({
              items: items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            })
          } else {
            // Add new item with quantity 1
            set({
              items: [...items, { ...item, quantity: 1 }],
              restaurantId: item.restaurantId,
            })
          }
        } else {
          // If trying to add item from different restaurant, clear cart first
          set({
            items: [{ ...item, quantity: 1 }],
            restaurantId: item.restaurantId,
          })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        const newItems = items.filter((item) => item.id !== id)

        set({
          items: newItems,
          restaurantId: newItems.length > 0 ? get().restaurantId : null,
        })
      },

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
      },

      clearCart: () => {
        set({
          items: [],
          restaurantId: null,
        })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const total = get().items.reduce((sum, item) => {
          const price = Number.parseFloat(item.price.replace(/[^0-9.]/g, ""))
          return sum + price * item.quantity
        }, 0)

        return `A$${total.toFixed(2)}`
      },
    }),
    {
      name: "doordash-cart",
    },
  ),
)
