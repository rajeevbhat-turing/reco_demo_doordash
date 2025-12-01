import { useUserStore } from '@/store/user-store';

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
  order?: "asc" | "desc"; // Sort order, defaults to "asc"
}

export interface GetReviewsArgs {
  email?: string; // Optional: Filter by user email (otherwise uses logged-in user)
  store_id?: string; // Optional: Filter by store ID
  approval_status?: 'approved' | 'rejected' | 'pending'; // Optional: Filter by approval status
  sort_type?: SortSpec[]; // Optional: Sort specifications (e.g., [{ key: "rating", order: "desc" }])
  limit?: number; // Optional: Number of reviews to return
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
  
  // If no email provided, require logged-in user
  if (!args.email && !currentUser) {
    return null;
  }

  // Default sort by timestamp descending if no sort_type provided
  const effectiveSortType = args.sort_type && args.sort_type.length > 0 
    ? args.sort_type 
    : [{ key: 'timestamp', order: 'desc' as const }];

  try {
    const { email, store_id, approval_status, limit } = args;
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (email) {
      // If email is provided, use it
      params.append('email', email);
    } else if (currentUser) {
      // Otherwise, use the logged-in user's email
      params.append('email', currentUser.email);
    }
    
    if (store_id) {
      params.append('store_id', store_id);
    }
    
    if (approval_status) {
      params.append('approval_status', approval_status);
    }
    
    // Always pass sort_type (uses default if not provided)
    params.append('sort_type', JSON.stringify(effectiveSortType));
    
    if (limit !== undefined && limit !== null) {
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

    return { reviews: result.data };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

