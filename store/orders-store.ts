import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { orderData, Order, OrderItem } from "@/constants/order-data"
import { CartItem } from "./cart-store"

interface OrdersStore {
  orders: Order[]
  addOrder: (orderData: {
    orderId: string
    storeName: string
    storeId: string
    category: string
    items: CartItem[]
    total: number
    deliveryTime?: string
    scheduledTime?: string
  }) => void
  getOrders: () => Order[]
}

export const useOrdersStore = create<OrdersStore>()(
  devtools(
    persist(
      (set, get) => ({
        orders: orderData, // Initialize with existing order data

        addOrder: (orderInfo) => {
          console.log('[ORDERS STORE] Adding new order:', orderInfo.orderId, orderInfo.storeName)
          const newOrder: Order = {
            id: orderInfo.orderId,
            restaurantId: orderInfo.storeId,
            restaurantName: orderInfo.storeName,
            orderDate: new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            }),
            totalAmount: orderInfo.total,
            items: orderInfo.items.map(item => ({
              id: item.id.toString(),
              name: item.itemName,
              quantity: item.quantity,
              price: typeof item.price === 'number' 
                ? item.price 
                : parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
            })),
            status: 'Delivered',
            orderType: 'Personal',
            isDashPass: false
          }

          set(state => {
            const newOrders = [newOrder, ...state.orders]
            console.log('[ORDERS STORE] Total orders after add:', newOrders.length)
            return { orders: newOrders }
          })
        },

        getOrders: () => get().orders
      }),
      {
        name: "orders-store",
        enabled: true,
      }
    ),
    {
      name: "OrdersStore",
      enabled: true,
    }
  )
) 