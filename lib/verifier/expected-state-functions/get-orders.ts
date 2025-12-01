import { useUserStore } from '@/store/user-store';

export interface OrderItemResult {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number; // In cents
}

export interface OrderResult {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  cuisine: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: string;
  orderDate: string;
  items: OrderItemResult[];
}

export interface SortSpec {
  key: string; // Field to sort by, or "field.count" for aggregation
  order?: "asc" | "desc"; // Sort order, defaults to "asc"
}

export interface GetOrdersArgs {
  restaurant_id?: string; // Optional: Filter by restaurant ID
  user?: string; // Optional user email (otherwise logged-in user)
  sort_type?: SortSpec[]; // Optional: supports "field.count" for aggregation
  limit?: number; // Number of orders to return
  filters?: {
    status?: string; // e.g., "delivered", "cancelled"
    date_from?: string; // ISO date string
    date_to?: string; // ISO date string
  };
}

export interface GetOrdersResult {
  orders: OrderResult[];
}

/**
 * Get user orders with optional filtering and sorting
 * 
 * Aggregation Support:
 * - Use "field.count" in sort_type to group by that field and sort by count
 * - Example: [{ key: "cuisine.count", order: "desc" }] groups by cuisine and sorts by order count
 * - Secondary sorts pick the best representative from each group
 * 
 * @param args - Object containing user, sort_type, limit, and filters
 * @returns Object with orders array
 */
export async function get_orders(args: GetOrdersArgs = {}): Promise<GetOrdersResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  // If no user email provided, require logged-in user
  if (!args.user && !currentUser) {
    return null;
  }

  const { restaurant_id, user, sort_type, limit, filters = {} } = args;
  
  // Default sort by orderDate descending if no sort_type provided
  const effectiveSortType = sort_type && sort_type.length > 0 
    ? sort_type 
    : [{ key: 'orderDate', order: 'desc' as const }];
  
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
    
    if (restaurant_id) {
      params.append('restaurant_id', restaurant_id);
    }
    
    // Always pass sort_type (uses default if not provided)
    params.append('sort_type', JSON.stringify(effectiveSortType));
    
    if (limit !== undefined && limit !== null) {
      params.append('limit', String(limit));
    }
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.date_from) {
      params.append('date_from', filters.date_from);
    }
    
    if (filters.date_to) {
      params.append('date_to', filters.date_to);
    }
    
    // Call API route
    const response = await fetch(`/api/expected-state/get-orders?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch orders');
    }

    return { orders: result.data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
}

