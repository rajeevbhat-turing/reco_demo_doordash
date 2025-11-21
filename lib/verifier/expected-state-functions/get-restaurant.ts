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
  distance?: number; // Only present when sort_type is "nearest"
}

export interface GetRestaurantArgs {
  sort_type?: string; // e.g., "nearest"
  limit?: number; // Number of restaurants to return
  filters?: {
    cuisine?: string; // Filter by cuisine type
  };
}

/**
 * Get restaurants with optional filtering and sorting
 * 
 * @param args - Object containing sort_type, limit, and filters
 * @returns Array of restaurants matching the criteria
 */
export async function get_restaurant(args: GetRestaurantArgs): Promise<RestaurantResult[] | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }

  const { sort_type, limit, filters = {} } = args;
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);
    
    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }
    
    if (sort_type) {
      params.append('sort_type', sort_type);
      
      // If sorting by nearest, we need the user's address
      if (sort_type === 'nearest') {
        const selectedAddress = userStore.getTempAddress() || 
          (currentUser.addresses && currentUser.addresses.find(addr => addr.default));
        
        if (!selectedAddress || !selectedAddress.lat || !selectedAddress.lng) {
          console.error('No valid address found with lat/lng for distance calculation');
          return null;
        }
        
        params.append('lat', String(selectedAddress.lat));
        params.append('lng', String(selectedAddress.lng));
      }
    }
    
    if (filters.cuisine) {
      params.append('cuisine', filters.cuisine);
    }
    
    // Call API route
    const response = await fetch(`/api/expected-state/get-restaurant?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch restaurants');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return null;
  }
}

