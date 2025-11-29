'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AddressReviewErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewAddress: () => void;
  onEnterNewAddress: () => void;
}

export default function AddressReviewErrorModal({
  isOpen,
  onClose,
  onReviewAddress,
  onEnterNewAddress,
}: AddressReviewErrorModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

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
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl w-full max-w-md md:max-w-xl mx-4"
      >
        <div className="py-6 px-8 md:px-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Content */}
          <div className="mb-8 mt-12 md:my-8">
            {/* Modal Title */}
            <h1 className="text-3xl font-bold text-[#191919ff] mb-4 hidden md:block">
              Add new address
            </h1>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-[#191919ff] mb-3">
              We can&apos;t add this address at the moment
            </h2>

            {/* Body Text */}
            <p className="text-sm md:text-[15px] font-medium text-[#191919ff] leading-relaxed">
              We&apos;re currently reviewing the address. Please check for any typos and re-enter
              your address.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={onReviewAddress}
              className="w-full py-2 px-6 bg-[#eb1700ff] text-white rounded-[28px] text-base font-bold hover:bg-red-700 
              transition-colors"
            >
              Review address
            </button>
            <button
              onClick={onEnterNewAddress}
              className="w-full py-2 px-6 text-[#191919ff] font-bold bg-gray-100 hover:bg-gray-200 rounded-[28px] 
              text-base transition-colors"
            >
              Enter new address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
