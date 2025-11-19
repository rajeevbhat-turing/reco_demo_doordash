import { useUserStore } from '@/store/user-store';

export interface Item {
  id: string;
  name: string;
  price: number;
  effectivePrice: number;
  description: string | null;
  image: string | null;
  calories: number | null;
  rating: number | null;
  discountPercentage: number | null;
  discountCap: number | null;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  minDeliveryFee: number;
  latitude: number;
  longitude: number;
  discountPercentage: number | null;
  discountCap: number | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  distance: number | null;
}

export interface GetItemResult {
  item: Item;
  restaurant: Restaurant;
  metadata: {
    totalItemsFound: number;
    appliedRestaurantFilters: string[];
    appliedItemFilters: string[];
  };
}

/**
 * Get the cheapest item based on multiple filters
 * 
 * @param args - Object containing:
 *   - options: Array of item names to search for
 *   - cuisine: Restaurant cuisine type (optional)
 *   - restaurantFilters: Array of filters like "nearest", "with_discounts" (optional)
 * @returns Cheapest item with restaurant info or null if not found
 */
export async function get_cheapest_item(args: {
  options: string[];
  cuisine?: string;
  restaurantFilters?: string[];
}): Promise<GetItemResult | null> {
  try {
    const { options, cuisine, restaurantFilters = [] } = args;

    if (!options || options.length === 0) {
      console.error('At least one option is required');
      return null;
    }

    const userStore = useUserStore.getState();
    const currentUser = userStore.currentUser;
    
    if (!currentUser) {
      console.error('No user logged in');
      return null;
    }

    // Get user's selected address
    const selectedAddress = userStore.getTempAddress() || 
      (currentUser.addresses && currentUser.addresses.find(addr => addr.default));
    
    if (!selectedAddress || !selectedAddress.lat || !selectedAddress.lng) {
      console.error('No valid address found with lat/lng');
      return null;
    }

    // Build query params
    const params = new URLSearchParams({
      options: JSON.stringify(options),
      lat: String(selectedAddress.lat),
      lng: String(selectedAddress.lng),
    });

    if (cuisine) {
      params.append('cuisine', cuisine);
    }

    if (restaurantFilters.length > 0) {
      params.append('restaurantFilters', JSON.stringify(restaurantFilters));
    }

    // Always apply "cheapest" filter
    params.append('itemFilters', JSON.stringify(['cheapest']));

    // Call API route to fetch item from database
    const response = await fetch(`/api/expected-state/get-cheapest-item?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch item');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cheapest item:', error);
    return null;
  }
}

