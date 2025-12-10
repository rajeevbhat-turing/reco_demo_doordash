'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import { loginDeliveryPartner } from '@/lib/api/delivery-auth';

interface DeliverySignInProps {
  onSuccess: () => void;
  setMode: (mode: 'signin' | 'signup') => void;
}

export default function DeliverySignIn({ onSuccess, setMode }: DeliverySignInProps) {
  const setCurrentPartner = useDeliveryPartnerStore(state => state.setCurrentPartner);
  const addPartner = useDeliveryPartnerStore(state => state.addPartner);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Updates form data and validates on change
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user types
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    // Validate email format on change
    if (field === 'email' && value.trim() && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Email format is invalid' }));
    } else if (field === 'email' && value.trim() && isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Validates email on blur
  const handleEmailBlur = () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email format is invalid' }));
    }
  };

  // Clears email input
  const clearEmail = () => {
    handleFormDataChange('email', '');
  };

  // Validates form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to authenticate
      const partner = await loginDeliveryPartner({
        email: formData.email,
        password: formData.password,
      });

      // Add partner to store if not already there, and set as current
      const existingPartner = useDeliveryPartnerStore.getState().getPartnerByEmail(partner.email);
      if (!existingPartner) {
        addPartner(partner, true);
      } else {
        setCurrentPartner(partner);
      }
      
      onSuccess();
    } catch (error: any) {
      // Check if it's a "no account found" type error
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      if (errorMessage.toLowerCase().includes('invalid email or password')) {
        setErrors({
          general: 'Invalid email or password. Please try again.',
        });
      } else {
        setErrors({
          general: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="py-6">
      {/* Email Field */}
      <div className="mb-4">
        <Label htmlFor="email" className="text-[15px] font-bold text-gray-900 mb-2 block">
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => handleFormDataChange('email', e.target.value)}
            onBlur={handleEmailBlur}
            autoFocus
            className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            rounded-lg focus-visible:border-[#191919ff] pr-10 ${
              errors.email ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
          {/* Clear button - only show when email has value */}
          {formData.email && (
            <button
              type="button"
              onClick={clearEmail}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:opacity-80 
              transition-colors bg-black rounded-full p-1"
              aria-label="Clear email"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {errors.email && (
          <div className="flex mt-1 text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-semibold">{errors.email}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <Label htmlFor="password" className="text-[15px] font-bold text-gray-900 mb-2 block">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => handleFormDataChange('password', e.target.value)}
            className={`w-full border-2 border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 
            rounded-lg focus-visible:border-[#191919ff] pr-16 ${
              errors.password ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
          <button
            type="button"
            onClick={() => handleFormDataChange('showPassword', !formData.showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#191919ff] font-semibold text-sm hover:opacity-80 transition-colors"
          >
            {formData.showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && (
          <div className="flex mt-1 text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-semibold">{errors.password}</span>
          </div>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef6d4]">
          <div className="flex">
            <div className="h-8 w-8 mr-2 flex-shrink-0 text-[#a36500]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-medium text-[#191919ff]">{errors.general}</p>
              {errors.general.includes('No account found') && (
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="mt-2 px-4 py-2 rounded-[24px] text-[#191919ff] 
                  font-bold text-sm hover:bg-gray-50 transition-colors bg-white shadow-md"
                >
                  Create an account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sign In Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4561ED] hover:bg-[#3651d4] text-white font-bold text-[15px] py-6 rounded-3xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Legal Text */}
      <p className="text-sm font-medium text-[#606060ff] mt-4 mb-4">
        By signing in, you agree to DashDoor Driver&apos;s Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}

