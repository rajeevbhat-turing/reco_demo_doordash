'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRestaurants } from '@/lib/api/restaurants';
import type { Restaurant } from '@/constants/restaurants';

/**
 * Hook to fetch restaurants near a specific location
 * 
 * Uses TanStack Query for caching and state management
 * 
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param radius - Search radius in miles (default: 10)
 * @returns Query result with restaurants data
 * 
 * @example
 * ```tsx
 * const address = user?.addresses.find(a => a.default);
 * const { data: restaurants, isLoading } = useRestaurants(
 *   address?.lat,
 *   address?.lng
 * );
 * ```
 */
export function useRestaurants(lat?: number, lng?: number, radius: number = 10) {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', lat, lng, 2000],
    queryFn: () => {
      if (!lat || !lng) {
        throw new Error('Location coordinates are required');
      }
      return fetchRestaurants({ lat, lng, radius: 2000 });
    },
    enabled: !!lat && !!lng, // Only fetch if coordinates are provided
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1, // Retry once on failure
  });
}



