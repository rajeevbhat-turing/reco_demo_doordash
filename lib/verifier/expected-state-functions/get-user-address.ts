import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';

/**
 * Get a user's address by address type from the database
 * 
 * @param args - Object containing type (e.g., "house", "apartment", "hotel", "office", "other")
 * @returns Address object or null if not found
 */
export async function get_user_address(args: { type: string }): Promise<Address | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }

  try {
    const { type } = args;
    
    if (!type) {
      console.error('Address type is required');
      return null;
    }

    // Call API route to fetch address from database
    const response = await fetch(`/api/expected-state/get-user-address?userId=${currentUser.id}&type=${encodeURIComponent(type)}`);
    
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

