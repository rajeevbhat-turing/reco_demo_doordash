import { User } from '@/lib/types/user-types';
import { useUserStore } from '@/store/user-store';

/**
 * API Response type for login
 */
interface LoginResponse {
  success: boolean;
  data?: User;
  error?: string;
}

/**
 * API Response type for generate OTP
 */
interface GenerateOTPResponse {
  success: boolean;
  data?: {
    otp: string;
    user: User;
  };
  error?: string;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
  deletedUserIds?: string[];
}

/**
 * Generate OTP request
 */
interface GenerateOTPRequest {
  email: string;
  deletedUserIds?: string[];
}

/**
 * Generate OTP result
 */
export interface GenerateOTPResult {
  otp: string;
  user: User;
}

/**
 * Login user with email and password
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if user exists and password matches, return store data
 * 2. If not in store, check API and return API data
 *
 * @param credentials - Email and password
 * @returns User data with addresses and payment methods
 */
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const { email: emailAddress, password } = credentials;

  // Convert email address to lowercase
  const email = emailAddress.toLowerCase();

  const state = useUserStore.getState();

  // Step 1: Check store first (localStorage has priority)
  const storeUser = state.getUserByEmail(email);

  if (storeUser) {
    // User exists in store - verify password
    if (storeUser.password === password) {
      // Password matches - return user from store
      console.log('✅ User found in store, using store data:', email);
      return storeUser;
    }
    // Password doesn't match - throw error
    throw new Error('Invalid email or password');
  }

  // Step 2: User not in store - check API with deletedUserIds
  const deletedUserIds = state.deletedUserIds;
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      deletedUserIds,
    }),
  });

  const result: LoginResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Login failed');
  }

  return result.data;
}

/**
 * Generate OTP for user authentication
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if user exists, return store data
 * 2. If not in store, check API and return API data
 *
 * @param request - Email address
 * @returns OTP and user data
 */
export async function generateOTP(request: GenerateOTPRequest): Promise<GenerateOTPResult> {
  const { email: emailAddress } = request;

  // Convert email address to lowercase
  const email = emailAddress?.toLowerCase();

  const state = useUserStore.getState();

  // Step 1: Check store first (localStorage has priority)
  const storeUser = state.getUserByEmail(email);

  if (storeUser) {
    // User exists in store - generate OTP and return store data
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('✅ User found in store, using store data:', email);
    return {
      otp,
      user: storeUser,
    };
  }

  // Step 2: User not in store - check API with deletedUserIds
  const deletedUserIds = state.deletedUserIds;
  const response = await fetch('/api/auth/generate-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      deletedUserIds,
    }),
  });

  const result: GenerateOTPResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate OTP');
  }

  return result.data;
}
