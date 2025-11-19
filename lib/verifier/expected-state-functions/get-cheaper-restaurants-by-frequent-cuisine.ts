import { useUserStore } from '@/store/user-store';

export interface Restaurant {
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
}

export interface CheaperRestaurantsResult {
  restaurants: Restaurant[];
  metadata: {
    mostFrequentCuisine: string | null;
    lowestDeliveryFee: number | null;
    totalOrdersAnalyzed?: number;
    cuisineOrderCount?: number;
    reason?: string;
  };
}

/**
 * Get restaurants with cheaper delivery fees than user's most frequent cuisine orders
 * 
 * Algorithm:
 * 1. Fetch all previous orders for the logged in user
 * 2. Find the most frequently ordered cuisine
 * 3. Within that cuisine's orders, find the lowest delivery fee
 * 4. Return all restaurants for that cuisine with lower calculated delivery fees (within radius)
 * 
 * @returns Object containing matching restaurants and metadata
 */
export async function get_cheaper_restaurants_by_frequent_cuisine(): Promise<CheaperRestaurantsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }

  // Get user's selected address (either current temp address or default address)
  const selectedAddress = userStore.getTempAddress() || 
    (currentUser.addresses && currentUser.addresses.find(addr => addr.default));
  
  if (!selectedAddress || !selectedAddress.lat || !selectedAddress.lng) {
    console.error('No valid address found with lat/lng');
    return null;
  }
  
  try {
    // Call API route with lat/lng parameters
    const response = await fetch(
      `/api/expected-state/get-cheaper-restaurants-by-frequent-cuisine?userId=${currentUser.id}&lat=${selectedAddress.lat}&lng=${selectedAddress.lng}&radius=10`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch cheaper restaurants');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cheaper restaurants by frequent cuisine:', error);
    return null;
  }
}

