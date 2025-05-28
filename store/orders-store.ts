import { create } from "zustand"
import { devtools } from "zustand/middleware"
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
    (set, get) => ({
      orders: orderData, // Initialize with existing order data

      addOrder: (orderInfo) => {
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
            name: item.name,
            quantity: item.quantity,
            price: typeof item.price === 'number' 
              ? item.price 
              : parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
          })),
          status: 'Delivered',
          orderType: 'Personal',
          isDashPass: false
        }

        set(state => ({
          orders: [newOrder, ...state.orders] // Add new order at the beginning
        }))
      },

      getOrders: () => get().orders
    }),
    {
      name: "OrdersStore",
      enabled: true,
    }
  )
) 