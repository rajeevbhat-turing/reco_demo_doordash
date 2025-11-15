'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { VerificationIcon } from '@/lib/utils/icons';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (
    enteredOtp: string,
    generatedOtp: string,
    setOtpError: (error: string) => void,
    setAttemptsLeft: (attempts: number) => void,
    attemptsLeft: number,
    setShowTooManyAttempts: (show: boolean) => void
  ) => void;
  phoneNumber: string;
  countryCode: string;
  generatedOTP: string;
  containerClassName?: string;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  phoneNumber,
  countryCode,
  generatedOTP,
  containerClassName = '',
}: OTPVerificationModalProps) {
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [showTooManyAttempts, setShowTooManyAttempts] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Starts the resend timer countdown
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handles resend OTP functionality
  const handleResendOTP = () => {
    if (resendTimer === 0) {
      // Generate new OTP (this would be handled by parent)
      startResendTimer();
    }
  };

  // Verifies the entered OTP against the generated OTP
  const handleOTPVerification = () => {
    onVerify(
      otpInput,
      generatedOTP,
      setOtpError,
      setAttemptsLeft,
      attemptsLeft,
      setShowTooManyAttempts
    );
  };

  // Handles Get Help button click - closes OTP modal
  const handleGetHelp = () => {
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpInput('');
      setOtpError('');
      setAttemptsLeft(5);
      setShowTooManyAttempts(false);
      startResendTimer();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute inset-0 z-[100] flex items-center justify-center ${containerClassName}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 pt-6">
        {/* Header */}
        <div className="text-center mt-5 mb-4 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-red-600">
            <VerificationIcon />
          </div>
          <h2 className="text-2xl font-bold text-[#191919ff] mb-2">Phone Number Verification</h2>
          {!showTooManyAttempts && (
            <p className="text-[#191919ff] text-[15px] font-medium">
              For your security, we want to make sure it's really you.
            </p>
          )}
        </div>

        {!showTooManyAttempts ? (
          <>
            {/* OTP Input */}
            <div className="mb-4 px-4 mt-4">
              <label className="block text-[15px] font-bold text-[#191919ff] mb-2">
                Enter 6-digit code
              </label>
              <Input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => {
                  setOtpInput(e.target.value.replace(/\D/g, ''));
                  setOtpError(''); // Clear error when user types
                }}
                className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg 
                 focus-visible:border-[#191919ff] text-lg font-medium tracking-widest h-12 px-3 ${
                   otpError ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
              />
            </div>

            {/* Phone Number Info */}
            <div className="mb-6 px-4">
              <p className="text-[#191919ff] text-[15px] font-medium">
                We sent a code to ({countryCode}) {phoneNumber}
              </p>
            </div>

            {/* OTP Error Message */}
            {otpError && (
              <div className="mb-6 px-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#fef6d4' }}>
                  <div className="flex">
                    <div className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: '#a36500' }}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#191919ff]">{otpError}</p>
                      <p className="text-[15px] font-medium text-[#191919ff]">
                        Try entering the code again. For security purposes, you have {attemptsLeft}{' '}
                        attempts left.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resend and Help Links */}
            <div className="mb-[70px] flex items-center space-x-3 text-sm px-4">
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className={`underline font-semibold text-sm ${
                  resendTimer > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#191919ff] hover:text-gray-700'
                }`}
              >
                {resendTimer > 0 ? `Resend Code (${resendTimer})` : 'Resend Code'}
              </button>
              <div
                className="rounded-full"
                style={{ backgroundColor: '#191919ff', width: '3px', height: '3px' }}
              ></div>
              <button
                onClick={() => {}}
                className="underline font-semibold text-sm text-[#191919ff] hover:text-gray-700"
              >
                Receive a code via call
              </button>
              <div
                className="rounded-full"
                style={{ backgroundColor: '#191919ff', width: '3px', height: '3px' }}
              ></div>
              <button
                onClick={() => {}}
                className="underline font-semibold text-sm text-[#191919ff] hover:text-gray-700"
              >
                Get Help
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 border-t border-gray-200 p-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 text-[#242424ff] hover:bg-gray-50 transition-colors text-[18px] font-bold"
                style={{ backgroundColor: '#f1f1f1ff', borderRadius: '28px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleOTPVerification}
                className={`flex-1 py-3 px-4 hover:bg-gray-50 transition-colors text-[18px] font-bold ${
                  otpInput.trim() !== ''
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={otpInput.trim() === ''}
                style={{ borderRadius: '28px' }}
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Too Many Attempts Message */}
            <div className="mb-8 px-4 text-center">
              <p className="text-[#191919ff] text-[15px] font-medium">
                Too many invalid attempts have been made. Please wait 30 minutes and try again or
                use a new number.
              </p>
            </div>

            {/* Separator Line */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Get Help Button */}
            <div className="px-4 pb-4">
              <button
                onClick={handleGetHelp}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-[16px] rounded-lg transition-colors"
                style={{ borderRadius: '28px' }}
              >
                Get Help
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
