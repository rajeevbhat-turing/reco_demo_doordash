'use client';

import React, { useEffect, useRef } from 'react';
import { X, CircleCheck } from 'lucide-react';
import { FollowersIcon, MarketIcon } from '@/lib/utils/icons';

interface ReviewsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewsInfoModal({ isOpen, onClose }: ReviewsInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg w-full max-w-[480px] mx-4 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full flex items-center justify-center 
          hover:bg-gray-100 transition-colors cursor-pointer shadow-xl"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-[#191919ff]" strokeWidth={2} />
        </button>

        {/* Illustration Section */}
        <div className="relative w-[80%] h-[280px] mt-3 mx-auto">
          <img
            src="/review-info.png"
            alt="Public reviews illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="px-5 pt-4">
          {/* Title */}
          <h2 className="text-3xl font-bold text-[#191919ff] mb-6">Public reviews on DoorDash</h2>

          {/* Bullet Points */}
          <div className="space-y-2 mb-6 pl-3">
            {/* First Point */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-red-600">
                <MarketIcon />
              </div>
              <p className="text-[16px] font-medium text-[#191919ff] line-height-[22px]">
                Customer reviews are about their relevant experiences with a merchant and the items
                they have tried.
              </p>
            </div>

            {/* Second Point */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-red-600">
                <FollowersIcon />
              </div>
              <p className="text-[16px] font-medium text-[#191919ff] line-height-[22px]">
                Reviews are publicly available to customers and shared with merchants
              </p>
            </div>

            {/* Third Point */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CircleCheck className="text-red-600 w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-[16px] font-medium text-[#191919ff] line-height-[22px]">
                All reviews are checked to ensure they meet our Review Guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 border-t border-gray-200 justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-[#f1f1f1] rounded-[28px] text-[16px] font-bold text-[#191919ff] hover:bg-gray-200"
          >
            Review Guidelines
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-[#d91400ff] text-white rounded-[28px] font-bold text-[16px] hover:bg-red-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
