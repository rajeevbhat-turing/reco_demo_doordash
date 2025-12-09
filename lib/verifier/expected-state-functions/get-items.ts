import { useUserStore } from '@/store/user-store';

export interface MenuItemResult {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string | null;
  price: number; // in cents
  image: string | null;
  categoryId: string;
  calories: number | null;
  rating: number | null;
  ratingCount: number | null;
  popular: boolean;
  featured: boolean;
}

export interface SortSpec {
  key: string; // Field to sort by (e.g., "price", "rating")
  order?: 'asc' | 'desc'; // Sort order, defaults to "asc"
}

export interface GetItemsArgs {
  restaurant_id?: string; // Optional: search specific restaurant or all
  keywords?: string[]; // Keywords to match against item name
  sort_type?: SortSpec[]; // Array of sort specifications for multi-level sorting
  limit?: number; // Number of items to return
  lat?: number; // Optional: explicit latitude
  lng?: number; // Optional: explicit longitude
  filters?: {
    menu_categories?: string[]; // Filter by menu category names (matches any in array)
    restaurant_ids_not_in?: string[]; // Exclude items from these restaurant IDs
    featured?: boolean; // Filter by featured status (true = only featured, false = only non-featured)
  };
}

export interface GetItemsResult {
  items: MenuItemResult[];
}

/**
 * Get menu items with optional filtering and sorting
 *
 * Multi-level Sorting:
 * - sort_type is an array of sort specifications applied in order
 * - Each spec has a "key" (field name) and optional "order" ("asc" or "desc", defaults to "asc")
 * - Example: [{ key: "price", order: "asc" }, { key: "rating", order: "desc" }]
 *   → Sorts by price ascending first, then by rating descending for items with same price
 * 
 * Distance Filtering:
 * - If restaurant_id is NOT provided, filters restaurants by 10 mile radius using lat/lng
 * - lat/lng default to user's selected address if not explicitly provided
 * - If restaurant_id IS provided, no distance filtering is applied
 * 
 * @param args - Object containing restaurant_id, keywords, sort_type, limit, lat, and lng
 * @returns Object with items array
 */
export async function get_items(args: GetItemsArgs): Promise<GetItemsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  if (!currentUser) {
    return null;
  }

  const { restaurant_id, keywords, sort_type, limit, lat, lng, filters = {} } = args;
  
  try {
    // Determine lat/lng to use: prefer explicit args, fallback to selected address
    let userLat: number | undefined = lat;
    let userLng: number | undefined = lng;
    
    // Only need lat/lng if restaurant_id is not provided (for distance filtering)
    if (!restaurant_id) {
      if (userLat === undefined || userLng === undefined) {
        const selectedAddress = userStore.getTempAddress() || 
          (currentUser.addresses && currentUser.addresses.find(addr => addr.default));
        
        if (!selectedAddress || !selectedAddress.lat || !selectedAddress.lng) {
          console.error('No valid address found with lat/lng for distance filtering');
          return null;
        }
        
        userLat = selectedAddress.lat;
        userLng = selectedAddress.lng;
      }
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);

    if (restaurant_id) {
      params.append('restaurant_id', restaurant_id);
    }
    
    // Pass lat/lng if we have them (only used when restaurant_id is not provided)
    if (userLat !== undefined && userLng !== undefined) {
      params.append('lat', String(userLat));
      params.append('lng', String(userLng));
    }

    if (keywords && keywords.length > 0) {
      params.append('keywords', JSON.stringify(keywords));
    }

    if (sort_type && sort_type.length > 0) {
      params.append('sort_type', JSON.stringify(sort_type));
    }

    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }
    
    if (filters.menu_categories && filters.menu_categories.length > 0) {
      params.append('menu_categories', JSON.stringify(filters.menu_categories));
    }
    
    if (filters.restaurant_ids_not_in && filters.restaurant_ids_not_in.length > 0) {
      params.append('restaurant_ids_not_in', JSON.stringify(filters.restaurant_ids_not_in));
    }
    
    if (filters.featured !== undefined) {
      params.append('featured', String(filters.featured));
    }
    
    // Call API route
    const response = await fetch(`/api/expected-state/get-items?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch menu items');
    }

    return { items: result.data };
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return null;
  }
}
