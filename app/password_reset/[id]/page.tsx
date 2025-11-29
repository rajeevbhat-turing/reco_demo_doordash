'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/store/user-store';
import { DashDoorLogoMark, DashDoorWordMark } from '@/components/common/Icons';
import { useUser } from '@/lib/hooks/use-user';

// Password Reset Header Component
function PasswordResetHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <DashDoorLogoMark />
              <div className="ml-1">
                <DashDoorWordMark />
              </div>
              <span className="sr-only">DashDoor</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function PasswordResetPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { updateUser } = useUserStore();

  // Validate user ID
  const { data: user, isLoading: isValidatingUser, isError: isUserError } = useUser(userId || '');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validates password field
  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return 'Password is required';
    }
    if (password.length < 10) {
      return 'Password must be atleast 10 characters';
    }
    return '';
  };

  // Validates confirm password field
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    // If password has content and confirmPassword is empty, show error
    if (password.trim() && !confirmPassword.trim()) {
      return 'The passwords do not match';
    }
    // If confirmPassword has content and doesn't match password, show error
    if (confirmPassword && confirmPassword !== password) {
      return 'The passwords do not match';
    }
    return '';
  };

  // Handles input changes with validation
  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validate on change
    if (field === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));

      // Always validate confirm password when password changes
      const confirmError = validateConfirmPassword(newFormData.confirmPassword, value);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    } else if (field === 'confirmPassword') {
      const confirmError = validateConfirmPassword(value, newFormData.password);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // Toggles password visibility for show/hide functionality
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validates form fields on submit
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate password field
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate confirm password field
    // If password has content (even if invalid), validate confirm password
    // If both fields are empty, only show error on password field
    if (formData.password.trim()) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
      if (confirmError) {
        newErrors.confirmPassword = confirmError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password using user store
      await updateUser(userId, { password: formData.password });

      // Show success state
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error UI if user ID is invalid or user doesn't exist
  if (!userId || (!isValidatingUser && (isUserError || !user))) {
    return (
      <div className="min-h-screen bg-white">
        <PasswordResetHeader />

        {/* Error Content */}
        <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <p className="text-base font-medium text-[#191919ff]">
                Error: The password reset link is invalid or expired.
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth')}
              className="w-full py-3 rounded-[28px] text-[15px] font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while validating user
  if (isValidatingUser) {
    return (
      <div className="min-h-screen bg-white">
        <PasswordResetHeader />
      </div>
    );
  }

  // If success, show success UI
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex justify-center pb-8 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-3">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-red-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#191919ff]">Your password has been changed!</h1>
            <p className="text-base font-medium text-[#606060ff]">
              Log in to DashDoor account with new password
            </p>
          </div>

          {/* Sign In Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/auth')}
              className="w-full py-3 rounded-[28px] max-w-[375px] mx-auto text-[15px] font-bold transition-colors bg-red-600 hover:bg-red-700 text-white !mt-[25vh]"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PasswordResetHeader />

      {/* Main Content */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-md w-full space-y-8">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-base font-medium text-[#191919ff]">
              Please enter your new password.
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Password Field */}
            <div>
              <Label
                htmlFor="password"
                className="text-[15px] font-bold text-[#191919ff] mb-2 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                 focus-visible:border-[#191919ff] rounded-lg ${
                   errors.password ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="text-[15px] font-bold hover:text-gray-900 text-[#191919ff]"
                  >
                    {showPasswords.password ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {errors.password && (
                <div className="flex mt-1 text-[#b71000ff]">
                  <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                    <span className="text-white text-xs font-medium">!</span>
                  </div>
                  <span className="text-sm font-medium">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Re-enter Password Field */}
            <div className="!mb-3">
              <Label
                htmlFor="confirmPassword"
                className="text-[15px] font-bold text-[#191919ff] mb-2 block"
              >
                Re-enter Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                 focus-visible:border-[#191919ff] rounded-lg ${
                   errors.confirmPassword ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="text-[15px] font-bold hover:text-gray-900 text-[#191919ff]"
                  >
                    {showPasswords.confirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <div className="flex mt-1 text-[#b71000ff]">
                  <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                    <span className="text-white text-xs font-medium">!</span>
                  </div>
                  <span className="text-sm font-medium">{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 rounded-[28px] text-[15px] font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
