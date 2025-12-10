'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ForgotPassword from '@/components/authentication/forgot-password';

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || undefined;

  // Handles back to sign in button click
  const handleBackToSignIn = () => {
    router.replace('/auth');
  };

  return (
    <div className="bg-white flex flex-col items-center pt-[56px] w-full min-h-screen">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#191919ff] text-center">Forgot Password?</h2>
        </div>

        {/* Forgot Password Form */}
        <ForgotPassword onBackToSignIn={handleBackToSignIn} email={email} />
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white flex flex-col items-center pt-[56px] w-full min-h-screen">
          <div className="max-w-sm w-full">
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#191919ff] text-center">Forgot Password?</h2>
            </div>
          </div>
        </div>
      }
    >
      <PasswordResetContent />
    </Suspense>
  );
}
