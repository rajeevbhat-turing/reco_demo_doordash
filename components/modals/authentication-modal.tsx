'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import countryData from '@/lib/utils/countryCode.json';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';
import OTPVerificationModal from './otp-verification-modal';
import CountryCodeDropdown from './country-code-dropdown';
import SignIn from '../authentication/sign-in';
import SignUp from '../authentication/sign-up';
import ForgotPassword from '../authentication/forgot-password';

interface AuthenticationModalProps {
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'forgot-password' | null;
  initialEmail?: string;
}

export default function AuthenticationModal({
  onClose,
  defaultMode = 'signin',
  initialEmail,
}: AuthenticationModalProps) {
  const addUser = useUserStore(state => state.addUser);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | null>(defaultMode);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countryData.find(country => country.code === 'US') || countryData[0]
  );
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [otp, setOtp] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [lastVerifiedUser, setLastVerifiedUser] = useState<User | null>(null);
  const [signUpUser, setSignUpUser] = useState<User | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Closes the modal and resets all data
  const handleClose = useCallback(() => {
    onClose();
    setMode(defaultMode);
    setLastVerifiedUser(null);
    setSignUpUser(null);
    setShowOtpModal(false);
  }, [onClose, defaultMode]);

  // Disable body scroll and limit height when modal is open
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (defaultMode) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [defaultMode, handleClose]);

  // Detect user's country on component mount
  useEffect(() => {
    const detectUserCountry = () => {
      try {
        // Method 1: Try to get country from browser's Intl API
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

        // Method 2: Try to get country from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone) {
          // Extract country from timezone (e.g., "America/New_York" -> "US")
          const timezoneCountry = timezone.split('/')[0];
          if (timezoneCountry === 'America') {
            const usaCountry = countryData.find(country => country.code === 'US');
            if (usaCountry) {
              setSelectedCountry(usaCountry);
              return;
            }
          } else if (timezoneCountry === 'Europe') {
            const ukCountry = countryData.find(country => country.code === 'GB');
            if (ukCountry) {
              setSelectedCountry(ukCountry);
              return;
            }
          }
        }
      } catch (_error) {
        // Could not detect user country from browser, using default (USA)
      }

      // Fallback to USA if detection fails
      const usaCountry = countryData.find(country => country.code === 'US');
      if (usaCountry) {
        setSelectedCountry(usaCountry);
      }
    };

    detectUserCountry();
  }, []);

  // Handle scroll detection for showing fixed header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const modalContainer = headerRef.current.closest('.modal-container');
        if (modalContainer) {
          const containerRect = modalContainer.getBoundingClientRect();
          // Show fixed header when original header is out of view
          setShowFixedHeader(headerRect.bottom < containerRect.top + 10);
        }
      }
    };

    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
      modalContainer.addEventListener('scroll', handleScroll);
      return () => modalContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Generates a 6-digit OTP and saves it to state
  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    console.log('Generated OTP:', newOtp);
    return newOtp;
  };

  // Handle user creation
  const handleUserCreation = useCallback(
    (user: User) => {
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
      handleClose();
    },
    [addUser, handleClose]
  );

  // Handles OTP verification from the OTP modal
  const handleOTPVerification = useCallback(
    (
      enteredOtp: string,
      generatedOtp: string,
      setOtpError: (error: string) => void,
      setAttemptsLeft: (attempts: number) => void,
      attemptsLeft: number,
      setShowTooManyAttempts: (show: boolean) => void
    ) => {
      // Accept any 6-digit OTP for development/testing
      if (enteredOtp.length === 6) {
        // OTP is correct - check if sign up user exists
        if (signUpUser) {
          // Set last verified user
          setLastVerifiedUser({ ...signUpUser });

          // Check password length from sign up user
          if (signUpUser.password.length < 10) {
            // Password too short - show error in auth modal
            setShowOtpModal(false);
            return;
          }

          // Password is valid - create user and close modal
          handleUserCreation(signUpUser);
          return;
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
    },
    [signUpUser, handleUserCreation]
  );

  // Handles successful authentication
  const handleAuthSuccess = () => {
    handleClose();
  };

  // Handles showing OTP modal
  const handleShowOTP = (user: User) => {
    setSignUpUser(user);

    // If user is already verified and last verified user's phone number and country code hasn't changed
    // and password is at least 10 characters then create user
    if (
      lastVerifiedUser &&
      lastVerifiedUser.phoneNumber === user.phoneNumber &&
      lastVerifiedUser.country.code === user.country.code &&
      user.password.length >= 10
    ) {
      handleUserCreation(user);
      return;
    }
    generateOTP();
    setShowOtpModal(true);
  };

  // Handles mode changes with optional email parameter
  const handleSetMode = (newMode: 'signin' | 'signup' | 'forgot-password', email?: string) => {
    setMode(newMode);
    if (newMode === 'forgot-password' && email) {
      setForgotPasswordEmail(email);
    }
  };

  if (!defaultMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        data-testid="authentication-modal-backdrop"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 h-[90vh] overflow-hidden"
      >
        {/* Fixed Header - appears when original header is out of view */}
        {showFixedHeader && (
          <div className="absolute top-0 left-0 right-0 z-30 bg-white border-b border-gray-300 p-4 rounded-t-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="text-[#191919ff] hover:bg-gray-100 rounded-full p-2 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-bold text-[#191919ff]">Sign in or Sign up</h2>
            </div>
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto h-[90vh] px-4 pb-4 modal-container">
          {/* Original Header */}
          <div ref={headerRef} className="mt-4">
            <button
              onClick={handleClose}
              className="text-[#191919ff] hover:bg-gray-100 rounded-full p-2 transition-colors ml-[-8px]"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-[32px] font-bold text-[#191919ff]">Sign in or Sign up</h2>
          </div>

          {/* Info Banner */}
          {mode === 'signin' && (
            <div className="mt-3 p-2 flex items-center justify-center mx-[-16px] bg-[#ecfcfc]">
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
                Sign in to access your credits and discounts
              </span>
            </div>
          )}

          {/* Toggle Buttons - Hidden for forgot-password mode */}
          {mode !== 'forgot-password' && (
            <div className="mt-12 mb-4 flex justify-center">
              <div className="flex bg-gray-100 rounded-2xl">
                <button
                  onClick={() => setMode('signin')}
                  className={`py-1.5 px-3 rounded-2xl text-sm font-bold transition-colors ${
                    mode === 'signin'
                      ? 'bg-gray-900 text-white'
                      : 'text-[#191919ff] hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`py-1.5 px-3 rounded-2xl text-sm font-bold transition-colors ${
                    mode === 'signup'
                      ? 'bg-gray-900 text-white'
                      : 'text-[#191919ff] hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Authentication Forms */}
          <div className="pb-6">
            {mode === 'signin' ? (
              <SignIn
                onSuccess={handleAuthSuccess}
                setMode={handleSetMode}
                initialEmail={initialEmail}
              />
            ) : mode === 'signup' ? (
              <SignUp
                onShowOTP={handleShowOTP}
                selectedCountry={selectedCountry}
                setShowCountryDropdown={setShowCountryDropdown}
              />
            ) : (
              <ForgotPassword
                onBackToSignIn={() => setMode('signin')}
                email={forgotPasswordEmail}
                setMode={handleSetMode}
              />
            )}
          </div>
        </div>

        {/* Country Code Dropdown */}
        <CountryCodeDropdown
          isOpen={showCountryDropdown}
          onClose={() => setShowCountryDropdown(false)}
          onSelect={setSelectedCountry}
          selectedCountry={selectedCountry}
          userCountry={selectedCountry}
        />

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
    </div>
  );
}
