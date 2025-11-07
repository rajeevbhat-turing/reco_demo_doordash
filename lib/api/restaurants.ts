import { Restaurant } from '@/constants/restaurants';

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
 * Parameters for fetching restaurants
 */
interface FetchRestaurantsParams {
  lat: number;
  lng: number;
  radius?: number;
}

/**
 * Fetch restaurants within a radius of user's location
 * 
 * @param params - Location parameters (lat, lng, radius)
 * @returns Array of restaurants with calculated distances
 */
export async function fetchRestaurants(params: FetchRestaurantsParams): Promise<Restaurant[]> {
  const { lat, lng, radius = 10 } = params;

  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
  });

  const response = await fetch(`/api/restaurants?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
  }

  const result: RestaurantsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch restaurants');
  }

  return result.data;
}



