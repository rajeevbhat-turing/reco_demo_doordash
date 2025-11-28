import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '@/lib/api/orders';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useEffect } from 'react';

export function useOrders() {
  const currentUser = useUserStore(state => state.currentUser);
  const userId = currentUser?.id;
  const initializeOrdersFromDB = useOrdersStore(state => state.initializeOrdersFromDB);
  const isInitialized = useOrdersStore(state => state.isInitialized);

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

  // Initialize orders store with fetched orders (only if not already initialized)
  useEffect(() => {
    if (orders && orders.length > 0 && !isInitialized) {
      console.log('✅ Initializing orders store with', orders.length, 'orders from database');
      initializeOrdersFromDB(orders);
    }
  }, [orders, isInitialized, initializeOrdersFromDB]);

  return {
    orders: orders || [],
    isLoading,
    error,
  };
}
