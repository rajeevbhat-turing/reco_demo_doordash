'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Deal } from '@/types/deal-types';

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_DEALS_ARRAY: Deal[] = [];

/**
 * Fetch deals from API
 *
 * @param restaurantId - Optional restaurant ID
 *   - If provided: returns restaurant-specific deals + common deals
 *   - If not provided: returns only common deals
 */
export function useDeals(restaurantId?: string | number) {
  const query = useQuery<Deal[]>({
    queryKey: ['deals', restaurantId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (restaurantId) {
        searchParams.set('restaurantId', String(restaurantId));
      }

      const response = await fetch(`/api/deals?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch deals');
      }

      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Fetch only common deals (restaurant_id IS NULL)
 */
export function useCommonDeals() {
  return useDeals(); // No restaurantId = only common deals
}

/**
 * Fetch all deals (restaurant-specific + common deals)
 * Useful for getting a list of all restaurants that have deals
 * @param enabled - Whether to fetch deals (default: true)
 */
export function useAllDeals(enabled: boolean = true) {
  const query = useQuery<Deal[]>({
    queryKey: ['deals', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/deals?all=true');
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch deals');
      }
      return result.data || [];
    },
    enabled, // Only fetch when enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize the data to prevent creating new array references
  // Use stable empty array reference when data is undefined
  const data = useMemo(() => query.data ?? EMPTY_DEALS_ARRAY, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Get deals for store page: DashPass + restaurant-specific deals only
 * Filters the API response to show only DashPass (restaurantId is null) + restaurant-specific deals
 */
export function useDealsByRestaurantId(restaurantId: string | number) {
  const { data, isLoading, error, refetch } = useDeals(restaurantId);

  // Filter deals: DashPass (id = 'dashpass-delivery-fee') + restaurant-specific (restaurantId matches)
  // TEMPORARILY DISABLED: DashPass deal
  const filteredDeals = useMemo(() => {
    return data.filter(
      (deal: Deal) =>
        // deal.id === 'dashpass-delivery-fee' || // TEMPORARILY DISABLED
        deal.restaurantId === String(restaurantId)
    );
  }, [data, restaurantId]);

  // Separate into categories
  const dashpassDeal = null; // TEMPORARILY DISABLED: filteredDeals.find((deal: Deal) => deal.id === 'dashpass-delivery-fee') || null;
  const restaurantDeals = filteredDeals.filter((deal: Deal) => deal.id !== 'dashpass-delivery-fee');

  return {
    allDeals: filteredDeals,
    dashpassDeal,
    restaurantDeals,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get deals for checkout page: restaurant-specific + common deals (no DashPass deal)
 */
export function useCheckoutDeals(restaurantId?: string | number) {
  const { data, isLoading, error, refetch } = useDeals(restaurantId);

  // Filter: restaurant-specific + common deals, excluding DashPass
  const filteredDeals = useMemo(() => {
    return data.filter((deal: Deal) => {
      if (deal.id === 'dashpass-delivery-fee') return false;
      if (restaurantId) {
        // Include restaurant-specific deals OR common deals (restaurantId is null)
        return deal.restaurantId === String(restaurantId) || deal.restaurantId === null;
      }
      // No restaurantId - only common deals
      return deal.restaurantId === null;
    });
  }, [data, restaurantId]);

  // Separate into categories
  const restaurantDeals = filteredDeals.filter((deal: Deal) => deal.restaurantId !== null);
  const commonDeals = filteredDeals.filter((deal: Deal) => deal.restaurantId === null);

  return {
    data: filteredDeals,
    restaurantDeals,
    commonDeals,
    isLoading,
    error,
    refetch,
  };
}
