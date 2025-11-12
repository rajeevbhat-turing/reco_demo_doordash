'use client';

import { useMutation } from '@tanstack/react-query';
import { loginUser, generateOTP } from '@/lib/api/auth';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

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
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (userData: User) => {
      // Store user data in Zustand store
      // This will automatically persist to localStorage via Zustand persist middleware
      setCurrentUser(userData);
      console.log('✅ User logged in and stored in user-store:', userData.email);
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

