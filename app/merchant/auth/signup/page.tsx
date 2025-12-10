'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, Check } from 'lucide-react';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import countryData from '@/lib/utils/countryCode.json';

// Country type from countryCode.json
interface Country {
  name: string;
  code: string;
  emoji: string;
  unicode: string;
  image: string;
  dial_code: string;
}

export default function MerchantSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countryData.find(country => country.code === 'US') || countryData[0]
  );
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState('');

  // Detect user's country on component mount
  useEffect(() => {
    const detectUserCountry = () => {
      try {
        const userLocale = navigator.language || navigator.languages?.[0];
        if (userLocale) {
          const countryCode = userLocale.split('-')[1] || userLocale.split('_')[1];
          if (countryCode) {
            const userCountry = countryData.find(
              country => country.code === countryCode.toUpperCase()
            );
            if (userCountry) {
              setSelectedCountry(userCountry);
              return;
            }
          }
        }
      } catch {
        // Could not detect user country, using default (US)
      }
    };
    detectUserCountry();
  }, []);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearchValue.trim()) return countryData;
    const search = countrySearchValue.toLowerCase();
    return countryData.filter(
      country =>
        country.name.toLowerCase().includes(search) ||
        country.dial_code.includes(search) ||
        country.code.toLowerCase().includes(search)
    );
  }, [countrySearchValue]);

  // Password validation checks
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    const emailUsername = formData.email.split('@')[0].toLowerCase();
    
    return {
      noEmailUsername: password.length > 0 && (emailUsername.length === 0 || !password.toLowerCase().includes(emailUsername)),
      noSpaceStartEnd: password.length > 0 && password === password.trim(),
      minLength: password.length >= 10,
      hasUpperLowerSymbol: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password),
    };
  }, [formData.password, formData.email]);

  // Updates form data and clears field-specific errors
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  // Validates individual field on blur
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'firstName') {
      if (!value.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (!/^[a-zA-Z\s\-'.,]+$/.test(value)) {
        newErrors.firstName = 'First name contains invalid characters';
      } else {
        delete newErrors.firstName;
      }
    } else if (field === 'lastName') {
      if (!value.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (!/^[a-zA-Z\s\-'.,]+$/.test(value)) {
        newErrors.lastName = 'Last name contains invalid characters';
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
      if (!value.trim()) {
        newErrors.mobileNumber = 'Phone number is required';
      } else if (!/^\d+$/.test(value)) {
        newErrors.mobileNumber = 'Phone number must contain only digits';
      } else if (value.length < 10) {
        newErrors.mobileNumber = 'Phone number is invalid';
      } else {
        delete newErrors.mobileNumber;
      }
    } else if (field === 'password') {
      if (!value.trim()) {
        newErrors.password = 'Password is required';
      } else if (!passwordValidation.minLength || !passwordValidation.hasUpperLowerSymbol) {
        newErrors.password = 'Password does not meet requirements';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  // Validates all form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Phone number is required';
    } else if (formData.mobileNumber.length < 10) {
      newErrors.mobileNumber = 'Phone number is invalid';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.minLength || !passwordValidation.hasUpperLowerSymbol) {
      newErrors.password = 'Password does not meet requirements';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement actual sign up functionality
      console.log('Form submitted:', formData);
    }
  };

  // Renders password validation indicator
  const ValidationIndicator = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {formData.password.length === 0 ? (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <X className="h-3 w-3 text-gray-400" />
        </div>
      ) : isValid ? (
        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <X className="h-3 w-3 text-gray-400" />
        </div>
      )}
      <span className={`text-sm ${formData.password.length > 0 && isValid ? 'text-green-600' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-4">
            <svg aria-hidden="true" width="32" height="18" viewBox="0 0 99.5 56.5" fill="#eb1700">
              <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
            </svg>
            <span className="text-[#eb1700] font-medium text-sm">for Merchants</span>
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
            Create account
          </h1>
          <p className="text-sm text-gray-600 mb-1">
            Sign up for DashDoor for Merchants to get 0% commission for up to 30 days.
          </p>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/merchant/auth')}
              className="text-[#eb1700] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4 mb-1">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                onBlur={e => validateField('firstName', e.target.value)}
                autoFocus
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-900 text-sm
                  focus:outline-none transition-colors
                  ${errors.firstName ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
              />
              {errors.firstName && (
                <div className="flex items-start mt-1 text-[#b71000]">
                  <div className="h-4 w-4 mr-1 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <span className="text-xs font-medium">{errors.firstName}</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                onBlur={e => validateField('lastName', e.target.value)}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-900 text-sm
                  focus:outline-none transition-colors
                  ${errors.lastName ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
              />
              {errors.lastName && (
                <div className="flex items-start mt-1 text-[#b71000]">
                  <div className="h-4 w-4 mr-1 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <span className="text-xs font-medium">{errors.lastName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <p className="text-xs text-gray-500">As it appears on your government ID</p>
            <p className="text-xs text-gray-500">As it appears on your government ID</p>
          </div>

          {/* Mobile Number */}
          <div className="mb-1">
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-900 mb-1.5">
              Mobile Number
            </label>
            <div className="flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center h-full border-2 border-transparent bg-[#f7f7f7] rounded-l-lg px-3 py-2.5 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm">{selectedCountry.emoji}</span>
                  <span className="text-sm ml-1">{selectedCountry.dial_code}</span>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearchValue}
                        onChange={e => setCountrySearchValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400"
                        autoFocus
                      />
                    </div>
                    {/* Country list */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                            setCountrySearchValue('');
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm ${
                            selectedCountry.code === country.code ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span>{country.emoji}</span>
                          <span className="flex-1 truncate">{country.name}</span>
                          <span className="text-gray-500">{country.dial_code}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <p className="px-3 py-2 text-sm text-gray-500">No countries found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={e => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                onBlur={e => validateField('mobileNumber', e.target.value)}
                placeholder="(202) 499-5377"
                className={`flex-1 px-3 py-2.5 border-2 rounded-r-lg text-gray-900 text-sm
                  focus:outline-none transition-colors
                  ${errors.mobileNumber ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
              />
            </div>
            {errors.mobileNumber && (
              <div className="flex items-start mt-1 text-[#b71000]">
                <div className="h-4 w-4 mr-1 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <span className="text-xs font-medium">{errors.mobileNumber}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">We use this to verify your account</p>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              onBlur={e => validateField('email', e.target.value)}
              className={`w-full px-3 py-2.5 border-2 rounded-lg text-gray-900 text-sm
                focus:outline-none transition-colors
                ${errors.email ? 'border-[#b71000] bg-[#fef0ed]' : 'border-transparent bg-[#f7f7f7] focus:border-[#191919]'}`}
            />
            {errors.email && (
              <div className="flex items-start mt-1 text-[#b71000]">
                <div className="h-4 w-4 mr-1 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                  <span className="text-white text-[10px] font-bold">!</span>
                </div>
                <span className="text-xs font-medium">{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                onBlur={e => validateField('password', e.target.value)}
                className={`w-full px-3 py-2.5 pr-14 border-2 rounded-lg text-gray-900 text-sm
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
          </div>

          {/* Password Validation Indicators */}
          <div className="space-y-2 mb-6">
            <ValidationIndicator
              isValid={passwordValidation.noEmailUsername}
              text="Doesn't contain your email username"
            />
            <ValidationIndicator
              isValid={passwordValidation.noSpaceStartEnd}
              text="Doesn't start or end with a space"
            />
            <ValidationIndicator
              isValid={passwordValidation.minLength}
              text="Contains at least 10 characters"
            />
            <ValidationIndicator
              isValid={passwordValidation.hasUpperLowerSymbol}
              text="Contains at least 1 uppercase, 1 lowercase, and 1 symbol"
            />
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

          {/* Terms Text */}
          <p className="text-xs text-gray-500 mb-4">
            By tapping &quot;Create account&quot; or &quot;Continue with Google, Facebook or Apple,&quot; you agree to
            DashDoor&apos;s{' '}
            <button type="button" className="underline hover:text-gray-700">
              Terms and Conditions
            </button>{' '}
            and{' '}
            <button type="button" className="underline hover:text-gray-700">
              Privacy Policy
            </button>
            .
          </p>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-[#eb1700] hover:bg-[#c41400] text-white font-bold py-3 px-4 rounded-full
              transition-colors duration-200 text-sm"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

