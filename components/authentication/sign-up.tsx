'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/store/user-store';
import { isValidEmail, isValidName } from '@/lib/utils/helperFunctions';
import { User } from '@/lib/types/user-types';
interface SignUpProps {
  onShowOTP: (user: User) => void;
  selectedCountry: any;
  setShowCountryDropdown: (show: boolean) => void;
  countryButtonRef?: (element: HTMLButtonElement | null) => void;
}

export default function SignUp({
  onShowOTP,
  selectedCountry,
  setShowCountryDropdown,
  countryButtonRef,
}: SignUpProps) {
  const users = useUserStore(state => state.users);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Updates form data and clears field-specific errors when user types
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // If there are errors for the field, do validation again
    if (errors[field]) {
      validateField(field, value);
    }
  };

  // Validates individual field on blur
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'firstName') {
      if (!value.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (!isValidName(value)) {
        newErrors.firstName =
          'First name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas';
      } else {
        delete newErrors.firstName;
      }
    } else if (field === 'lastName') {
      if (!value.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (!isValidName(value)) {
        newErrors.lastName =
          'Last name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas';
      } else {
        delete newErrors.lastName;
      }
    } else if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(value)) {
        newErrors.email = 'Email format is invalid';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'mobileNumber') {
      if (!value.trim() || value.length <= 1) {
        newErrors.mobileNumber = 'Phone number is required';
      } else if (!/^\d+$/.test(value)) {
        newErrors.mobileNumber = 'Phone number is required';
      } else if (![8, 9, 10, 11].includes(value.length)) {
        newErrors.mobileNumber = 'Phone number is invalid';
      } else {
        delete newErrors.mobileNumber;
      }
    } else if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else if (value.length < 10) {
        newErrors.password = 'Password must contain at least 10 characters';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  // Validates all form fields and returns true if valid, false otherwise
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!isValidName(formData.firstName)) {
      newErrors.firstName =
        'First name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!isValidName(formData.lastName)) {
      newErrors.lastName =
        'Last name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.mobileNumber.trim() || formData.mobileNumber.length <= 1) {
      newErrors.mobileNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Phone number is required';
    } else if (![8, 9, 10, 11].includes(formData.mobileNumber.length)) {
      newErrors.mobileNumber = 'Phone number is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 10) {
      newErrors.password = 'Password must contain at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission with validation and authentication logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Check if user already exists - first check email
      const existingUserByEmail = users.find(user => user.email === formData.email);

      if (existingUserByEmail) {
        // Email already exists - show email error and return
        setErrors({
          general:
            'The email address you entered is already associated with an account. Sign in to your account or enter a different email to create a new account.',
        });
        return;
      }

      // If email doesn't already exist, check phone number
      const existingUserByPhone = users.find(
        user => user.phoneNumber === `${selectedCountry.dial_code}${formData.mobileNumber}`
      );

      if (existingUserByPhone) {
        // Phone exists - show phone error
        setErrors({
          general:
            'The phone number you entered is already associated with an account. Sign in to your account or enter a different phone number to create a new account.',
        });
        return;
      }

      // Validate password before proceeding
      if (!formData.password.trim()) {
        setErrors({
          password: 'Password is required',
        });
        return;
      }

      if (formData.password.length < 10) {
        setErrors({
          password: 'Password must contain at least 10 characters',
        });
        return;
      }

      // Create user object and show OTP verification modal
      const userObject: User = {
        id: '', // Will be set after OTP verification
        name: `${formData.firstName} ${formData.lastName}`,
        // Convert email address to lowercase
        email: formData.email?.toLowerCase(),
        phoneNumber: formData.mobileNumber,
        password: formData.password,
        country: {
          dialCode: selectedCountry.dial_code,
          code: selectedCountry.code,
          name: selectedCountry.name,
        },
        userCountry: selectedCountry.name,
        avatar: null,
        is_restricted: false,
        reviews: [],
        paymentMethods: [],
        addresses: [],
      };

      onShowOTP(userObject);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      {/* First Name and Last Name */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="firstName" className="text-[15px] font-bold text-gray-900 mb-2 block">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={e => handleInputChange('firstName', e.target.value)}
            onBlur={e => validateField('firstName', e.target.value)}
            autoFocus
            className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            rounded-lg focus-visible:border-[#191919ff] ${
              errors.firstName ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
          {errors.firstName && (
            <div className="flex mt-1 text-[#b71000ff]">
              <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-sm font-semibold">{errors.firstName}</span>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="lastName" className="text-[15px] font-bold text-gray-900 mb-2 block">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={e => handleInputChange('lastName', e.target.value)}
            onBlur={e => validateField('lastName', e.target.value)}
            className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            rounded-lg focus-visible:border-[#191919ff] ${
              errors.lastName ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
          {errors.lastName && (
            <div className="flex mt-1 text-[#b71000ff]">
              <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-sm font-semibold">{errors.lastName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <Label htmlFor="email" className="text-[15px] font-bold text-gray-900 mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => handleInputChange('email', e.target.value)}
          onBlur={e => validateField('email', e.target.value)}
          className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
          rounded-lg focus-visible:border-[#191919ff] ${
            errors.email ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
          }`}
        />
        {errors.email && (
          <div className="flex mt-1 text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-semibold">{errors.email}</span>
          </div>
        )}
      </div>

      {/* Mobile Number */}
      <div className="mb-4">
        <Label htmlFor="mobileNumber" className="text-[15px] font-bold text-gray-900 mb-2 block">
          Mobile Number
        </Label>
        <div className="flex">
          <button
            ref={countryButtonRef}
            type="button"
            onClick={() => setShowCountryDropdown(true)}
            className="flex items-center border border-gray-300 rounded-l-md px-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm">{selectedCountry.emoji}</span>
            <span className="text-sm ml-1">{selectedCountry.dial_code}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
          <Input
            id="mobileNumber"
            type="tel"
            placeholder=""
            value={formData.mobileNumber}
            onChange={e => {
              handleInputChange('mobileNumber', e.target.value);
              validateField('mobileNumber', e.target.value);
            }}
            className={`flex-1 rounded-l-none border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            rounded-r-lg focus-visible:border-[#191919ff] ${
              errors.mobileNumber ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
        </div>
        {errors.mobileNumber && (
          <div className="flex mt-1 text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-semibold">{errors.mobileNumber}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="password" className="text-[15px] font-bold text-gray-900">
            Password
          </Label>
          <span className="text-[14px] font-medium text-[#191919ff]">At least 10 characters</span>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            onBlur={e => validateField('password', e.target.value)}
            className={`w-full pr-20 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            focus-visible:border-[#191919ff] rounded-lg ${
              errors.password ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[15px] font-bold hover:text-gray-900 text-[#191919ff]"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
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
            <div className="h-6 w-6 mr-2 flex-shrink-0 text-[#a36500]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-[15px] font-medium text-[#191919ff]">{errors.general}</span>
          </div>
        </div>
      )}

      {/* Legal Text */}
      <p className="text-sm font-medium text-[#606060ff] mt-8 mb-4">
        By tapping &quot;Sign Up&quot; or &quot;Continue with...,&quot; you agree to DashDoor&apos;s
        Terms, including a waiver of your jury trial right, and Privacy Policy. We may text you a
        verification code. Msg & data rates apply.
      </p>

      {/* Sign Up Button */}
      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] py-3 rounded-3xl"
      >
        Sign Up
      </Button>
    </form>
  );
}
