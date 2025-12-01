import type { Restaurant } from '@/constants/restaurants';
import { Address } from '@/lib/types/user-types';
import { calculateDistance } from './distance-utils';

/**
 * Filter restaurants based on distance from selected address
 * @param restaurants - Array of restaurants to filter
 * @param selectedAddress - The selected address for authenticated users (can be null)
 * @param tempAddress - Temporary address for non-authenticated users (can be null)
 * @param radiusMiles - Radius in miles (default: 3)
 * @returns Filtered array of restaurants within the radius
 */
export function filterRestaurantsByLocation(
  restaurants: Restaurant[],
  selectedAddress: Address | null | undefined,
  tempAddress: Address | null | undefined,
  radiusMiles: number = 3
): Restaurant[] {
  // If no address selected (neither authenticated nor temp), return all restaurants
  const activeAddress = selectedAddress || tempAddress || null;

  if (!activeAddress) {
    return restaurants;
  }

  // Validate that address has coordinates
  if (typeof activeAddress.lat !== 'number' || typeof activeAddress.lng !== 'number') {
    console.warn('[LOCATION FILTER] Address missing valid coordinates, showing all restaurants');
    return restaurants;
  }

  // Filter restaurants that are within the radius
  return restaurants.filter(restaurant => {
    // Validate that restaurant has coordinates
    if (typeof restaurant.lat !== 'number' || typeof restaurant.lng !== 'number') {
      // If restaurant doesn't have coordinates, exclude it from location filtering
      // This ensures we only show restaurants with valid location data
      return false;
    }

    // Calculate distance from user's address to restaurant
    const distance = calculateDistance(
      activeAddress.lat,
      activeAddress.lng,
      restaurant.lat,
      restaurant.lng
    );

    // Return true if restaurant is within the radius
    return distance <= radiusMiles;
  });
}
