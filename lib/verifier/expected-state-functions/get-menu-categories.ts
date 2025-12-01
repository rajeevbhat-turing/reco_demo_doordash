import { useUserStore } from '@/store/user-store';

export interface MenuCategoryResult {
  id: string;
  name: string;
  sortOrder: number;
}

export interface GetMenuCategoriesArgs {
  restaurant_id: string; // Required: Restaurant ID to fetch categories for
  keyword?: string; // Optional: Keyword to filter category names
  limit?: number; // Optional: Number of categories to return
}

export interface GetMenuCategoriesResult {
  categories: MenuCategoryResult[];
}

/**
 * Get menu categories for a specific restaurant
 * 
 * @param args - Object containing restaurant_id, optional keyword, and limit
 * @returns Object with categories array
 */
export async function get_menu_categories(
  args: GetMenuCategoriesArgs
): Promise<GetMenuCategoriesResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }

  const { restaurant_id, keyword, limit } = args;
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);
    params.append('restaurant_id', restaurant_id);
    
    if (keyword) {
      params.append('keyword', keyword);
    }
    
    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }
    
    // Call API route
    const response = await fetch(`/api/expected-state/get-menu-categories?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch menu categories');
    }

    return { categories: result.data };
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return null;
  }
}

