import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantMenu, MenuData } from '@/lib/api/menu';

/**
 * Custom hook to fetch restaurant menu data
 * @param restaurantId - The restaurant ID to fetch menu for
 * @param enabled - Whether the query should run (default: true)
 * @returns Query result with menu data
 */
export function useRestaurantMenu(restaurantId: string | undefined, enabled: boolean = true) {
  return useQuery<MenuData, Error>({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: () => {
      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }
      return fetchRestaurantMenu(restaurantId);
    },
    enabled: !!restaurantId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
}

