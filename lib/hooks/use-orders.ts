import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '@/lib/api/orders';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useEffect } from 'react';

export function useOrders() {
  const currentUser = useUserStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const initializeOrdersFromDB = useOrdersStore((state) => state.initializeOrdersFromDB);
  const isInitialized = useOrdersStore((state) => state.isInitialized);
  const storeOrders = useOrdersStore((state) => state.orders);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId, // Only fetch if user is logged in
    staleTime: 1000 * 10, // 10 seconds - refresh more frequently
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time sync
  });

  // Sync orders store with database orders, but don't overwrite with empty array
  useEffect(() => {
    if (orders && Array.isArray(orders)) {
      // Only sync if:
      // 1. We have orders from DB, OR
      // 2. Store hasn't been initialized yet (first load)
      if (orders.length > 0 || !isInitialized) {
        console.log('✅ Syncing orders store with', orders.length, 'orders from database');
        initializeOrdersFromDB(orders);
      } else if (orders.length === 0 && isInitialized && storeOrders.length > 0) {
        // If DB returns empty but store has orders, keep store orders (user might not be logged in or DB might be empty)
        console.log('⏭️ Skipping sync - DB has no orders but store has', storeOrders.length, 'orders');
      }
    }
  }, [orders, initializeOrdersFromDB, isInitialized, storeOrders.length]);

  return {
    orders: orders || [],
    isLoading,
    error,
  };
}

