import type { Restaurant } from '@/constants/restaurants';

/**
 * API Response type for restaurants
 */
interface RestaurantsResponse {
  success: boolean;
  data?: Restaurant[];
  meta?: {
    count: number;
    lat: number;
    lng: number;
    radius: number;
  };
  error?: string;
}

/**
 * Fetch all restaurants (for merchant portal, etc.)
 *
 * @returns Array of all restaurants
 */
export async function fetchAllRestaurants(): Promise<Restaurant[]> {
  const response = await fetch(`/api/merchant/restaurants?all=true`);

  if (!response.ok) {
    throw new Error(`Failed to fetch all restaurants: ${response.statusText}`);
  }

  const result: RestaurantsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch all restaurants');
  }

  return result.data;
}
