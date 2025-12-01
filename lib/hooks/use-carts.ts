import { useQuery } from '@tanstack/react-query';
import { fetchUserCarts } from '@/lib/api/carts';
import { useUserStore } from '@/store/user-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect } from 'react';

export function useCarts() {
  const currentUser = useUserStore(state => state.currentUser);
  const userId = currentUser?.id;
  const initializeCartsFromDB = useCartStore((state) => state.initializeCartsFromDB);
  const isInitialized = useCartStore((state) => state.isInitialized);
  const existingCarts = useCartStore((state) => state.carts);

  const {
    data: carts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['carts', userId],
    queryFn: () => fetchUserCarts(userId!),
    enabled: !!userId && !isInitialized, // Only fetch if user is logged in and store not initialized
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Reset isInitialized when user logs out
  useEffect(() => {
    if (!userId && isInitialized) {
      console.log('✅ User logged out, resetting cart initialization state');
      useCartStore.setState({ isInitialized: false });
    }
  }, [userId, isInitialized]);

  // Initialize cart store with fetched carts (only if not already initialized)
  // This also triggers cart merging when user logs in
  useEffect(() => {
    if (carts !== undefined && !isInitialized && userId) {
      // Check if any of the current user's carts are already present in the store
      const hasUserCarts = existingCarts.some(cart => cart.userId === userId);
      
      if (hasUserCarts) {
        // If at least one cart for current user exists, initialize with empty array so we don't overwrite the existing carts
        console.log('✅ User carts already present in store, initializing with empty array');
        initializeCartsFromDB([]);
      } else {
        // Otherwise, add userId to each cart and initialize
        console.log('✅ Initializing cart store with', carts.length, 'carts from database');
        const cartsWithUserId = carts.map(cart => ({
          ...cart,
          userId: userId,
        }));
        initializeCartsFromDB(cartsWithUserId);
      }
    }
  }, [carts, isInitialized, initializeCartsFromDB, userId, existingCarts]);

  return {
    carts: carts || [],
    isLoading,
    error,
  };
}
