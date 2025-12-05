import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Order } from '@/constants/order-data';

interface OrdersStore {
  orders: Order[];
  isInitialized: boolean; // Track if store has been initialized from DB
  addOrder: (order: Order) => void;
  getOrders: () => Order[];
  updateOrderReview: (orderId: string, rating: number, reviewText: string) => void;
  initializeOrdersFromDB: (orders: Order[]) => void;
}

export const useOrdersStore = create<OrdersStore>()(
  devtools(
    persist(
      (set, get) => ({
        orders: [], // Initialize with empty array - no dummy data
        isInitialized: false,

        addOrder: order => {
          console.log('[ORDERS STORE] Adding new order:', order.id, order.storeName);

          set(state => {
            const newOrders = [order, ...state.orders];
            console.log('[ORDERS STORE] Total orders after add:', newOrders.length);
            return { orders: newOrders };
          });
        },

        getOrders: () => get().orders,

        updateOrderReview: (orderId, rating, reviewText) => {
          const reviewDate = new Date().toLocaleDateString('en-US');
          set(state => ({
            orders: state.orders.map(o =>
              o.id === orderId ? { ...o, rating, reviewDate, reviewText } : o
            ),
          }));
        },

        initializeOrdersFromDB: orders => {
          console.log(`[ORDERS STORE] Initializing ${orders.length} orders from database`);
          set(state => {
            const newOrders = [...orders, ...state.orders];
            return { orders: newOrders, isInitialized: true };
          });
        },
      }),
      {
        name: 'orders-store',
      }
    ),
    {
      name: 'OrdersStore',
      enabled: true,
    }
  )
);
