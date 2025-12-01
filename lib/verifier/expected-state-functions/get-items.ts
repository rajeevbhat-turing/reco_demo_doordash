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

export interface SortSpec {
  key: string; // Field to sort by (e.g., "price", "rating")
  order?: 'asc' | 'desc'; // Sort order, defaults to "asc"
}

export interface GetItemsArgs {
  restaurant_id?: string; // Optional: search specific restaurant or all
  keywords?: string[]; // Keywords to match against item name
  sort_type?: SortSpec[]; // Array of sort specifications for multi-level sorting
  limit?: number; // Number of items to return
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
 * @param args - Object containing restaurant_id, keywords, sort_type, and limit
 * @returns Object with items array
 */
export async function get_items(args: GetItemsArgs): Promise<GetItemsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  if (!currentUser) {
    return null;
  }

  const { restaurant_id, keywords, sort_type, limit } = args;

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

    if (sort_type && sort_type.length > 0) {
      params.append('sort_type', JSON.stringify(sort_type));
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
