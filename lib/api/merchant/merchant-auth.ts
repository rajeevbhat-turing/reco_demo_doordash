import { MerchantUser, useMerchantAuthStore } from '@/store/merchant-auth-store';

/**
 * API Response type for merchant login
 */
interface MerchantLoginResponse {
  success: boolean;
  data?: {
    merchant: MerchantUser;
    stores: any[];
  };
  error?: string;
}

/**
 * Login credentials
 */
interface MerchantLoginCredentials {
  email: string;
  password: string;
}

/**
 * Login merchant with email and password
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if merchant exists and password matches, return store data
 * 2. If not in store, check API and return API data
 *
 * @param credentials - Email and password
 * @returns Merchant data
 */
export async function loginMerchant(credentials: MerchantLoginCredentials): Promise<MerchantUser> {
  const { email: emailAddress, password } = credentials;

  // Convert email address to lowercase
  const email = emailAddress.toLowerCase();

  const state = useMerchantAuthStore.getState();

  // Step 1: Check store first (localStorage has priority)
  const storeMerchant = state.getMerchantByEmail(email);

  if (storeMerchant) {
    // Merchant exists in store - verify password
    if (storeMerchant.password === password) {
      // Password matches - return merchant from store
      console.log('✅ Merchant found in store, using store data:', email);
      return storeMerchant;
    }
    // Password doesn't match - throw error
    throw new Error('Invalid email or password');
  }

  // Step 2: Merchant not in store - check API
  const response = await fetch('/api/merchant/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result: MerchantLoginResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Login failed');
  }

  // Transform API response to MerchantUser format
  const apiMerchant = result.data.merchant;
  const merchantUser: MerchantUser = {
    id: apiMerchant.id,
    email: apiMerchant.email,
    password: apiMerchant.password,
    firstName: apiMerchant.firstName,
    lastName: apiMerchant.lastName,
    userPhone: apiMerchant.userPhone,
    primaryStoreName: apiMerchant.primaryStoreName || '',
    primaryStoreAddress: apiMerchant.primaryStoreAddress || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    primaryStorePhone: apiMerchant.primaryStorePhone || '',
    primaryBusinessType: apiMerchant.primaryBusinessType || '',
    primaryStoreId: apiMerchant.primaryStoreId || '',
    storeIds: apiMerchant.storeIds || [],
    onboardingCompleted: apiMerchant.onboardingCompleted,
    onboardingStep: apiMerchant.onboardingStep,
    onboardingData: apiMerchant.onboardingData,
  };

  console.log('✅ Merchant found in API, using API data:', email);
  return merchantUser;
}
