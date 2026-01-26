import { useUserStore } from '@/store/user-store';
import { calculateDistance } from '@/lib/utils/distance-utils';

export interface ReviewResult {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo: string | null;
  storeCategory: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  rating: number;
  content: string;
  timestamp: string;
  orderId: string | null;
  approvalStatus: 'approved' | 'rejected' | 'pending';
  photos: string[];
  helpfulCount: number;
  ratedHelpfulBy: string[];
  likedItems: Array<{
    orderItemId: string;
    menuItemId: string;
    itemName: string;
    itemImage: string | null;
  }>;
}

export interface SortSpec {
  key: string; // Field to sort by (e.g., "timestamp", "rating")
  order?: 'asc' | 'desc'; // Sort order, defaults to "asc"
}

export interface DeliveryAddress {
  id?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat: number; // Required for distance filtering
  lng: number; // Required for distance filtering
  addressType?: string;
  default?: boolean;
  buildingName?: string;
  deliveryPreference?: string;
  deliveryInstructions?: string;
  personalLabel?: string;
}

export interface ReviewFilters {
  delivery_address?: DeliveryAddress; // Filter reviews to only include restaurants that deliver to this address (within 10 mile radius)
  menu_categories?: string[]; // Filter reviews to only include restaurants that have these menu categories
  menu_keywords?: string[]; // Filter reviews to only include restaurants that have menu items matching these keywords (case-insensitive name match)
}

export interface GetReviewsArgs {
  email?: string; // Optional: Filter by user email (otherwise uses logged-in user)
  restaurant_id?: string; // Optional: Filter by restaurant ID
  approval_status?: 'approved' | 'rejected' | 'pending'; // Optional: Filter by approval status (defaults to "approved")
  has_liked_items?: boolean; // Optional: Filter by whether review has liked items (true = only reviews with liked items)
  sort_type?: SortSpec[]; // Optional: Sort specifications (e.g., [{ key: "rating", order: "desc" }])
  limit?: number; // Optional: Number of reviews to return
  filters?: ReviewFilters; // Optional: Additional filters for delivery_address and menu_categories
}

export interface GetReviewsResult {
  reviews: ReviewResult[];
}

/**
 * Get user reviews with optional filtering and sorting
 *
 * @param args - Object containing email and optional filters
 * @returns Object with reviews array
 */
export async function get_reviews(args: GetReviewsArgs = {}): Promise<GetReviewsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  // Only default to logged-in user if neither email nor restaurant_id is provided
  if (!args.email && !args.restaurant_id && !currentUser) {
    return null;
  }

  // Default sort by timestamp descending if no sort_type provided
  const effectiveSortType =
    args.sort_type && args.sort_type.length > 0
      ? args.sort_type
      : [{ key: 'timestamp', order: 'desc' as const }];

  try {
    const { email, restaurant_id, approval_status, has_liked_items, limit, filters } = args;

    // Build query parameters
    const params = new URLSearchParams();

    if (email) {
      // If email is provided, use it
      params.append('email', email);
    } else if (!restaurant_id && currentUser) {
      // Only default to logged-in user's email if restaurant_id is not provided
      params.append('email', currentUser.email);
    }

    if (restaurant_id) {
      params.append('restaurant_id', restaurant_id);
    }

    // Default approval_status to "approved" if not specified
    const effectiveApprovalStatus = approval_status || 'approved';
    params.append('approval_status', effectiveApprovalStatus);

    if (has_liked_items !== undefined) {
      params.append('has_liked_items', String(has_liked_items));
    }

    // Always pass sort_type (uses default if not provided)
    params.append('sort_type', JSON.stringify(effectiveSortType));

    // Don't apply limit yet if we have filters that need post-processing
    // We'll apply limit after filtering
    const hasPostFilters =
      filters?.delivery_address ||
      (filters?.menu_categories && filters.menu_categories.length > 0) ||
      (filters?.menu_keywords && filters.menu_keywords.length > 0);
    if (limit !== undefined && limit !== null && !hasPostFilters) {
      params.append('limit', String(limit));
    }

    // Call API route
    const response = await fetch(`/api/expected-state/get-reviews?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch reviews');
    }

    let reviews: ReviewResult[] = result.data;

    // Apply post-fetch filters if provided
    if (hasPostFilters && reviews.length > 0) {
      // Get unique store IDs from reviews
      const storeIds = [...new Set(reviews.map(r => r.storeId))];

      // Apply delivery_address filter (10 mile radius)
      if (
        filters?.delivery_address &&
        filters.delivery_address.lat !== undefined &&
        filters.delivery_address.lng !== undefined
      ) {
        const deliveryLat = filters.delivery_address.lat;
        const deliveryLng = filters.delivery_address.lng;
        const radiusMiles = 10;

        // Fetch restaurant coordinates for filtering
        const restaurantCoords = await fetchRestaurantCoordinates(storeIds);

        reviews = reviews.filter(review => {
          const coords = restaurantCoords.get(review.storeId);
          if (!coords || coords.lat === null || coords.lng === null) {
            return false;
          }
          const distance = calculateDistance(deliveryLat, deliveryLng, coords.lat, coords.lng);
          return distance <= radiusMiles;
        });

        // Update storeIds for next filter (only include remaining restaurants)
        storeIds.length = 0;
        storeIds.push(...new Set(reviews.map(r => r.storeId)));
      }

      // Apply menu_categories filter
      if (filters?.menu_categories && filters.menu_categories.length > 0 && reviews.length > 0) {
        const menuCategoriesLower = filters.menu_categories.map(c => c.toLowerCase());

        // Fetch menu categories for remaining restaurants
        const menuCategoriesMap = await fetchMenuCategories(storeIds);

        reviews = reviews.filter(review => {
          const categories = menuCategoriesMap.get(review.storeId);
          if (!categories || categories.length === 0) {
            return false;
          }
          // Check if restaurant has any of the specified menu categories
          return categories.some(cat => menuCategoriesLower.includes(cat.toLowerCase()));
        });

        // Update storeIds for next filter (only include remaining restaurants)
        storeIds.length = 0;
        storeIds.push(...new Set(reviews.map(r => r.storeId)));
      }

      // Apply menu_keywords filter (match against menu item names)
      if (filters?.menu_keywords && filters.menu_keywords.length > 0 && reviews.length > 0) {
        const keywordsLower = filters.menu_keywords.map(k => k.toLowerCase());

        // Fetch menu items for remaining restaurants
        const menuItemsMap = await fetchMenuItems(storeIds);

        reviews = reviews.filter(review => {
          const items = menuItemsMap.get(review.storeId);
          if (!items || items.length === 0) {
            return false;
          }
          // Check if restaurant has any menu items matching the keywords
          return items.some(itemName =>
            keywordsLower.some(keyword => itemName.toLowerCase().includes(keyword))
          );
        });
      }

      // Apply limit after filtering
      if (limit !== undefined && limit !== null) {
        reviews = reviews.slice(0, limit);
      }
    }

    return { reviews };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

/**
 * Fetch restaurant data (coordinates) for given store IDs
 */
async function fetchRestaurantCoordinates(
  storeIds: string[]
): Promise<Map<string, { lat: number | null; lng: number | null }>> {
  const restaurantMap = new Map<string, { lat: number | null; lng: number | null }>();

  if (storeIds.length === 0) {
    return restaurantMap;
  }

  try {
    // Fetch restaurant data including coordinates
    const response = await fetch(`/api/restaurants/by-ids?ids=${storeIds.join(',')}`);

    if (!response.ok) {
      console.error('Failed to fetch restaurant data for filtering');
      return restaurantMap;
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      for (const restaurant of result.data) {
        restaurantMap.set(String(restaurant.id), {
          lat: restaurant.lat ?? restaurant.latitude ?? null,
          lng: restaurant.lng ?? restaurant.longitude ?? null,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching restaurant data for filtering:', error);
  }

  return restaurantMap;
}

/**
 * Fetch menu categories for given store IDs
 */
async function fetchMenuCategories(storeIds: string[]): Promise<Map<string, string[]>> {
  const menuCategoriesMap = new Map<string, string[]>();

  if (storeIds.length === 0) {
    return menuCategoriesMap;
  }

  try {
    // Fetch menu categories for each restaurant
    // Using Promise.all to fetch in parallel
    const promises = storeIds.map(async storeId => {
      try {
        const response = await fetch(`/api/restaurants/${storeId}/menu`);
        if (response.ok) {
          const result = await response.json();
          // API returns { success, data: { menuItems, categories } }
          if (result.success && result.data && Array.isArray(result.data.categories)) {
            const categories = result.data.categories.map((c: { name: string }) => c.name);
            menuCategoriesMap.set(storeId, categories);
          }
        }
      } catch (err) {
        console.error(`Error fetching menu for restaurant ${storeId}:`, err);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching menu categories for filtering:', error);
  }

  return menuCategoriesMap;
}

/**
 * Fetch menu item names for given store IDs
 */
async function fetchMenuItems(storeIds: string[]): Promise<Map<string, string[]>> {
  const menuItemsMap = new Map<string, string[]>();

  if (storeIds.length === 0) {
    return menuItemsMap;
  }

  try {
    // Fetch menu items for each restaurant
    // Using Promise.all to fetch in parallel
    const promises = storeIds.map(async storeId => {
      try {
        const response = await fetch(`/api/restaurants/${storeId}/menu`);
        if (response.ok) {
          const result = await response.json();
          // API returns { success, data: { menuItems, categories } }
          if (result.success && result.data && Array.isArray(result.data.menuItems)) {
            const itemNames = result.data.menuItems.map((item: { name: string }) => item.name);
            menuItemsMap.set(storeId, itemNames);
          }
        }
      } catch (err) {
        console.error(`Error fetching menu for restaurant ${storeId}:`, err);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching menu items for filtering:', error);
  }

  return menuItemsMap;
}
