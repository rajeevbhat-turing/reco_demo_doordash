import { useQuery } from '@tanstack/react-query';
import { fetchUserCarts } from '@/lib/api/carts';
import { useUserStore } from '@/store/user-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect, useRef } from 'react';

export function useCarts() {
  const currentUser = useUserStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const initializeCartsFromDB = useCartStore((state) => state.initializeCartsFromDB);
  const currentCarts = useCartStore((state) => state.carts);
  const hasInitialized = useRef(false);

  const { data: carts, isLoading, error } = useQuery({
    queryKey: ['carts', userId],
    queryFn: () => fetchUserCarts(userId!),
    enabled: !!userId, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize cart store with fetched carts (only once per session)
  useEffect(() => {
    if (carts && carts.length > 0 && currentCarts.length === 0 && !hasInitialized.current) {
      console.log('✅ Initializing cart store with', carts.length, 'carts from database');
      initializeCartsFromDB(carts);
      hasInitialized.current = true;
    }
  }, [carts, currentCarts.length, initializeCartsFromDB]);

  return {
    carts: carts || [],
    isLoading,
    error,
  };
}

