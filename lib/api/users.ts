/**
 * User API functions for fetching user data
 */

export interface UserAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  addressType?: string;
  default?: boolean;
  businessName?: string;
  deliveryInstructions?: string;
}

export interface UserWithAddress {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  country?: {
    dialCode?: string;
    code?: string;
    name?: string;
  };
  addresses: UserAddress[];
}

/**
 * Fetch a user by ID with their addresses
 */
export async function fetchUser(userId: string): Promise<UserWithAddress | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const result = await response.json();
    
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Fetch multiple users from the database
 * @param count - Number of users to fetch (default: 10, max: 50)
 */
export async function fetchUsers(count: number = 10): Promise<UserWithAddress[]> {
  try {
    const response = await fetch(`/api/users?count=${count}`);
    const result = await response.json();
    
    if (!result.success) {
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Fetch sample users for order simulation
 * @param count - Number of users to fetch (default: 10)
 */
export async function fetchSampleUsers(count: number = 10): Promise<UserWithAddress[]> {
  return fetchUsers(count);
}

