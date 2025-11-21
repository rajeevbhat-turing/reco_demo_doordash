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

export interface GetRestaurantsArgs {
  sort_type?: string; // e.g., "nearest"
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
 * @param args - Object containing lat, lng, sort_type, limit, and filters
 * @returns Object with restaurants array (all within 10 mile radius)
 */
export async function get_restaurants(args: GetRestaurantsArgs): Promise<GetRestaurantsResult | null> {
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
      const selectedAddress = userStore.getTempAddress() || 
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
    
    if (sort_type) {
      params.append('sort_type', sort_type);
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

