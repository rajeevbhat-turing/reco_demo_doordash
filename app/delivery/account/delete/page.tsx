'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

export default function DeliveryDeleteAccountPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const logout = useDeliveryPartnerStore(state => state.logout);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());

  const [showVerificationModal, setShowVerificationModal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [showDeletionPage, setShowDeletionPage] = useState(false);
  
  // Verification modal state
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [showTooManyAttempts, setShowTooManyAttempts] = useState(false);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0 && showVerificationModal) {
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

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [showVerificationModal, resendTimer]);

  // Handle code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (codeError) setCodeError('');
  };

  // Handle verification submit
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Accept any 6-digit code for this simulation
    if (code.length !== 6) {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft <= 0) {
        setShowTooManyAttempts(true);
        setCodeError('');
      } else {
        setCodeError(
          `Invalid or incorrect code. You have ${newAttemptsLeft} attempts left.`
        );
      }
      return;
    }

    setShowVerificationModal(false);
    setIsVerified(true);
  };

  // Handle resend code
  const handleResendCode = () => {
    if (resendTimer > 0) return;
    setCode('');
    setCodeError('');
    setResendTimer(30);
  };

  // Close verification modal
  const handleCloseVerification = useCallback(() => {
    router.push('/delivery/account');
  }, [router]);

  // Handle continue to confirmation
  const handleContinue = () => {
    setShowConfirmPage(true);
  };

  // Handle final account deletion
  const handleDeleteAccount = () => {
    setShowDeletionPage(true);

    // Remove partner from store
    const partnerStore = localStorage.getItem('delivery-partner-store');
    if (partnerStore && currentPartner) {
      const parsedStore = JSON.parse(partnerStore);
      const newStore = {
        ...parsedStore,
        state: {
          ...parsedStore.state,
          partners: parsedStore.state.partners.filter(
            (partner: any) => partner.id !== currentPartner.id
          ),
          currentPartner: null,
        },
      };
      localStorage.setItem('delivery-partner-store', JSON.stringify(newStore));
    }

    // After 3 seconds, logout and navigate
    timeoutRef.current = setTimeout(() => {
      logout();
      router.push('/delivery/sign-in');
    }, 3000);
  };

  // Get masked phone number
  const getMaskedPhone = () => {
    if (!currentPartner?.phoneNumber) return '******1234';
    const phone = currentPartner.phoneNumber;
    const dialCode = currentPartner.country?.dialCode || '+1';
    return `${dialCode} ******${phone.slice(-4)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      {/* 2-Step Verification Modal */}
      {showVerificationModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 pt-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseVerification}
              className="absolute top-4 left-4 text-gray-700 hover:text-gray-900 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mt-5 mb-4 px-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#4561ED]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#4561ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">2-Step Verification</h2>
              {!showTooManyAttempts && (
                <p className="text-gray-600 text-sm">
                  For your security, we want to make sure it&apos;s really you.
                </p>
              )}
            </div>

            {!showTooManyAttempts ? (
              <>
                {/* Code Input */}
                <div className="mb-4 px-4 mt-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Enter 6-digit code
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-lg font-medium tracking-widest h-12 px-3 ${
                      codeError ? 'border-red-500 bg-red-50' : 'border-transparent bg-gray-100 focus-visible:border-[#4561ED]'
                    }`}
                  />
                </div>

                {/* Phone Info */}
                <div className="mb-4 px-4">
                  <p className="text-gray-600 text-sm">
                    We sent a code to {getMaskedPhone()}
                  </p>
                </div>

                {/* Error Message */}
                {codeError && (
                  <div className="mb-4 px-4">
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-800">{codeError}</p>
                    </div>
                  </div>
                )}

                {/* Resend Link */}
                <div className="mb-8 px-4">
                  <button
                    onClick={handleResendCode}
                    disabled={resendTimer > 0}
                    className={`text-sm font-medium underline ${
                      resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer})` : 'Resend Code'}
                  </button>
                </div>

                {/* Submit Button */}
                <div className="border-t border-gray-200 p-4">
                  <button
                    onClick={handleVerificationSubmit}
                    disabled={code.length !== 6}
                    className={`w-full py-3 px-4 font-bold rounded-full transition-colors ${
                      code.length === 6
                        ? 'bg-[#4561ED] hover:bg-[#3651d4] text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 pb-6">
                <p className="text-gray-600 text-sm text-center mb-4">
                  Too many attempts have been made. Please wait 30 minutes before trying again.
                </p>
                <button
                  onClick={handleCloseVerification}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consequences Page */}
      {isVerified && !showConfirmPage && !showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              What happens when you delete your account?
            </h1>
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-4">
                Your driver account and all associated data will be permanently removed from DashDoor Driver.
              </p>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Your delivery history will be deleted</li>
                <li>• Your earnings records will be removed</li>
                <li>• Your ratings and reviews will be erased</li>
                <li>• Any pending payouts will be processed before deletion</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/delivery/account')}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Page */}
      {isVerified && showConfirmPage && !showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm account deletion
            </h1>
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to delete your driver account from DashDoor?
              </p>
              <p className="text-red-600 text-sm font-medium">
                This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/delivery/account')}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion In Progress Page */}
      {isVerified && showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your account is being deleted
              </h1>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                You will be automatically logged out. Your account will be deleted in the next few minutes.
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Your data will also be deleted within 30 days.
              </p>
              <p className="text-gray-400 text-xs">
                Note: We may retain some information when permitted by law.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

