'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Mail, CreditCard } from 'lucide-react';
import Link from 'next/link';
import OTPVerificationModal from '@/components/modals/otp-verification-modal';
import { useUserStore } from '@/store/user-store';
import countriesData from '@/lib/utils/countryCode.json';
import { isValidName } from '@/lib/utils/helperFunctions';

export default function AccountSettingsPage() {
  const currentUser = useUserStore(state => state.currentUser);
  const updateUser = useUserStore(state => state.updateUser);
  const [country, setCountry] = useState('United States');
  const [phoneCountry, setPhoneCountry] = useState('+1 (US)');
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [verificationDone, setVerificationDone] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const countrySelectRef = useRef<HTMLDivElement>(null);
  const countryButtonRef = useRef<HTMLButtonElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const phoneCountrySelectRef = useRef<HTMLDivElement>(null);
  const phoneCountryButtonRef = useRef<HTMLButtonElement>(null);
  const phoneCountryDropdownRef = useRef<HTMLDivElement>(null);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Autopopulate data from current user
  useEffect(() => {
    if (currentUser) {
      setCountry(currentUser.userCountry || 'United States');
      setPhoneCountry(`${currentUser.country?.dialCode} (${currentUser.country?.code})`);

      // Set initial form data
      setFormData({
        firstName: currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
  }, [currentUser]);

  // Sync country state when userCountry changes (after save)
  useEffect(() => {
    if (currentUser?.userCountry) {
      setCountry(currentUser.userCountry);
    }
  }, [currentUser?.userCountry]);

  // Disable body scroll and limit height when OTP modal is open
  useEffect(() => {
    if (showOTPModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, [showOTPModal]);

  // Close country dropdown when clicking outside and position it below
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countrySelectRef.current && !countrySelectRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (
        phoneCountrySelectRef.current &&
        !phoneCountrySelectRef.current.contains(event.target as Node)
      ) {
        setShowPhoneCountryDropdown(false);
      }
    };

    const positionDropdown = () => {
      if (showCountryDropdown && countryButtonRef.current && countryDropdownRef.current) {
        const buttonRect = countryButtonRef.current.getBoundingClientRect();
        // Position dropdown below the button
        countryDropdownRef.current.style.top = `${buttonRect.bottom + 4}px`;
        countryDropdownRef.current.style.left = `${buttonRect.left}px`;
        countryDropdownRef.current.style.width = `${buttonRect.width}px`;
      }
      if (
        showPhoneCountryDropdown &&
        phoneCountryButtonRef.current &&
        phoneCountryDropdownRef.current
      ) {
        const buttonRect = phoneCountryButtonRef.current.getBoundingClientRect();
        // Position dropdown below the button
        phoneCountryDropdownRef.current.style.top = `${buttonRect.bottom + 4}px`;
        phoneCountryDropdownRef.current.style.left = `${buttonRect.left}px`;
        phoneCountryDropdownRef.current.style.width = `${buttonRect.width}px`;
      }
    };

    if (showCountryDropdown || showPhoneCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      positionDropdown();
      // Reposition on scroll or resize
      window.addEventListener('scroll', positionDropdown, true);
      window.addEventListener('resize', positionDropdown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', positionDropdown, true);
      window.removeEventListener('resize', positionDropdown);
    };
  }, [showCountryDropdown, showPhoneCountryDropdown]);

  // Check if form has changes and required fields are filled
  const hasChanges = () => {
    if (!currentUser) return false;

    // Check if required fields are filled
    if (formData.firstName.trim().length === 0 || formData.lastName.trim().length === 0) {
      return false;
    }

    const originalData = {
      firstName: currentUser.name?.split(' ')[0] || '',
      lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
    };

    const originalCountry = currentUser.userCountry || 'United States';
    const originalPhoneCountry = `${currentUser.country?.dialCode} (${currentUser.country?.code})`;

    // Check if any form data has changed
    const formDataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);

    // Check if country or phone country has changed
    const countryChanged = country !== originalCountry || phoneCountry !== originalPhoneCountry;

    return formDataChanged || countryChanged;
  };

  // Validation functions
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        return value.trim() === '' ? 'First name is required' : '';
      case 'lastName':
        return value.trim() === '' ? 'Last name is required' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value.trim() === ''
          ? 'Email is required'
          : !emailRegex.test(value)
            ? 'Please enter a valid email address'
            : '';
      case 'phoneNumber':
        const phoneRegex = /^\d{10}$/;
        return value.trim() === ''
          ? 'Phone number is required'
          : !phoneRegex.test(value)
            ? 'Phone number is invalid'
            : '';
      default:
        return '';
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear general error when user starts typing in phone number field
    if (field === 'phoneNumber' && generalError) {
      setGeneralError('');
    }
  };

  // Generate OTP
  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    console.log('Generated OTP:', newOtp);
    return newOtp;
  };

  // Handle OTP verification
  const handleOTPVerification = (
    enteredOtp: string,
    generatedOtp: string,
    setOtpError: (error: string) => void,
    setAttemptsLeft: (attempts: number) => void,
    attemptsLeft: number,
    setShowTooManyAttempts: (show: boolean) => void
  ) => {
    // Accept any 6-digit OTP for development/testing
    if (enteredOtp.length === 6) {
      // OTP is correct - save the pending changes
      if (pendingChanges && currentUser) {
        updateUser(currentUser.id, pendingChanges);
        setPendingChanges(null);
        setShowOTPModal(false);
        setIsSaving(false);
        setVerificationDone(true); // Mark verification as done
      }
    } else {
      // OTP is incorrect - show error
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);
      setOtpError('Invalid or incorrect code');

      if (newAttemptsLeft <= 0) {
        // No attempts left - show too many attempts message
        setShowTooManyAttempts(true);
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setGeneralError(''); // Clear any previous general error

    // Validate first name and last name
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !isValidName(formData.firstName) ||
      !isValidName(formData.lastName)
    ) {
      setGeneralError('Unable to update profile. Please try again later.');
      setIsSaving(false);
      return;
    }

    try {
      // Check what has changed
      const originalData = {
        firstName: currentUser.name?.split(' ')[0] || '',
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      };

      const originalCountry = currentUser.userCountry || 'United States';
      const originalPhoneCountry = `${currentUser.country?.dialCode} (${currentUser.country?.code})`;

      // Check if only country, first name, or last name changed
      const nameChanged =
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName;
      const countryChanged = country !== originalCountry;
      const phoneCountryChanged = phoneCountry !== originalPhoneCountry;
      const emailChanged = formData.email !== originalData.email;
      const phoneChanged = formData.phoneNumber !== originalData.phoneNumber;

      // If email, phone, or phone country changed, validate them first
      if (emailChanged || phoneChanged || phoneCountryChanged) {
        const validationErrors = [];

        // Validate email if it changed
        if (emailChanged) {
          const emailError = validateField('email', formData.email);
          if (emailError) {
            validationErrors.push(emailError);
          }
        }

        // Validate phone if it changed
        if (phoneChanged) {
          const phoneError = validateField('phoneNumber', formData.phoneNumber);
          if (phoneError) {
            // Set specific phone number error message
            setErrors(prev => ({ ...prev, phoneNumber: phoneError }));
            setGeneralError(phoneError);
            setIsSaving(false);
            return;
          }
        }

        // If there are validation errors (for email), show general error and return
        if (validationErrors.length > 0) {
          setGeneralError('Unable to update profile. Please try again later.');
          setIsSaving(false);
          return;
        }

        // If validation passes, prepare changes
        const updateData: any = {};

        if (emailChanged) {
          updateData.email = formData.email;
        }

        if (phoneChanged) {
          updateData.phoneNumber = formData.phoneNumber;
        }

        if (phoneCountryChanged) {
          // Find the country data from the selected phone country
          const selectedCountryData = countriesData.find(
            c => `${c.dial_code} (${c.code})` === phoneCountry
          );
          if (selectedCountryData) {
            updateData.country = {
              dialCode: selectedCountryData.dial_code,
              code: selectedCountryData.code,
              name: selectedCountryData.name,
            };
          }
        }

        // Include country change if it changed
        if (countryChanged) {
          updateData.userCountry = country;
        }

        // Include name change if it changed
        if (nameChanged) {
          updateData.name = `${formData.firstName} ${formData.lastName}`.trim();
        }

        // If verification is already done, save directly
        if (verificationDone) {
          updateUser(currentUser.id, updateData);
          setIsSaving(false);
          return;
        }

        // If verification not done, show OTP modal
        setPendingChanges(updateData);
        generateOTP();
        setShowOTPModal(true);
        return;
      }

      // Only save if changes are related to country or name
      if (nameChanged || countryChanged) {
        // Prepare update data
        const updateData: any = {};

        if (nameChanged) {
          updateData.name = `${formData.firstName} ${formData.lastName}`.trim();
        }

        if (countryChanged) {
          // Update userCountry field
          updateData.userCountry = country;
        }

        // Update user in store
        updateUser(currentUser.id, updateData);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setGeneralError('Unable to update profile. Please try again later.');
    } finally {
      // Wait 500ms before hiding loading state
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pt-24">
      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="flex gap-4">
            <Link
              href="/password-reset"
              className="text-red-500 font-semibold text-[15px] hover:bg-gray-100 rounded-[28px] px-4 py-2 transition-colors"
            >
              Change Password
            </Link>
            <Link
              href="/consumer/privacy/manage_account"
              className="text-red-500 font-semibold text-[15px] hover:bg-gray-100 rounded-[28px] px-4 py-2 transition-colors"
            >
              Manage Account
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">First Name</label>
                <div className="text-sm text-gray-500 ml-4 mt-3">Required</div>
              </div>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 rounded-md"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <div className="text-sm text-gray-500 ml-4 mt-3">Required</div>
              </div>
              <input
                type="text"
                className="w-full p-3 bg-gray-50 rounded-md"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 bg-gray-50 rounded-md"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <div className="relative" ref={phoneCountrySelectRef}>
                  <button
                    ref={phoneCountryButtonRef}
                    type="button"
                    onClick={() => setShowPhoneCountryDropdown(!showPhoneCountryDropdown)}
                    className="w-full p-3 bg-gray-50 rounded-md pr-10 text-left flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span>{phoneCountry}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${showPhoneCountryDropdown ? 'transform rotate-180' : ''}`}
                    />
                  </button>
                  {showPhoneCountryDropdown && (
                    <div
                      ref={phoneCountryDropdownRef}
                      className="fixed bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[1000]"
                      style={{
                        position: 'fixed',
                        zIndex: 1000,
                      }}
                    >
                      {countriesData.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setPhoneCountry(`${country.dial_code} (${country.code})`);
                            setShowPhoneCountryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                            phoneCountry === `${country.dial_code} (${country.code})`
                              ? 'bg-gray-50 font-medium'
                              : ''
                          }`}
                        >
                          {country.dial_code} ({country.code})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    className={`w-full p-3 bg-gray-50 rounded-md ${
                      errors.phoneNumber ? 'border-2 border-red-500' : ''
                    }`}
                    value={formData.phoneNumber}
                    onChange={e => handleInputChange('phoneNumber', e.target.value)}
                  />
                  {!errors.phoneNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="border-2 border-[#22C55E] rounded-full">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#22C55E"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {errors.phoneNumber && (
                  <div className="mt-1 text-sm text-red-500">{errors.phoneNumber}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Country</label>
            <div className="relative w-full md:w-1/2" ref={countrySelectRef}>
              <button
                ref={countryButtonRef}
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full p-3 bg-gray-50 rounded-md pr-10 text-left flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span>{country}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${showCountryDropdown ? 'transform rotate-180' : ''}`}
                />
              </button>
              {showCountryDropdown && (
                <div
                  ref={countryDropdownRef}
                  className="fixed bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-[1000]"
                  style={{
                    position: 'fixed',
                    zIndex: 1000,
                  }}
                >
                  {countriesData.map(countryData => (
                    <button
                      key={countryData.code}
                      type="button"
                      onClick={() => {
                        setCountry(countryData.name);
                        setShowCountryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        country === countryData.name ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {countryData.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="receiveUpdates"
              className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
              checked={receiveUpdates}
              onChange={() => setReceiveUpdates(!receiveUpdates)}
            />
            <label htmlFor="receiveUpdates" className="ml-2 text-sm text-gray-700">
              Receive order status updates via text
            </label>
          </div> */}

          <div className="mt-6 flex justify-start">
            <button
              onClick={handleSave}
              disabled={!hasChanges() || isSaving}
              className={`font-medium rounded-[28px] flex items-center justify-center w-[150px] h-[40px] ${
                hasChanges() || isSaving
                  ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>

        {/* General Error Message */}
        {generalError && (
          <div className="mt-2 py-3 px-5 bg-[#fef6d4]">
            <span className="text-sm font-medium text-[#191919ff]">{generalError}</span>
          </div>
        )}
      </div>

      {/* Business Profile Section */}
      {/* Hidden business profile section for now since they are not implemented yet */}
      {/* <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Business profile</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">Create a business profile for effortless expensing</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Set a payment method for business orders</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Get receipts sent to your work email</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg">
              Create profile
            </button>
          </div>
        </div>
      </div> */}

      {/* Privacy Section */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Privacy</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-2">
            DashDoor protects your privacy and personal information. You can choose to share your
            information with businesses so they can send you promotions and emails.
            {/* Hidden learn more link for now since it is not implemented yet. */}
            {/* <span className="text-red-500 ml-1 font-medium">Learn More</span> */}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Marketing Choices</h3>
          <p className="text-gray-700">
            Learn about and control personalized ads.
            {/* Hidden learn more link for now since it is not implemented yet. */}
            {/* <span className="text-red-500 ml-1 font-medium">Learn More</span> */}
          </p>
        </div>
      </div>

      {/* Linked Accounts Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Linked accounts</h2>
        </div>

        <div className="p-6">You are not sharing information with any websites at the moment.</div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setIsSaving(false);
        }}
        onVerify={handleOTPVerification}
        phoneNumber={currentUser?.phoneNumber || ''}
        countryCode={currentUser?.country?.dialCode || '+1'}
        generatedOTP={otp}
        containerClassName="z-[150] w-full h-[100vh]"
      />
    </div>
  );
}
