'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import LetterAvatar from '@/components/delivery/letter-avatar';
import countriesData from '@/lib/utils/countryCode.json';
import { isValidName, isValidEmail } from '@/lib/utils/helperFunctions';
import {
  formatPhoneNumber,
  extractDigits,
  validatePhoneNumber,
  getMaxDigits,
  getPhonePlaceholder,
} from '@/lib/utils/phone-validation';

export default function DeliveryAccountPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const updatePartner = useDeliveryPartnerStore(state => state.updatePartner);
  const partners = useDeliveryPartnerStore(state => state.partners);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const phoneCountrySelectRef = useRef<HTMLDivElement>(null);
  const phoneCountryButtonRef = useRef<HTMLButtonElement>(null);
  const phoneCountryDropdownRef = useRef<HTMLDivElement>(null);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountry: '+1 (US)',
  });

  // Validation errors
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Autopopulate data from current partner
  useEffect(() => {
    if (currentPartner) {
      const phoneCountryDisplay = currentPartner.country 
        ? `${currentPartner.country.dialCode} (${currentPartner.country.code})`
        : '+1 (US)';

      setFormData({
        firstName: currentPartner.name?.split(' ')[0] || '',
        lastName: currentPartner.name?.split(' ').slice(1).join(' ') || '',
        email: currentPartner.email || '',
        phoneNumber: currentPartner.phoneNumber || '',
        phoneCountry: phoneCountryDisplay,
      });
    }
  }, [currentPartner]);

  // Close phone country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        phoneCountrySelectRef.current &&
        !phoneCountrySelectRef.current.contains(event.target as Node)
      ) {
        setShowPhoneCountryDropdown(false);
      }
    };

    const positionDropdown = () => {
      if (
        showPhoneCountryDropdown &&
        phoneCountryButtonRef.current &&
        phoneCountryDropdownRef.current
      ) {
        const buttonRect = phoneCountryButtonRef.current.getBoundingClientRect();
        phoneCountryDropdownRef.current.style.top = `${buttonRect.bottom + 4}px`;
        phoneCountryDropdownRef.current.style.left = `${buttonRect.left}px`;
        phoneCountryDropdownRef.current.style.width = `${buttonRect.width}px`;
      }
    };

    if (showPhoneCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      positionDropdown();
      window.addEventListener('scroll', positionDropdown, true);
      window.addEventListener('resize', positionDropdown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', positionDropdown, true);
      window.removeEventListener('resize', positionDropdown);
    };
  }, [showPhoneCountryDropdown]);

  // Check if form has changes
  const hasChanges = () => {
    if (!currentPartner) return false;

    if (formData.firstName.trim().length === 0 || formData.lastName.trim().length === 0) {
      return false;
    }

    const originalPhoneCountry = currentPartner.country 
      ? `${currentPartner.country.dialCode} (${currentPartner.country.code})`
      : '+1 (US)';

    const originalData = {
      firstName: currentPartner.name?.split(' ')[0] || '',
      lastName: currentPartner.name?.split(' ').slice(1).join(' ') || '',
      email: currentPartner.email || '',
      phoneNumber: currentPartner.phoneNumber || '',
      phoneCountry: originalPhoneCountry,
    };

    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Get country code from phone country string (e.g., "+1 (US)" -> "US")
  const getCountryCode = (phoneCountry: string): string => {
    const match = phoneCountry.match(/\(([A-Z]{2})\)/);
    return match ? match[1] : 'US';
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      // Extract digits and format phone number
      const countryCode = getCountryCode(formData.phoneCountry);
      const digits = extractDigits(value);
      const maxDigits = getMaxDigits(countryCode);
      const limitedDigits = digits.slice(0, maxDigits);
      const formattedNumber = formatPhoneNumber(limitedDigits, countryCode);
      
      setFormData(prev => ({ ...prev, phoneNumber: formattedNumber }));
      
      // Validate on change if there's already an error
      if (errors.phoneNumber) {
        const validation = validatePhoneNumber(formattedNumber, countryCode);
        setErrors(prev => ({ ...prev, phoneNumber: validation.error || '' }));
      }
    } else if (field === 'phoneCountry') {
      // When country changes, reformat the phone number
      const newCountryCode = value.match(/\(([A-Z]{2})\)/)?.[1] || 'US';
      const digits = extractDigits(formData.phoneNumber);
      const maxDigits = getMaxDigits(newCountryCode);
      const limitedDigits = digits.slice(0, maxDigits);
      const formattedNumber = formatPhoneNumber(limitedDigits, newCountryCode);
      
      setFormData(prev => ({ 
        ...prev, 
        phoneCountry: value,
        phoneNumber: formattedNumber 
      }));
      
      // Clear phone error when country changes
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      if (errors[field as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }

    setSaveSuccess(false);
    if (generalError) {
      setGeneralError('');
    }
  };

  // Validate individual field on blur
  const validateField = (field: string) => {
    const newErrors = { ...errors };

    if (field === 'firstName') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (!isValidName(formData.firstName)) {
        newErrors.firstName = 'First name contains invalid characters';
      } else {
        newErrors.firstName = '';
      }
    } else if (field === 'lastName') {
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (!isValidName(formData.lastName)) {
        newErrors.lastName = 'Last name contains invalid characters';
      } else {
        newErrors.lastName = '';
      }
    } else if (field === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        newErrors.email = '';
      }
    } else if (field === 'phoneNumber') {
      const countryCode = getCountryCode(formData.phoneCountry);
      const validation = validatePhoneNumber(formData.phoneNumber, countryCode);
      newErrors.phoneNumber = validation.error || '';
    }

    setErrors(newErrors);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!isValidName(formData.firstName)) {
      newErrors.firstName = 'First name contains invalid characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!isValidName(formData.lastName)) {
      newErrors.lastName = 'Last name contains invalid characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Use proper phone validation
    const countryCode = getCountryCode(formData.phoneCountry);
    const phoneValidation = validatePhoneNumber(formData.phoneNumber, countryCode);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error || 'Phone number is invalid';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Handle save
  const handleSave = async () => {
    if (!currentPartner) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setGeneralError('');
    setSaveSuccess(false);

    try {
      // Check for duplicate email (excluding current partner)
      const existingPartnerByEmail = partners.find(
        partner => partner.email.toLowerCase() === formData.email.toLowerCase() && partner.id !== currentPartner.id
      );

      if (existingPartnerByEmail) {
        setGeneralError('The email address you entered is already associated with another account.');
        setIsSaving(false);
        return;
      }

      // Find the country data from the selected phone country
      const selectedCountryData = countriesData.find(
        c => `${c.dial_code} (${c.code})` === formData.phoneCountry
      );

      // Prepare update data
      const updateData: any = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.toLowerCase(),
        phoneNumber: formData.phoneNumber,
      };

      if (selectedCountryData) {
        updateData.country = {
          dialCode: selectedCountryData.dial_code,
          code: selectedCountryData.code,
          name: selectedCountryData.name,
        };
      }

      // Update partner in store
      updatePartner(currentPartner.id, updateData);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setGeneralError('Unable to update profile. Please try again later.');
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  // Handle delete account - navigate to delete page
  const handleDeleteAccount = () => {
    router.push('/delivery/account/delete');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your driver profile and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <LetterAvatar name={currentPartner?.name || ''} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentPartner?.name || 'Driver'}</h2>
            <p className="text-gray-500">{currentPartner?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-3 bg-gray-50 rounded-lg border-2 transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-transparent focus:border-[#4561ED]'
                }`}
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                onBlur={() => validateField('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-3 bg-gray-50 rounded-lg border-2 transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-transparent focus:border-[#4561ED]'
                }`}
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                onBlur={() => validateField('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full p-3 bg-gray-50 rounded-lg border-2 transition-colors ${
                  errors.email ? 'border-red-500' : 'border-transparent focus:border-[#4561ED]'
                }`}
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                onBlur={() => validateField('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 items-stretch w-full">
                {/* Country Code Dropdown */}
                <div className="relative flex-shrink-0" ref={phoneCountrySelectRef}>
                  <button
                    ref={phoneCountryButtonRef}
                    type="button"
                    onClick={() => setShowPhoneCountryDropdown(!showPhoneCountryDropdown)}
                    className="h-full px-3 py-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-[#4561ED] text-left flex items-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                  >
                    <span>{formData.phoneCountry}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${showPhoneCountryDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showPhoneCountryDropdown && (
                    <div
                      ref={phoneCountryDropdownRef}
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[1000] min-w-[140px]"
                    >
                      {countriesData.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            handleInputChange('phoneCountry', `${country.dial_code} (${country.code})`);
                            setShowPhoneCountryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors text-sm whitespace-nowrap ${
                            formData.phoneCountry === `${country.dial_code} (${country.code})`
                              ? 'bg-[#4561ED]/10 text-[#4561ED] font-medium'
                              : ''
                          }`}
                        >
                          {country.dial_code} ({country.code})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone Input */}
                <input
                  type="tel"
                  className={`flex-1 min-w-0 px-3 py-3 bg-gray-50 rounded-lg border-2 transition-colors ${
                    errors.phoneNumber ? 'border-red-500' : 'border-transparent focus:border-[#4561ED]'
                  }`}
                  value={formData.phoneNumber}
                  onChange={e => handleInputChange('phoneNumber', e.target.value)}
                  onBlur={() => validateField('phoneNumber')}
                  placeholder={getPhonePlaceholder(getCountryCode(formData.phoneCountry)) || '(555) 123-4567'}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* General Error */}
          {generalError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{generalError}</p>
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-600 font-medium">Profile updated successfully!</p>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges() || isSaving}
              className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center justify-center min-w-[120px] ${
                hasChanges() && !isSaving
                  ? 'bg-[#4561ED] hover:bg-[#3651d4] text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Driver Stats Card */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Driver Statistics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[#4561ED]">{currentPartner?.lifetimeDeliveries || 0}</p>
              <p className="text-sm text-gray-500">Total Deliveries</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-500">{currentPartner?.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{currentPartner?.acceptanceRate?.toFixed(0) || 0}%</p>
              <p className="text-sm text-gray-500">Acceptance Rate</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-500">{currentPartner?.onTimeRate?.toFixed(0) || 0}%</p>
              <p className="text-sm text-gray-500">On-Time Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            DashDoor protects your privacy and personal information. Your data is securely stored and never shared without your consent.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-red-100">
          <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg border border-red-200 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

