import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';

export interface GetUserAddressResult {
  address: Address;
}

/**
 * Get a user's address by address type from the database
 * 
 * @param args - Object containing optional type and user email
 *   - type: Optional address type (e.g., "house", "apartment", "hotel", "office", "other"). If not provided, returns default address.
 *   - user: Optional user email. If provided, fetches address for this user. Otherwise uses logged-in user.
 * @returns Object with address property, or null if not found
 */
export async function get_user_address(args: { type?: string; user?: string } = {}): Promise<GetUserAddressResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  // If no user email provided, require logged-in user
  if (!args.user && !currentUser) {
    return null;
  }

  try {
    const { type, user } = args;

    // Build query parameters
    const params = new URLSearchParams();
    
    // If type is provided, search by type. Otherwise, get default address.
    if (type) {
      params.append('type', encodeURIComponent(type));
    }
    
    if (user) {
      // If user email is provided, use it
      params.append('email', user);
    } else if (currentUser) {
      // Otherwise, use the logged-in user's ID
      params.append('userId', currentUser.id);
    }

    // Call API route to fetch address from database
    const response = await fetch(`/api/expected-state/get-user-address?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user address');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching user address:', error);
    return null;
  }
}
