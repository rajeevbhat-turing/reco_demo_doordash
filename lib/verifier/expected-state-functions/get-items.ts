import { useUserStore } from '@/store/user-store';

export interface MenuItemResult {
  id: string;
  restaurantId: string;
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

export interface GetItemsArgs {
  restaurant_id?: string; // Optional: search specific restaurant or all
  keywords?: string[]; // Keywords to match against item name
  sort_type?: string; // e.g., "cheapest"
  tiebreaker?: string; // Tiebreaker strategy: "keyword" (more options later)
  limit?: number; // Number of items to return
}

export interface GetItemsResult {
  items: MenuItemResult[];
}

/**
 * Get menu items with optional filtering and sorting
 * 
 * Tiebreaker Options:
 * - "keyword": When items have the same primary sort value (e.g., same price),
 *   items matching earlier keywords in the array are ranked higher
 *   Example: keywords: ["grain bowl", "cucumber salad"], tiebreaker: "keyword"
 *   → Items matching "grain bowl" are preferred over items matching "cucumber salad" when prices are tied
 * 
 * @param args - Object containing restaurant_id, keywords, sort_type, tiebreaker, and limit
 * @returns Object with items array
 */
export async function get_items(args: GetItemsArgs): Promise<GetItemsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }

  const { restaurant_id, keywords, sort_type, tiebreaker, limit } = args;
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);
    
    if (restaurant_id) {
      params.append('restaurant_id', restaurant_id);
    }

    if (keywords && keywords.length > 0) {
      params.append('keywords', JSON.stringify(keywords));
    }
    
    if (sort_type) {
      params.append('sort_type', sort_type);
    }
    
    if (tiebreaker) {
      params.append('tiebreaker', tiebreaker);
    }
    
    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
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

