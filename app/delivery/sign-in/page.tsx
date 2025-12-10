'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeliverySignIn from '@/components/delivery/authentication/sign-in';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

export default function DeliverySignInPage() {
  const router = useRouter();
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/delivery/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuthSuccess = () => {
    router.push('/delivery/dashboard');
  };

  const handleSetMode = (newMode: 'signin' | 'signup') => {
    if (newMode === 'signup') {
      router.push('/delivery/sign-up');
    } else {
      setMode('signin');
    }
  };

  return (
    <div className="bg-white flex flex-col items-center w-full min-h-screen">
      {/* Info Banner */}
      <div className="p-3 flex items-center justify-center bg-[#ecfcfc] w-full">
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
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 7V9H13V7H11ZM11 11V17H13V11H11ZM4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12Z"
            fill="#00838a"
          />
        </svg>
        <span className="text-sm text-[#191919ff] font-medium ml-2">
          Access your earnings, orders, and account settings
        </span>
      </div>

      <div className="max-w-sm w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#191919ff] text-center">
            Sign In to Your Driver Account
          </h2>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-6 flex justify-center">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setMode('signin')}
              className={`py-2 px-4 rounded-xl text-sm font-bold transition-colors ${
                mode === 'signin'
                  ? 'bg-gray-900 text-white'
                  : 'text-[#191919ff] hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <Link
              href="/delivery/sign-up"
              className={`py-2 px-4 rounded-xl text-sm font-bold transition-colors text-[#191919ff] hover:text-gray-900`}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="pb-6">
          <DeliverySignIn onSuccess={handleAuthSuccess} setMode={handleSetMode} />
        </div>

        {/* Additional Links */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            New to DashDoor Driver?{' '}
            <Link href="/delivery/sign-up" className="text-[#4561ED] font-bold hover:underline">
              Start earning today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

