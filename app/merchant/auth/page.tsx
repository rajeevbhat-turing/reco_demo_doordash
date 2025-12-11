'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import { loginMerchant } from '@/lib/api/merchant/merchant-auth';

export default function MerchantAuthPage() {
  const router = useRouter();
  const setCurrentMerchant = useMerchantAuthStore(state => state.setCurrentMerchant);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Gets the redirect URL based on onboarding step
  const getOnboardingStepUrl = (step: number): string => {
    switch (step) {
      case 0:
        return '/merchant/onboarding?step=order-protocol';
      case 1:
        return '/merchant/onboarding?step=hours';
      case 2:
        return '/merchant/onboarding?step=menu';
      case 3:
        return '/merchant/onboarding?step=pricing';
      case 4:
        return '/merchant/onboarding?step=payout';
      default:
        return '/merchant/onboarding?step=order-protocol';
    }
  };

  // Handles form submission - validates email, password and signs in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    // Validate password
    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);

    try {
      // Login merchant (checks store first, then API)
      const merchant = await loginMerchant({ email, password });

      // Success - sign in and redirect
      setCurrentMerchant(merchant);

      // Check onboarding status and redirect accordingly
      if (!merchant.onboardingCompleted) {
        const onboardingUrl = getOnboardingStepUrl(merchant.onboardingStep || 0);
        router.push(onboardingUrl);
      } else {
        router.push(`/merchant/store/${merchant.primaryStoreId}`);
      }
    } catch (error: any) {
      const message = error.message || 'Login failed';
      if (message.toLowerCase().includes('password')) {
        setErrors({ password: 'Incorrect password. Please try again.' });
      } else {
        setErrors({
          general:
            "We couldn't find an account with the email you entered. Please check and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handles email input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email || errors.general) {
      setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
    }
  };

  // Handles password input change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // Clears email input
  const clearEmail = () => {
    setEmail('');
    setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-6">
            <svg aria-hidden="true" width="32" height="18" viewBox="0 0 99.5 56.5" fill="#eb1700">
              <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
            </svg>
            <span className="text-[#eb1700] font-medium text-sm">for Merchants</span>
          </div>
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
            Sign in to your DashDoor for Merchants account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            New to DashDoor?{' '}
            <button
              type="button"
              onClick={() => router.push('/merchant/auth/user/signup')}
              className="text-[#eb1700] font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                autoFocus
                className={`w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-gray-900 placeholder-gray-400 text-sm
                  focus:outline-none transition-colors
                  ${errors.email ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
              />
              {/* Clear button */}
              {email && (
                <button
                  type="button"
                  onClick={clearEmail}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:opacity-80 
                  transition-colors bg-[#191919] rounded-full p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {errors.email && (
              <div className="flex items-start mt-1 text-[#b71000]">
                <div className="h-4 w-4 mr-1.5 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <span className="text-sm font-medium">{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => handlePasswordChange(e.target.value)}
                className={`w-full px-3 py-2.5 pr-14 border-2 rounded-lg text-gray-900 placeholder-gray-400 text-sm
                  focus:outline-none transition-colors
                  ${errors.password ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#191919] font-semibold text-sm
                  hover:opacity-70 transition-opacity"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-start mt-1 text-[#b71000]">
                <div className="h-4 w-4 mr-1.5 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <span className="text-sm font-medium">{errors.password}</span>
              </div>
            )}
          </div>

          {/* Reset Password Link */}
          <div className="mb-5">
            {/* <button
              type="button"
              className="text-sm font-semibold text-[#191919] underline hover:opacity-70 transition-opacity"
            >
              Reset Password
            </button> */}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-[#fef6d4] rounded-xl">
              <div className="flex">
                <div className="h-5 w-5 mr-2 flex-shrink-0 text-[#a36500]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-[#191919] font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#eb1700] hover:bg-[#c41400] disabled:bg-[#eb1700]/70 text-white font-bold py-3 px-4 rounded-full
              transition-colors duration-200 text-sm disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
