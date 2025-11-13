import { useQuery } from '@tanstack/react-query';
import { fetchUserCarts } from '@/lib/api/carts';
import { useUserStore } from '@/store/user-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect } from 'react';

export function useCarts() {
  const currentUser = useUserStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const initializeCartsFromDB = useCartStore((state) => state.initializeCartsFromDB);
  const isInitialized = useCartStore((state) => state.isInitialized);

  const { data: carts, isLoading, error } = useQuery({
    queryKey: ['carts', userId],
    queryFn: () => fetchUserCarts(userId!),
    enabled: !!userId && !isInitialized, // Only fetch if user is logged in and store not initialized
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize cart store with fetched carts (only if not already initialized)
  useEffect(() => {
    if (carts && carts.length > 0 && !isInitialized) {
      console.log('✅ Initializing cart store with', carts.length, 'carts from database');
      initializeCartsFromDB(carts);
    }
  }, [carts, isInitialized, initializeCartsFromDB]);

  return {
    carts: carts || [],
    isLoading,
    error,
  };
}

