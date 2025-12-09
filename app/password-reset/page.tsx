'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TwoStepVerificationModal from '@/components/modals/two-step-verification-modal';
import { useUserStore } from '@/store/user-store';
import { validatePassword, getPasswordErrorMessage } from '@/lib/utils/password-validation';

export default function PasswordResetPage() {
  const router = useRouter();
  const {
    currentUser,
    changePasswordPhoneVerified,
    setChangePasswordPhoneVerified,
    changePassword,
    setCurrentUser,
    setTempAddress,
  } = useUserStore();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [showTwoStepModal, setShowTwoStepModal] = useState(false);

  // Handles input changes and clears relevant errors
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific errors when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear password errors when user types in password fields
    if (passwordErrors.length > 0 && (field === 'newPassword' || field === 'confirmPassword')) {
      setPasswordErrors([]);
    }

    // Clear old password error when user types in old password field
    if (oldPasswordError && field === 'oldPassword') {
      setOldPasswordError('');
    }
  };

  // Toggles password visibility for show/hide functionality
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validates all form fields and returns true if valid
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Validate password strength
      const passwordValidation = validatePassword(formData.newPassword, formData.oldPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = getPasswordErrorMessage(passwordValidation);
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm new password is required';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission with password validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setPasswordErrors([]);
    setOldPasswordError('');

    // Check if old password is correct first
    if (currentUser && formData.oldPassword !== currentUser.password) {
      setOldPasswordError('Old password is not correct.');
      return;
    }

    // Then check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.newPassword, formData.oldPassword);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      return;
    }

    // If phone is already verified, change password immediately
    if (changePasswordPhoneVerified) {
      const success = changePassword(formData.oldPassword, formData.newPassword);
      if (success) {
        // Logout user and navigate to landing page
        setCurrentUser(null);
        setTempAddress(null); // Clear temp address on logout
        router.push('/');
      } else {
        setOldPasswordError('Old password is not correct.');
      }
      return;
    }

    // If all validations pass, show 2-step verification modal
    if (validateForm()) {
      setShowTwoStepModal(true);
    }
  };

  // Enable submit button if all fields are filled
  const enableSubmitButton =
    formData.oldPassword.trim().length > 0 &&
    formData.newPassword.trim().length > 0 &&
    formData.confirmPassword.trim().length > 0;

  // Handles 2-step verification success
  const handleTwoStepSuccess = () => {
    setShowTwoStepModal(false);
    setChangePasswordPhoneVerified(true);

    // If there are no password errors, change password immediately
    if (passwordErrors.length === 0 && !oldPasswordError) {
      const success = changePassword(formData.oldPassword, formData.newPassword);
      if (success) {
        // Logout user and navigate to landing page
        setCurrentUser(null);
        setTempAddress(null); // Clear temp address on logout
        router.push('/');
      } else {
        setOldPasswordError('Old password is not correct.');
      }
    }
  };

  // Handles closing 2-step verification modal
  const handleCloseTwoStepModal = useCallback(() => {
    setShowTwoStepModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8 bg-white px-6 pb-8 pt-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#191919ff]">Set new password</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div>
            <Label
              htmlFor="oldPassword"
              className="text-[15px] font-bold text-[#191919ff] mb-2 block"
            >
              Old Password
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showPasswords.oldPassword ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={e => handleInputChange('oldPassword', e.target.value)}
                className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                 focus-visible:border-[#191919ff] rounded-lg ${
                   oldPasswordError ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className="text-[15px] font-bold hover:text-gray-900 text-[#191919ff]"
                >
                  {showPasswords.oldPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {oldPasswordError && (
              <div className="flex mt-1 text-[#b71000ff]">
                <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-sm font-semibold">{oldPasswordError}</span>
              </div>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label
              htmlFor="newPassword"
              className="text-[15px] font-bold text-[#191919ff] mb-2 block"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                 focus-visible:border-[#191919ff] rounded-lg ${
                   passwordErrors.length > 0 ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="text-[15px] font-bold hover:text-gray-900 text-[#191919ff]"
                >
                  {showPasswords.newPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {errors.newPassword && (
              <div className="flex mt-1 text-[#b71000ff]">
                <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-sm font-semibold">{errors.newPassword}</span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-[15px] font-bold text-[#191919ff] mb-2 block"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                 focus-visible:border-[#191919ff] rounded-lg ${
                   passwordErrors.length > 0 ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
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
            {passwordErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-start text-[#b71000ff]">
                    <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff] mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password Recommendations */}
          <div className="py-3">
            <p className="text-sm font-medium text-[#191919ff] mb-3">
              We recommend choosing a password that:
            </p>
            <ul className="text-sm text-[#191919ff] list-disc pl-5">
              <li>Is not being used by you already for another account / login</li>
              <li>Is at least 10 characters in length</li>
              <li>Uses uppercase and lowercase letters</li>
              <li>Uses at least one number (0-9) and special characters (!@#$%^*...)</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!enableSubmitButton}
            className={`w-full py-3 rounded-[28px] text-[15px] font-semibold transition-colors ${
              enableSubmitButton
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Change my password
          </Button>
        </form>
      </div>

      {/* 2-Step Verification Modal */}
      <TwoStepVerificationModal
        isOpen={showTwoStepModal}
        onClose={handleCloseTwoStepModal}
        onSuccess={handleTwoStepSuccess}
        phoneNumber={`${currentUser?.country?.dialCode} ******${currentUser?.phoneNumber?.slice(
          -4
        )}`}
      />
    </div>
  );
}
