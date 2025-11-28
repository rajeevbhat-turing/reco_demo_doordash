import { useUserStore } from '@/store/user-store';
import { PaymentMethod } from '@/lib/types/user-types';

/**
 * Get a user's payment method with optional filtering
 * 
 * @param args - Object containing optional user email and filters
 *   - user: Optional user email. If not provided, uses logged-in user
 *   - filters: Optional filters (default, last_four_digits)
 * @returns Payment method object or null if not found
 */
export async function get_user_payment_method(args: {
  user?: string;
  filters?: {
    default?: boolean;
    last_four_digits?: string;
  };
} = {}): Promise<PaymentMethod | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  // If no user email provided, require logged-in user
  if (!args.user && !currentUser) {
    return null;
  }

  try {
    const { user, filters = {} } = args;
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (user) {
      // If user email is provided, use it
      params.append('email', user);
    } else if (currentUser) {
      // Otherwise, use the logged-in user's ID
      params.append('userId', currentUser.id);
    }
    
    if (filters.default !== undefined) {
      params.append('default', String(filters.default));
    }
    
    if (filters.last_four_digits) {
      params.append('last_four_digits', filters.last_four_digits);
    }

    // Call API route to fetch from database
    const response = await fetch(`/api/expected-state/get-user-payment-method?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch payment method');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching payment method from DB:', error);
    return null;
  }
}

