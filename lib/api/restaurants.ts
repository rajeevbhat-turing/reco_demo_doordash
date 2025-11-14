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
 * API Response type for a single restaurant
 */
interface RestaurantResponse {
  success: boolean;
  data?: Restaurant;
  message?: string;
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

/**
 * Fetch a specific restaurant by ID
 * 
 * @param restaurantId - The restaurant ID to fetch
 * @param lat - Optional user latitude for distance calculation
 * @param lng - Optional user longitude for distance calculation
 * @returns Restaurant object with details
 */
export async function fetchRestaurantById(
  restaurantId: string,
  lat?: number,
  lng?: number
): Promise<Restaurant> {
  const params = new URLSearchParams();
  if (lat && lng) {
    params.append('lat', lat.toString());
    params.append('lng', lng.toString());
  }
  
  const url = `/api/restaurants/${restaurantId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  const result: RestaurantResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch restaurant');
  }

  if (!result.data) {
    throw new Error('Restaurant not found');
  }

  return result.data;
}

