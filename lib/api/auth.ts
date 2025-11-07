import { User } from '@/lib/types/user-types';

/**
 * API Response type for login
 */
interface LoginResponse {
  success: boolean;
  data?: User;
  error?: string;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login user with email and password
 * 
 * Fetches user data from database including addresses and payment methods
 * This data should be stored in user-store after successful login
 * 
 * @param credentials - Email and password
 * @returns User data with addresses and payment methods
 */
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result: LoginResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Login failed');
  }

  return result.data;
}

