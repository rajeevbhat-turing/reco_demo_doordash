'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface TopChain {
  id: string;
  name: string;
  cuisine: string;
  rating: number | null;
}

export interface TopCuisine {
  name: string;
  restaurantCount: number;
  avgRating: number | null;
}

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_ARRAY: TopChain[] = [];

/**
 * Hook to fetch top chains (restaurants with rating > 4.5)
 */
export function useTopChains() {
  const query = useQuery<TopChain[]>({
    queryKey: ['top-chains'],
    queryFn: async () => {
      const response = await fetch('/api/top-chains');
      if (!response.ok) {
        throw new Error('Failed to fetch top chains');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch top chains');
      }
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize the data to prevent creating new array references
  const data = useMemo(() => query.data ?? EMPTY_ARRAY, [query.data]);

  return {
    ...query,
    data,
  };
}

/**
 * Hook to get top cuisines derived from top chains
 * Returns unique cuisines from restaurants with rating > 4.5
 */
export function useTopCuisines() {
  const { data: chains = [] } = useTopChains();

  // Derive unique cuisines from top chains
  const cuisines = useMemo(() => {
    if (!chains || chains.length === 0) return [];

    // Group chains by cuisine
    const cuisineMap = new Map<string, { count: number; totalRating: number }>();

    chains.forEach((chain) => {
      if (!chain.cuisine) return;

      const existing = cuisineMap.get(chain.cuisine);
      if (existing) {
        existing.count += 1;
        if (chain.rating) {
          existing.totalRating += chain.rating;
        }
      } else {
        cuisineMap.set(chain.cuisine, {
          count: 1,
          totalRating: chain.rating || 0,
        });
      }
    });

    // Convert to array and calculate average rating
    const cuisineArray: TopCuisine[] = Array.from(cuisineMap.entries()).map(([name, data]) => ({
      name,
      restaurantCount: data.count,
      avgRating: data.count > 0 ? parseFloat((data.totalRating / data.count).toFixed(1)) : null,
    }));

    // Sort by average rating descending, then by name
    return cuisineArray.sort((a, b) => {
      if (a.avgRating !== null && b.avgRating !== null) {
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
      }
      return a.name.localeCompare(b.name);
    });
  }, [chains]);

  return cuisines;
}

