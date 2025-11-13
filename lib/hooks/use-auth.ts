'use client';

import { useMutation } from '@tanstack/react-query';
import { loginUser, generateOTP } from '@/lib/api/auth';
import { useUserStore } from '@/store/user-store';
import { User, Address } from '@/lib/types/user-types';

/**
 * Custom hook for authentication with TanStack Query
 * 
 * Usage:
 * ```tsx
 * const { login, generateOTP, isLoading, error } = useAuth();
 * 
 * const handleLogin = async () => {
 *   try {
 *     await login({ email: 'user@example.com', password: 'password' });
 *     // User is now logged in and stored in user-store
 *   } catch (err) {
 *     console.error('Login failed:', err);
 *   }
 * };
 * 
 * const handleGenerateOTP = async () => {
 *   try {
 *     const { otp, user } = await generateOTP({ email: 'user@example.com' });
 *     // OTP generated, user data returned
 *   } catch (err) {
 *     console.error('Generate OTP failed:', err);
 *   }
 * };
 * ```
 */
export function useAuth() {
  const getTempAddress = useUserStore((state) => state.getTempAddress);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (userData: User) => {
      // Get temp address before setting current user (to avoid it being cleared)
      const tempAddress = getTempAddress();
      
      // Prepare updated user data with temp address handled
      let updatedUserData: User = { ...userData };
      
      if (tempAddress) {
        // Check if temp address already exists in user's addresses
        // Compare by street, city, state, and zipCode
        const existingAddress = userData.addresses?.find(addr => 
          addr.street === tempAddress.street &&
          addr.city === tempAddress.city &&
          addr.state === tempAddress.state &&
          addr.zipCode === tempAddress.zipCode
        );
        
        if (existingAddress) {
          // Address already exists, set it as default in the user data
          updatedUserData = {
            ...userData,
            addresses: userData.addresses.map(addr => ({
              ...addr,
              default: addr.id === existingAddress.id,
            })),
          };
          console.log('✅ Temp address already exists, set as default');
        } else {
          // Address doesn't exist, add it and set as default
          const { id, ...addressWithoutId } = tempAddress;
          const newAddressId = Math.random().toString(36).substring(2, 15);
          const newAddress: Address = {
            ...addressWithoutId,
            id: newAddressId,
            default: true,
          };
          
          // Set all existing addresses to default: false, add new address
          updatedUserData = {
            ...userData,
            addresses: [
              ...(userData.addresses || []).map(addr => ({ ...addr, default: false })),
              newAddress,
            ],
          };
          console.log('✅ Temp address added to user and set as default');
        }
      }
      
      // Update users array in store first
      const state = useUserStore.getState();
      const userExists = state.users.some(u => u.id === updatedUserData.id);
      const updatedUsers = userExists
        ? state.users.map(user => user.id === updatedUserData.id ? updatedUserData : user)
        : [...state.users, updatedUserData];
      
      // Set both users array and current user atomically
      useUserStore.setState({
        users: updatedUsers,
        currentUser: updatedUserData,
        tempAddress: null, // Clear temp address
        changePasswordPhoneVerified: state.changePasswordPhoneVerified,
        isInitialized: true,
      });
      
      console.log('✅ User logged in and stored in user-store:', updatedUserData.email);
    },
    onError: (error: Error) => {
      console.error('❌ Login failed:', error.message);
    },
  });

  const generateOTPMutation = useMutation({
    mutationFn: generateOTP,
    onError: (error: Error) => {
      console.error('❌ Generate OTP failed:', error.message);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    generateOTP: generateOTPMutation.mutateAsync,
    isLoading: loginMutation.isPending || generateOTPMutation.isPending,
    error: loginMutation.error || generateOTPMutation.error,
    isSuccess: loginMutation.isSuccess,
    isGeneratingOTP: generateOTPMutation.isPending,
  };
}

