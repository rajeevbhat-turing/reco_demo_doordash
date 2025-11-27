'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignIn from '@/components/authentication/sign-in';
import { useAppStore } from '@/store/app-store';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const routeBeforeAuth = useAppStore(state => state.routeBeforeAuth);
  const setRouteBeforeAuth = useAppStore(state => state.setRouteBeforeAuth);
  const [signInFormState, setSignInFormState] = useState<{
    currentForm: 'email' | 'password' | 'otp';
    foundUser: any;
  }>({ currentForm: 'email', foundUser: null });

  const handleAuthSuccess = () => {
    if (routeBeforeAuth) {
      router.replace(routeBeforeAuth);
      // Delay clearing the saved path to ensure navigation completes
      setTimeout(() => {
        setRouteBeforeAuth(null);
      }, 500);
    } else {
      router.push('/home');
    }
  };

  const handleSetMode = (newMode: 'signin' | 'signup' | 'forgot-password', email?: string) => {
    if (newMode === 'forgot-password') {
      // Navigate to password reset page with email if provided
      if (email) {
        router.push(`/auth/user/password/reset?email=${encodeURIComponent(email)}`);
      } else {
        router.push('/auth/user/password/reset');
      }
    } else if (newMode === 'signin') {
      setMode('signin');
    } else if (newMode === 'signup') {
      router.replace('/auth/user/signup');
    }
  };

  return (
    <div className="bg-white flex flex-col items-center pt-[52px] w-full">
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
          Sign in to access your credits and discounts
        </span>
      </div>

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="mt-3">
          <h2 className="text-2xl font-bold text-[#191919ff] text-center">
            {signInFormState.currentForm === 'email'
              ? 'Login with email'
              : signInFormState.currentForm === 'otp'
              ? 'Verify code'
              : signInFormState.foundUser
              ? `Welcome back, ${signInFormState.foundUser.name?.split(' ')[0] || 'User'}`
              : 'Login with email'}
          </h2>
        </div>

        {/* Toggle Buttons */}
        <div className="mt-8 mb-4 flex justify-center">
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
              onClick={() => router.push('/auth/user/signup')}
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

        {/* Sign In Form */}
        <div className="pb-6">
          <SignIn
            onSuccess={handleAuthSuccess}
            setMode={handleSetMode}
            style={{ continueButton: 'py-6 text-base mt-6' }}
            onFormStateChange={setSignInFormState}
          />
        </div>
      </div>
    </div>
  );
}
