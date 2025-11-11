import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '@/lib/api/orders';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useEffect, useRef } from 'react';

export function useOrders() {
  const currentUser = useUserStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const initializeOrdersFromDB = useOrdersStore((state) => state.initializeOrdersFromDB);
  const currentOrders = useOrdersStore((state) => state.orders);
  const hasInitialized = useRef(false);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId!),
    enabled: !!userId, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize orders store with fetched orders (only once per session)
  useEffect(() => {
    if (orders && orders.length > 0 && currentOrders.length === 0 && !hasInitialized.current) {
      console.log('✅ Initializing orders store with', orders.length, 'orders from database');
      initializeOrdersFromDB(orders);
      hasInitialized.current = true;
    }
  }, [orders, currentOrders.length, initializeOrdersFromDB]);

  return {
    orders: orders || [],
    isLoading,
    error,
  };
}

