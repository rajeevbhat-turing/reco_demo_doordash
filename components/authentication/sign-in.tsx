'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/use-auth';
import { useUserStore } from '@/store/user-store';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import { User, Address } from '@/lib/types/user-types';

interface SignInProps {
  onSuccess: () => void;
  setMode: (mode: 'signin' | 'signup' | 'forgot-password', email?: string) => void;
  initialEmail?: string;
  style?: any;
  onFormStateChange?: (formState: {
    currentForm: 'email' | 'password' | 'otp';
    foundUser: any;
  }) => void;
}

export default function SignIn({
  onSuccess,
  setMode,
  initialEmail,
  style,
  onFormStateChange,
}: SignInProps) {
  const { login, generateOTP, isLoading, isGeneratingOTP } = useAuth();
  const getTempAddress = useUserStore(state => state.getTempAddress);
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    otp: '',
    otpInputs: ['', '', '', '', '', ''],
    password: '',
    showPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentForm, setCurrentForm] = useState<'email' | 'password' | 'otp'>('email');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [resendTimer, setResendTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Updating the email field when the initialEmail prop changes
  useEffect(() => {
    if (initialEmail) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  // Notify parent of form state changes
  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange({ currentForm, foundUser });
    }
  }, [currentForm, foundUser, onFormStateChange]);

  // Clearing the interval when the component unmounts
  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    []
  );

  // Updates form data and validates on change
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  // Validates email and returns true if valid, false otherwise
  const validateEmail = () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!isValidEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return false;
    }
    return true;
  };

  // Starts the resend timer countdown
  const startResendTimer = () => {
    setResendTimer(30);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handles resend OTP functionality
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      const { otp, user } = await generateOTP({ email: formData.email });
      // Print the OTP to the console
      console.log('OTP:', otp);

      // Save the OTP to the form data
      handleFormDataChange('otp', otp);

      setFoundUser(user);
      startResendTimer();
      setErrors({});
    } catch (error: any) {
      setErrors({
        general: error.message || 'Failed to resend OTP. Please try again.',
      });
    }
  };

  // Handles email form submission - checks if email exists and generates OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }

    try {
      // Call generate OTP API
      const { otp, user } = await generateOTP({ email: formData.email });

      // Print the OTP to the console
      console.log('OTP:', otp);

      // Save the OTP to the form data
      handleFormDataChange('otp', otp);

      setFoundUser(user);
      setCurrentForm('otp');
      setErrors({});

      // Start the resend timer
      startResendTimer();
    } catch (error: any) {
      // Email not found or other error
      setErrors({
        general: error.message || 'Something went wrong. Please try again.',
      });
    }
  };

  // Handles OTP input change
  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 1) return; // Only allow single digit

    const newOtpInputs = [...formData.otpInputs];
    newOtpInputs[index] = numericValue;
    handleFormDataChange('otpInputs', newOtpInputs);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
    // Clear OTP error when user types
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  // Handles OTP input keydown (for backspace and number validation)
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Allow: backspace, delete, tab, escape, enter, and arrow keys
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
      ].includes(e.key)
    ) {
      // Allow these keys
    } else if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
      // Block non-numeric characters
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      const newOtpInputs = [...formData.otpInputs];

      if (newOtpInputs[index]) {
        // If current box has value, clear it
        newOtpInputs[index] = '';
        handleFormDataChange('otpInputs', newOtpInputs);
      } else if (index > 0) {
        // If current box is empty, go to previous box and clear it
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          newOtpInputs[index - 1] = '';
          handleFormDataChange('otpInputs', newOtpInputs);
          (prevInput as HTMLInputElement).focus();
        }
      }
    }
  };

  // Handles OTP form submission
  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = formData.otpInputs.join('');

    // Accept any 6-digit OTP for development/testing
    if (enteredOtp.length === 6) {
      // OTP is correct - sign in the user
      if (!foundUser) {
        setErrors({ general: 'User not found' });
        return;
      }

      // Get temp address before processing
      const tempAddress = getTempAddress();
      const state = useUserStore.getState();

      // If no tempAddress, just set currentUser without modifying users array
      if (!tempAddress) {
        useUserStore.setState({
          currentUser: foundUser,
          isInitialized: true,
        });
        setErrors({}); // Clear any existing errors
        onSuccess();
        return;
      }

      // Prepare updated user data with temp address handled
      let updatedUserData: User = { ...foundUser };

      // Check if temp address already exists in user's addresses
      // Compare by street, city, state, and zipCode
      const existingAddress = foundUser.addresses?.find(
        (addr: Address) =>
          addr.street === tempAddress.street &&
          addr.city === tempAddress.city &&
          addr.state === tempAddress.state &&
          addr.zipCode === tempAddress.zipCode
      );

      if (existingAddress) {
        // Address already exists, set it as default in the user data
        updatedUserData = {
          ...foundUser,
          addresses:
            foundUser.addresses?.map((addr: Address) => ({
              ...addr,
              default: addr.id === existingAddress.id,
            })) || [],
        };
        console.log('✅ Temp address already exists, set as default');
      } else {
        // Address doesn't exist, add it and set as default
        const { id, ...addressWithoutId } = tempAddress;
        const newAddressId = Math.random().toString(36).substring(2, 15);
        const newAddress: Address = {
          ...addressWithoutId,
          id: newAddressId,
          default: true,
        };

        // Set all existing addresses to default: false, add new address
        updatedUserData = {
          ...foundUser,
          addresses: [
            ...(foundUser.addresses || []).map((addr: Address) => ({ ...addr, default: false })),
            newAddress,
          ],
        };
        console.log('✅ Temp address added to user and set as default');
      }

      // Update users array in store (only when tempAddress exists)
      const userExists = state.users.some(u => u.id === updatedUserData.id);
      const updatedUsers = userExists
        ? state.users.map(user => (user.id === updatedUserData.id ? updatedUserData : user))
        : [...state.users, updatedUserData];

      // Set both users array and current user atomically
      useUserStore.setState({
        users: updatedUsers,
        currentUser: updatedUserData,
        tempAddress: null, // Clear temp address
        changePasswordPhoneVerified: state.changePasswordPhoneVerified,
        isInitialized: true,
      });

      setErrors({}); // Clear any existing errors
      onSuccess();
    } else {
      // OTP is incorrect - decrement attempts and show error
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft <= 0) {
        // No attempts left - show too many attempts message
        setErrors({
          otp: 'Too many invalid attempts have been made. Please wait 30 minutes and try again or use a new number.',
        });
      } else {
        // Show OTP error with remaining attempts
        setErrors({
          otp: `We couldn't verify this 6 digit code. Try again. You have ${newAttemptsLeft} more tries`,
        });
      }
    }
  };

  // Handles going back to email form
  const handleBackToEmail = () => {
    setCurrentForm('email');
    handleFormDataChange('password', '');
    handleFormDataChange('showPassword', false);
    setErrors({});
  };

  // Handles password form submission with database authentication
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      // Call database login
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Login successful - stored in user-store automatically
      setErrors({});
      onSuccess();
    } catch (error: any) {
      // Login failed - show error
      setErrors({
        general: error.message || 'Invalid email or password. Please try again.',
      });
    }
  };

  // Handles switching to password form
  const handleUsePasswordInstead = () => {
    setCurrentForm('password');
  };

  if (currentForm === 'password') {
    return (
      <form onSubmit={handlePasswordSubmit} className="pb-6 pt-2 px-2">
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
              onChange={e => {
                handleFormDataChange('password', e.target.value);
                // Clear errors when user starts typing
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
                if (errors.general) {
                  setErrors(prev => ({ ...prev, general: '' }));
                }
              }}
              autoFocus
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

        {/* Reset Password Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMode('forgot-password', formData.email)}
            className="text-[#191919ff] font-semibold text-sm underline hover:opacity-80 transition-colors"
          >
            Reset Password
          </button>
        </div>

        {/* Password Instruction */}
        <p className="text-[13px] font-medium text-[#191919ff] mb-3 text-center">
          Enter your password to finish logging into your account with {formData.email}{' '}
          <button
            type="button"
            onClick={handleBackToEmail}
            className="font-bold text-[#191919ff] underline hover:opacity-80 transition-colors"
          >
            (Switch)
          </button>
        </p>

        {/* General Password Error Message */}
        {errors.general && (
          <div className="p-3 rounded-xl mb-4 bg-[#fef6d4]">
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
                <p className="text-[16px] font-bold text-[#191919ff]">{errors.general}</p>
                <p className="text-[15px] font-medium text-[#191919ff] mt-1">
                  Please check your password and try again, or reset your password.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] py-3 rounded-3xl mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    );
  }

  if (currentForm === 'otp') {
    return (
      <form onSubmit={handleOTPSubmit} className="pb-6 pt-2 px-2">
        {/* OTP Instruction */}
        <p className="text-sm font-medium text-gray-600 mb-2 text-center">
          Enter the 6 digit code sent to{' '}
          <span className="font-bold text-[#191919ff]">
            {foundUser?.country.dialCode}
            {foundUser?.phoneNumber.replace(foundUser?.country.dialCode, '')}
          </span>{' '}
          and <span className="font-bold text-[#191919ff]">{foundUser?.email}</span>{' '}
          <button
            type="button"
            onClick={handleBackToEmail}
            className="font-bold text-[#191919ff] underline hover:opacity-80 transition-colors"
          >
            (Switch Account?)
          </button>
          . This code will expire in 30 mins.
        </p>

        {/* OTP Input Fields */}
        <div className="flex gap-3 mb-2 mt-2">
          {formData.otpInputs.map((value, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={value}
              onChange={e => handleOTPChange(index, e.target.value)}
              onKeyDown={e => handleOTPKeyDown(index, e)}
              autoFocus={index === 0}
              className={`w-12 h-12 text-center text-lg font-bold border-2 border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 
              rounded-lg focus-visible:border-[#191919ff] ${
                errors.otp ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
              }`}
            />
          ))}
        </div>

        {/* OTP Error Message - displayed below inputs like email field errors */}
        {errors.otp && (
          <div className="flex text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-[13px] font-semibold">{errors.otp}</span>
          </div>
        )}

        {/* Help Options */}
        <div className="mb-6 mt-4">
          <p className="text-sm text-[#191919ff] font-bold mb-2">Didn't get it?</p>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0}
              className={`underline font-semibold text-sm ${
                resendTimer > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#191919ff] hover:text-gray-700'
              }`}
            >
              {resendTimer > 0 ? `Resend code (${resendTimer})` : 'Resend code'}
            </button>
            <div className="rounded-full bg-[#191919ff] w-[3px] h-[3px]"></div>
          </div>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] py-3 rounded-3xl mb-2"
        >
          Sign In
        </Button>

        {/* Use Password Instead Link */}
        <button
          type="button"
          onClick={handleUsePasswordInstead}
          className="text-[#191919ff] font-semibold text-[15px] hover:bg-gray-100 w-full text-center py-2 rounded-3xl"
        >
          Use password instead
        </button>
      </form>
    );
  }

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

      {/* General Error Message */}
      {errors.general && (
        <div className="p-3 rounded-xl bg-[#fef6d4]">
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
              <p className="text-[16px] font-bold text-[#191919ff] text-center">Incorrect email</p>
              <p className="text-[15px] font-medium text-[#191919ff]">{errors.general}</p>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="mt-2 px-4 py-2 rounded-[24px] text-[#191919ff] 
                font-bold text-sm hover:bg-gray-50 transition-colors bg-white shadow-md"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue to Sign In Button */}
      <Button
        type="submit"
        disabled={isGeneratingOTP}
        className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] py-3 rounded-3xl mt-4 disabled:opacity-50 
          disabled:cursor-not-allowed ${style?.continueButton ?? ''}`}
      >
        Continue to Sign In
      </Button>

      {/* Legal Text */}
      <p className="text-sm font-medium text-[#606060ff] mt-4 mb-4">
        By tapping any "Continue" button, you agree to DashDoor's , including a waiver of your jury
        trial right, and Privacy Policy. We may text you a verification code. Msg & data rates
        apply.
      </p>
    </form>
  );
}
