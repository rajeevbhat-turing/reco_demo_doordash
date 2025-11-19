import { useUserStore } from '@/store/user-store';
import { PaymentMethod } from '@/lib/types/user-types';

/**
 * Get the default payment method for the current user from the database
 * @returns The default payment method or null if no default is set or user is not logged in
 */
export async function get_default_payment_method(): Promise<PaymentMethod | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;
  
  if (!currentUser) {
    return null;
  }
  
  try {
    // Call API route to fetch from database
    const response = await fetch(`/api/expected-state/get-default-payment-method?userId=${currentUser.id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch default payment method');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching default payment method from DB:', error);
    return null;
  }
}

