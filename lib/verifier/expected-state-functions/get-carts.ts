import { useUserStore } from '@/store/user-store';

export interface CartItemResult {
  id: string; // menu item ID
  itemName: string;
  price: string;
  image: string;
  quantity: number;
  customizations?: string | null;
  appliedModifications?: Array<{
    modificationId: string;
    modificationDescription: string;
    appliedOptions: Array<{
      optionId: string;
      optionName: string;
      price: number;
      quantity: number;
    }>;
  }>;
}

export interface CartResult {
  storeId: string;
  storeName: string;
  storeCategory: string;
  storeLogo?: string;
  items: CartItemResult[];
}

export interface GetCartsArgs {
  limit?: number; // Number of carts to return
  user?: string; // Optional user email. If not provided, uses logged-in user
  filters?: {
    restaurant_names?: string[]; // Filter by restaurant names (matches any in array)
  };
}

export interface GetCartsResult {
  carts: CartResult[];
}

/**
 * Get user's carts with optional filtering
 * 
 * @param args - Object containing limit, user, and filters
 * @returns Object with carts array containing restaurant info and cart items
 */
export async function get_carts(args: GetCartsArgs = {}): Promise<GetCartsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  // If no user email provided, require logged-in user
  if (!args.user && !currentUser) {
    return null;
  }

  const { limit, user, filters = {} } = args;
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (user) {
      // If user email is provided, use it
      params.append('email', user);
    } else if (currentUser) {
      // Otherwise, use the logged-in user's ID
      params.append('userId', currentUser.id);
    }
    
    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }
    
    if (filters.restaurant_names && filters.restaurant_names.length > 0) {
      params.append('restaurant_names', JSON.stringify(filters.restaurant_names));
    }
    
    // Call API route
    const response = await fetch(`/api/expected-state/get-carts?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch carts');
    }

    return { carts: result.data };
  } catch (error) {
    console.error('Error fetching carts:', error);
    return null;
  }
}

