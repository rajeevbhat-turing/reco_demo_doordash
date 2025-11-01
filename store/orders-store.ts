import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { Order } from "@/constants/order-data"

interface OrdersStore {
  orders: Order[]
  addOrder: (order: Order) => void
  getOrders: () => Order[]
}

export const useOrdersStore = create<OrdersStore>()(
  devtools(
    persist(
      (set, get) => ({
        orders: [], // Initialize with empty array - no dummy data

        addOrder: (order) => {
          console.log('[ORDERS STORE] Adding new order:', order.id, order.storeName)
          
          set(state => {
            const newOrders = [order, ...state.orders]
            console.log('[ORDERS STORE] Total orders after add:', newOrders.length)
            return { orders: newOrders }
          })
        },

        getOrders: () => get().orders
      }),
      {
        name: "orders-store",
      }
    ),
    {
      name: "OrdersStore",
      enabled: true,
    }
  )
) 