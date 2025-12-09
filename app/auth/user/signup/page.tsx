'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SignUp from '@/components/authentication/sign-up';
import OTPVerificationModal from '@/components/modals/otp-verification-modal';
import { useUserStore } from '@/store/user-store';
import { useAppStore } from '@/store/app-store';
import { User } from '@/lib/types/user-types';
import countryData from '@/lib/utils/countryCode.json';

export default function SignUpPage() {
  const router = useRouter();
  const addUser = useUserStore(state => state.addUser);
  const routeBeforeAuth = useAppStore(state => state.routeBeforeAuth);
  const setRouteBeforeAuth = useAppStore(state => state.setRouteBeforeAuth);
  const [selectedCountry, setSelectedCountry] = useState(
    countryData.find(country => country.code === 'US') || countryData[0]
  );
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [signUpUser, setSignUpUser] = useState<User | null>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySelectRef = useRef<HTMLDivElement>(null);
  const countryButtonRef = useRef<HTMLButtonElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

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
      } catch (_error) {
        // Fallback to USA
      }
      const usaCountry = countryData.find(country => country.code === 'US');
      if (usaCountry) {
        setSelectedCountry(usaCountry);
      }
    };
    detectUserCountry();
  }, []);

  // Handle country button ref callback
  const handleCountryButtonRef = (element: HTMLButtonElement | null) => {
    countryButtonRef.current = element;
  };

  // Position dropdown callback ref
  const handleDropdownRef = (element: HTMLDivElement | null) => {
    countryDropdownRef.current = element;
    if (element && countryButtonRef.current && showCountryDropdown) {
      positionDropdown(element);
    }
  };

  // Function to position dropdown
  const positionDropdown = (dropdownElement: HTMLDivElement) => {
    if (!countryButtonRef.current) return;

    const buttonRect = countryButtonRef.current.getBoundingClientRect();
    const dropdownRect = dropdownElement.getBoundingClientRect();
    const dropdownHeight = dropdownRect.height || dropdownElement.offsetHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    dropdownElement.style.position = 'fixed';

    // If scrolled more than 100px, display dropdown downwards, otherwise upwards
    if (scrollY > 100) {
      dropdownElement.style.top = `${buttonRect.bottom + 4}px`;
    } else {
      dropdownElement.style.top = `${buttonRect.top - dropdownHeight - 4}px`;
    }

    dropdownElement.style.left = `${buttonRect.left}px`;
    dropdownElement.style.width = `${Math.min(window.innerWidth, 380)}px`;
    dropdownElement.style.minWidth = `${Math.min(window.innerWidth, 380)}px`;
    dropdownElement.style.transform = 'none';
    dropdownElement.style.margin = '0';
  };

  // Filter countries based on search term
  const filteredCountries = countryData.filter(
    country =>
      country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
      country.dial_code.includes(countrySearchTerm) ||
      country.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // Sort countries: selected first, then United States (if not selected), then alphabetically
  const sortedCountries = [...filteredCountries].sort((a, b) => {
    // Selected country always first
    if (a.code === selectedCountry.code) return -1;
    if (b.code === selectedCountry.code) return 1;

    // United States second (if not selected)
    if (selectedCountry.code !== 'US') {
      if (a.code === 'US') return -1;
      if (b.code === 'US') return 1;
    }

    // Rest alphabetically
    return a.name.localeCompare(b.name);
  });

  // Update position when dropdown content changes or on scroll/resize
  useEffect(() => {
    if (!showCountryDropdown || !countryDropdownRef.current) {
      setCountrySearchTerm('');
      return;
    }

    const updatePosition = () => {
      if (countryDropdownRef.current) {
        positionDropdown(countryDropdownRef.current);
      }
    };

    // Update position after content changes
    const timeoutId = setTimeout(updatePosition, 0);

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Use ResizeObserver to update when dropdown height changes
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    if (countryDropdownRef.current) {
      resizeObserver.observe(countryDropdownRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      resizeObserver.disconnect();
    };
  }, [showCountryDropdown, countrySearchTerm, sortedCountries.length]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        countrySelectRef.current &&
        !countrySelectRef.current.contains(target) &&
        !target.closest('button[type="button"]') &&
        !target.closest('input[id="mobileNumber"]') &&
        countryButtonRef.current &&
        !countryButtonRef.current.contains(target)
      ) {
        setShowCountryDropdown(false);
        setCountrySearchTerm('');
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    []
  );

  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    return newOtp;
  };

  const handleUserCreation = (user: User) => {
    const newUser = {
      id: `user-${Date.now().toString()}`,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
      country: user.country,
      userCountry: user.userCountry,
      avatar: null,
      paymentMethods: [],
      addresses: [],
      is_restricted: false,
      reviews: [],
    };

    addUser(newUser, true);
    setSignUpUser(null);

    // Checking if there is a route before authentication
    if (routeBeforeAuth) {
      // Redirecting to the route before authentication
      router.replace(routeBeforeAuth);
      // Delay clearing the saved path to ensure navigation completes
      timeoutRef.current = setTimeout(() => {
        setRouteBeforeAuth(null);
      }, 500);
    } else {
      router.push('/home');
    }
  };

  const handleOTPVerification = (
    enteredOtp: string,
    generatedOtp: string,
    setOtpError: (error: string) => void,
    setAttemptsLeft: (attempts: number) => void,
    attemptsLeft: number,
    setShowTooManyAttempts: (show: boolean) => void
  ) => {
    if (enteredOtp.length === 6) {
      if (signUpUser) {
        if (signUpUser.password.length < 10) {
          setShowOtpModal(false);
          return;
        }
        handleUserCreation(signUpUser);
        return;
      }
    } else {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);
      setOtpError('Invalid or incorrect code');

      if (newAttemptsLeft <= 0) {
        setShowTooManyAttempts(true);
      }
    }
  };

  const handleShowOTP = (user: User) => {
    setSignUpUser(user);
    generateOTP();
    setShowOtpModal(true);
  };

  return (
    <div className="bg-white flex flex-col items-center pt-[52px] w-full min-h-screen">
      {/* Info Banner */}
      <div className="mt-3 p-2 flex items-center justify-center bg-[#ecfcfc] mb-4 w-full">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.5 5C13.9465 5 14.3389 5.29598 14.4615 5.72528L14.5002 5.86069C15.1122 8.00263 15.3693 8.86307 15.8273 9.55825C16.2504 10.2003 16.7997 10.7496 17.4418 11.1727C18.1369 11.6307 18.9974 11.8878 21.1393 12.4998L21.2747 12.5385C21.704 12.6611 22 13.0535 22 13.5C22 13.9465 21.704 14.3389 21.2747 14.4615L21.1393 14.5002C18.9974 15.1122 18.1369 15.3693 17.4418 15.8273C16.7997 16.2504 16.2504 16.7997 15.8273 17.4418C15.3693 18.1369 15.1122 18.9974 14.5002 21.1393L14.4615 21.2747C14.3389 21.704 13.9465 22 13.5 22C13.0535 22 12.6611 21.704 12.5385 21.2747L12.4998 21.1393C11.8878 18.9974 11.6307 18.1369 11.1727 17.4418C10.7496 16.7997 10.2003 16.2504 9.55825 15.8273C8.86307 15.3693 8.00263 15.1122 5.86069 14.5002L5.72528 14.4615C5.29598 14.3389 5 13.9465 5 13.5C5 13.0535 5.29598 12.6611 5.72528 12.5385L5.86069 12.4998C8.00263 11.8878 8.86307 11.6307 9.55825 11.1727C10.2003 10.7496 10.7496 10.2003 11.1727 9.55825C11.6307 8.86307 11.8878 8.00263 12.4998 5.86069L12.5385 5.72528C12.6611 5.29598 13.0535 5 13.5 5ZM13.5 9.3605C13.3082 9.84672 13.1 10.2681 12.8428 10.6586C12.2704 11.5273 11.5273 12.2704 10.6586 12.8428C10.2681 13.1 9.84671 13.3082 9.3605 13.5C9.84671 13.6918 10.2681 13.9 10.6586 14.1572C11.5273 14.7296 12.2704 15.4727 12.8428 16.3414C13.1 16.7319 13.3082 17.1533 13.5 17.6395C13.6918 17.1533 13.9 16.7319 14.1572 16.3414C14.7296 15.4727 15.4727 14.7296 16.3414 14.1572C16.7319 13.9 17.1533 13.6918 17.6395 13.5C17.1533 13.3082 16.7319 13.1 16.3414 12.8428C15.4727 12.2704 14.7296 11.5273 14.1572 10.6586C13.9 10.2681 13.6918 9.84672 13.5 9.3605Z"
            fill="#00838aff"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.25 3C6.69648 3 7.08887 3.29598 7.21152 3.72528L7.22313 3.7659C7.41918 4.45208 7.46836 4.58464 7.53274 4.68236C7.6074 4.79567 7.70433 4.8926 7.81764 4.96726C7.91536 5.03164 8.04792 5.08082 8.7341 5.27687L8.77472 5.28848C9.20402 5.41113 9.5 5.80352 9.5 6.25C9.5 6.69648 9.20402 7.08887 8.77472 7.21152L8.7341 7.22313C8.04792 7.41918 7.91536 7.46836 7.81764 7.53274C7.70433 7.6074 7.6074 7.70433 7.53274 7.81764C7.46836 7.91536 7.41918 8.04792 7.22313 8.7341L7.21152 8.77472C7.08887 9.20402 6.69648 9.5 6.25 9.5C5.80352 9.5 5.41113 9.20402 5.28848 8.77472L5.27687 8.7341C5.08082 8.04792 5.03164 7.91536 4.96726 7.81764C4.8926 7.70433 4.79567 7.6074 4.68236 7.53274C4.58464 7.46836 4.45208 7.41918 3.7659 7.22313L3.72528 7.21152C3.29598 7.08887 3 6.69648 3 6.25C3 5.80352 3.29598 5.41113 3.72528 5.28848L3.7659 5.27687C4.45208 5.08082 4.58464 5.03164 4.68236 4.96726C4.79567 4.8926 4.8926 4.79567 4.96726 4.68236C5.03164 4.58464 5.08082 4.45208 5.27687 3.7659L5.28848 3.72528C5.41113 3.29598 5.80352 3 6.25 3Z"
            fill="#00838aff"
          ></path>
        </svg>
        <span className="text-sm text-[#191919ff] font-medium ml-2">
          Sign up and get your welcome deals
        </span>
      </div>

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="mt-3">
          <h2 className="text-3xl font-bold text-[#191919ff] text-center">Sign Up</h2>
        </div>

        {/* Sign In Link */}
        <div className="mt-2 mb-4 text-center">
          <span className="text-base font-medium text-[#606060ff]">Already have an account? </span>
          <Link
            href="/auth"
            className="text-base font-bold text-red-600 hover:bg-gray-100 rounded-xl"
          >
            Sign In
          </Link>
        </div>

        {/* Sign Up Form */}
        <div className="pb-6">
          <SignUp
            onShowOTP={handleShowOTP}
            selectedCountry={selectedCountry}
            setShowCountryDropdown={setShowCountryDropdown}
            countryButtonRef={handleCountryButtonRef}
          />
        </div>
      </div>

      {/* Country Code Dropdown - Similar to edit profile */}
      {showCountryDropdown && (
        <div
          ref={countrySelectRef}
          style={{ position: 'fixed', zIndex: 500, pointerEvents: 'none' }}
        >
          <div
            ref={handleDropdownRef}
            className="bg-white border border-gray-200 rounded-md shadow-lg flex flex-col"
            style={{
              position: 'fixed',
              zIndex: 500,
              pointerEvents: 'auto',
            }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <Input
                type="text"
                placeholder={`${selectedCountry.name} ${selectedCountry.dial_code}`}
                value={countrySearchTerm}
                onChange={e => setCountrySearchTerm(e.target.value)}
                className="w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
                focus-visible:border-[#191919ff] rounded-lg bg-[#f7f7f7]"
                autoFocus
              />
            </div>

            {/* Country List */}
            {sortedCountries.length > 0 && (
              <div className="overflow-y-auto max-h-[240px]">
                {sortedCountries.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountryDropdown(false);
                      setCountrySearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center justify-between gap-2 ${
                      selectedCountry.code === country.code ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.emoji}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-[#606060ff]">{country.dial_code}</span>
                    </div>
                    {selectedCountry.code === country.code && (
                      <Check className="h-5 w-5 text-[#191919ff]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOTPVerification}
        phoneNumber={signUpUser?.phoneNumber || ''}
        countryCode={selectedCountry.dial_code}
        generatedOTP={otp}
      />
    </div>
  );
}
