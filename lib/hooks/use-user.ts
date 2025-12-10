'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

/**
 * Custom hook to get a user by ID
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if user exists, return store data
 * 2. If not in store, fetch from API
 *
 * @param userId - The ID of the user to fetch
 * @returns User data with loading and error states
 */
export function useUser(userId: string) {
  // Subscribe to the specific user in the store - this will update when store changes
  const storeUser = useUserStore(state => state.users.find(user => user.id === userId) || null);

  // Only fetch from API if user is not in store
  const query = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }

      return result.data;
    },
    enabled: !storeUser && !!userId, // Only fetch if not in store and userId exists
  });

  // Return store user if available, otherwise return API data
  const user = storeUser || query.data;

  return {
    data: user,
    isLoading: !storeUser && query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: !!user,
  };
}

/**
 * Custom hook to get a user by email
 *
 * Architecture: Store (localStorage) > Database (API)
 * 1. Check store first - if user exists, return store data
 * 2. If not in store, fetch from API
 *
 * @param email - The email of the user to fetch
 * @returns User data with loading and error states
 */
export function useUserByEmail(email: string) {
  // Subscribe to the specific user in the store - this will update when store changes
  const storeUser = useUserStore(state => state.users.find(user => user.email === email) || null);

  // Only fetch from API if user is not in store
  const query = useQuery<User>({
    queryKey: ['user', 'email', email],
    queryFn: async () => {
      // URL encode the email for the API route
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`/api/users/email/${encodedEmail}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }

      return result.data;
    },
    enabled: !storeUser && !!email, // Only fetch if not in store and email exists
  });

  // Return store user if available, otherwise return API data
  const user = storeUser || query.data;

  return {
    data: user,
    isLoading: !storeUser && query.isLoading,
    error: query.error,
    isError: query.isError,
    isSuccess: !!user,
  };
}
