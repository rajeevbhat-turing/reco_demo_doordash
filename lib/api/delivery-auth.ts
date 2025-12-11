import { DeliveryPartner } from '@/lib/types/delivery-types';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

/**
 * API Response type for delivery partner login
 */
interface DeliveryLoginResponse {
  success: boolean;
  data?: DeliveryPartner;
  error?: string;
}

/**
 * Login credentials for delivery partner
 */
interface DeliveryLoginCredentials {
  email: string;
  password: string;
  deletedPartnerIds?: string[];
}

/**
 * Login delivery partner with email and password
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if partner exists and password matches, return store data
 * 2. If not in store, check API and return API data
 *
 * @param credentials - Email and password
 * @returns Delivery partner data
 */
export async function loginDeliveryPartner(credentials: DeliveryLoginCredentials): Promise<DeliveryPartner> {
  const { email: emailAddress, password } = credentials;

  // Convert email address to lowercase
  const email = emailAddress.toLowerCase();

  const state = useDeliveryPartnerStore.getState();

  // Step 1: Check store first (localStorage has priority)
  const storePartner = state.getPartnerByEmail(email);

  if (storePartner) {
    // Partner exists in store - verify password
    if (storePartner.password === password) {
      // Password matches - return partner from store
      console.log('✅ Delivery partner found in store, using store data:', email);
      return storePartner;
    }
    // Password doesn't match - throw error
    throw new Error('Invalid email or password');
  }

  // Step 2: Partner not in store - check API
  const response = await fetch('/api/delivery/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result: DeliveryLoginResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Login failed');
  }

  return result.data;
}

