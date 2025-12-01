import { useUserStore } from '@/store/user-store';

export interface RestaurantResult {
  id: string;
  name: string;
  logo: string;
  cuisine: string;
  minDeliveryFee: number;
  priceRange: number;
  dashPass: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  distance: number; // Distance in miles from user location
}

export interface SortSpec {
  key: string; // Field to sort by (e.g., "distance", "minDeliveryFee")
  order?: 'asc' | 'desc'; // Sort order, defaults to "asc"
}

export interface GetRestaurantsArgs {
  sort_type?: SortSpec[]; // Array of sort specifications for multi-level sorting
  limit?: number; // Number of restaurants to return
  lat?: number; // Optional explicit latitude
  lng?: number; // Optional explicit longitude
  filters?: {
    cuisine?: string; // Filter by cuisine type
  };
}

export interface GetRestaurantsResult {
  restaurants: RestaurantResult[];
}

/**
 * Get restaurants with optional filtering and sorting
 * Filters restaurants within 10 mile radius of user location
 *
 * Multi-level Sorting:
 * - sort_type is an array of sort specifications applied in order
 * - Each spec has a "key" (field name) and optional "order" ("asc" or "desc", defaults to "asc")
 * - Example: [{ key: "distance", order: "asc" }, { key: "minDeliveryFee", order: "asc" }]
 *   → Sorts by distance ascending first, then by delivery fee for restaurants at same distance
 *
 * @param args - Object containing lat, lng, sort_type, limit, and filters
 * @returns Object with restaurants array (all within 10 mile radius)
 */
export async function get_restaurants(
  args: GetRestaurantsArgs
): Promise<GetRestaurantsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  if (!currentUser) {
    return null;
  }

  const { sort_type, limit, lat, lng, filters = {} } = args;

  try {
    // Determine lat/lng to use: prefer explicit args, fallback to selected address
    let userLat: number | undefined = lat;
    let userLng: number | undefined = lng;

    if (userLat === undefined || userLng === undefined) {
      const selectedAddress =
        userStore.getTempAddress() ||
        (currentUser.addresses && currentUser.addresses.find(addr => addr.default));

      if (!selectedAddress || !selectedAddress.lat || !selectedAddress.lng) {
        console.error('No valid address found with lat/lng');
        return null;
      }

      userLat = selectedAddress.lat;
      userLng = selectedAddress.lng;
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);

    // Always pass lat/lng for radius filtering
    params.append('lat', String(userLat));
    params.append('lng', String(userLng));

    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }

    if (sort_type && sort_type.length > 0) {
      params.append('sort_type', JSON.stringify(sort_type));
    }

    if (filters.cuisine) {
      params.append('cuisine', filters.cuisine);
    }

    // Call API route
    const response = await fetch(`/api/expected-state/get-restaurants?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch restaurants');
    }

    return { restaurants: result.data };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return null;
  }
}
