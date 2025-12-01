import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';

/**
 * Get a user's address by address type from the database
 *
 * @param args - Object containing type and optional user email
 *   - type: Address type (e.g., "house", "apartment", "hotel", "office", "other")
 *   - user: Optional user email. If provided, fetches address for this user. Otherwise uses logged-in user.
 * @returns Address object or null if not found
 */
export async function get_user_address(args: {
  type: string;
  user?: string;
}): Promise<Address | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  // If no user email provided, require logged-in user
  if (!args.user && !currentUser) {
    return null;
  }

  try {
    const { type, user } = args;

    if (!type) {
      console.error('Address type is required');
      return null;
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('type', encodeURIComponent(type));

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
