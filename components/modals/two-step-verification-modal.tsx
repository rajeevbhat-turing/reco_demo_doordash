'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { VerificationIcon } from '@/lib/utils/icons';

interface TwoStepVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumber?: string;
}

export default function TwoStepVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber = '',
}: TwoStepVerificationModalProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const generatedCode = useRef<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [showTooManyAttempts, setShowTooManyAttempts] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Disable body scroll and limit height when modal is open
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
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
  }, [isOpen, onClose]);

  // Handles code input changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);

    // Clear errors when user types
    if (codeError) {
      setCodeError('');
    }
  };

  // Generates a 6-digit verification code
  const generateCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    generatedCode.current = newCode;
    console.log('Generated verification code:', newCode);
    return newCode;
  };

  // Starts the resend timer countdown
  const startResendTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setResendTimer(30);
    intervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify the entered code against generated code
    // For now, we are only checking if the code is 6 digits long.
    // if (code !== generatedCode.current) {
    if (code.length !== 6) {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft <= 0) {
        setShowTooManyAttempts(true);
        setCodeError('');
      } else {
        setCodeError(
          `Invalid or incorrect code. Try entering the code again. For security purposes, you have ${newAttemptsLeft} attempts left.`
        );
      }
      return;
    }

    onSuccess();
  };

  // Handles resend code functionality
  const handleResendCode = () => {
    if (resendTimer > 0) return;

    // Generate new code and start timer
    generateCode();
    startResendTimer();
    setCode('');
    setCodeError('');
  };

  // Handles get help functionality
  // const handleGetHelp = () => {
  //   // Close modal
  //   onClose();
  // };

  // Handles outside click to close modal
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setCodeError('');
      setAttemptsLeft(5);
      setShowTooManyAttempts(false);
      // Generate initial code and start timer
      if (!generatedCode.current) {
        generateCode();
        startResendTimer();
      }
    }
  }, [isOpen]);

  // Cleanup interval on unmount
  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
      onClick={handleOutsideClick}
      data-testid="two-step-verification-modal-backdrop"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 pt-6 relative"
        data-testid="two-step-verification-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-[#191919ff] hover:text-gray-700 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mt-5 mb-4 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center">
            <div className="text-red-600">
              <VerificationIcon />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#191919ff] mb-2">2-Step Verification</h2>
          {!showTooManyAttempts && (
            <p className="text-[#191919ff] text-[15px] font-medium">
              For your security, we want to make sure it&apos;s really you.
            </p>
          )}
        </div>

        {!showTooManyAttempts ? (
          <>
            {/* Code Input */}
            <div className="mb-4 px-4 mt-8">
              <label
                htmlFor="verification-code-input"
                className="block text-[15px] font-bold text-[#191919ff] mb-2"
              >
                Enter 6-digit code
              </label>
              <Input
                id="verification-code-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={e => {
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
                    return; // Allow these keys
                  }
                  // Block non-numeric characters
                  if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg 
                 focus-visible:border-[#191919ff] text-lg font-medium tracking-widest h-12 px-3 ${
                   codeError ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                 }`}
              />
            </div>

            {/* Phone Number Info */}
            <div className="mb-6 px-4">
              <p className="text-[#191919ff] text-[15px] font-medium">
                We sent a code to {phoneNumber}
              </p>
            </div>

            {/* Code Error Message */}
            {codeError && (
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
                      <p className="text-[15px] font-medium text-[#191919ff]">{codeError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resend and Help Links */}
            <div className="mb-[70px] flex items-center space-x-3 text-sm px-4">
              <button
                onClick={handleResendCode}
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
              {/* Get Help button hidden for now. */}
              {/* <button
                onClick={handleGetHelp}
                className="underline font-semibold text-sm text-[#191919ff] hover:text-gray-700"
              >
                Get Help
              </button> */}
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSubmit}
                className={`w-full py-2 px-4 hover:bg-gray-50 transition-colors text-[18px] font-bold ${
                  code.trim() !== ''
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={code.trim() === ''}
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
                Too many attempts have been made and parts of your DashDoor account are now locked.
                Please wait 30 minutes before trying to get access again, or contact support.
              </p>
            </div>

            {/* Separator Line */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* Get Help Button */}
            {/* Get Help button hidden for now. */}
            {/* <div className="px-4 pb-4">
              <button
                onClick={handleGetHelp}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-[16px] rounded-lg transition-colors"
                style={{ borderRadius: '28px' }}
              >
                Get Help
              </button>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}
