import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '@/lib/api/orders';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useEffect } from 'react';
import { calculateOrderCompletionTime, COMPLETED_STATUSES } from '@/lib/utils/order-utils';

export function useOrders() {
  const currentUser = useUserStore(state => state.currentUser);
  const userId = currentUser?.id;
  const initializeOrdersFromDB = useOrdersStore(state => state.initializeOrdersFromDB);
  const isInitialized = useOrdersStore(state => state.isInitialized);
  const existingOrders = useOrdersStore(state => state.orders);

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId && !isInitialized, // Only fetch if user is logged in and store not initialized
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Reset isInitialized when user logs out
  useEffect(() => {
    if (!userId && isInitialized) {
      console.log('✅ User logged out, resetting orders initialization state');
      useOrdersStore.setState({ isInitialized: false });
    }
  }, [userId, isInitialized]);

  // Initialize orders store with fetched orders (only if not already initialized)
  useEffect(() => {
    if (orders && orders.length > 0 && !isInitialized && userId) {
      // Check if any of the current user's orders are already present in the store
      const hasUserOrders = existingOrders.some(order => order.userId === userId);

      if (hasUserOrders) {
        // If at least one order for current user exists, initialize with empty array so we don't overwrite the existing orders
        console.log('✅ User orders already present in store, initializing with empty array');
        initializeOrdersFromDB([]);
      } else {
        // Otherwise, add userId and orderStatusUpdatedAt to each order and initialize
        console.log('✅ Initializing orders store with', orders.length, 'orders from database');

        const ordersWithMetadata = orders.map(order => {
          const isCompleted = COMPLETED_STATUSES.includes(order.status.toLowerCase());

          // Add orderStatusUpdatedAt for completed orders if not already present
          const orderStatusUpdatedAt =
            isCompleted && !order.orderStatusUpdatedAt
              ? calculateOrderCompletionTime(
                  order.orderDate,
                  order.status,
                  order.deliveryOption?.deliveryTime
                )
              : order.orderStatusUpdatedAt;

          return {
            ...order,
            userId: userId,
            orderStatusUpdatedAt,
          };
        });

        initializeOrdersFromDB(ordersWithMetadata);
      }
    }
  }, [orders, isInitialized, initializeOrdersFromDB, userId, existingOrders]);

  return {
    orders: orders || [],
    isLoading,
    error,
  };
}