import React, { useEffect, useRef } from 'react';
import { Star, Crown, Megaphone, Store } from 'lucide-react';
import { LockIcon } from '@/lib/utils/icons';

interface ProfileBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileBadgesModal({ isOpen, onClose }: ProfileBadgesModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      data-testid="profile-badges-modal-backdrop"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <h2 className="text-3xl font-bold text-[#191919ff] px-6 pt-6">Profile badges</h2>

        {/* Content */}
        <div className="px-6 pb-6 pt-1">
          {/* Introductory Text */}
          <p className="text-sm text-[#606060ff] font-medium mb-5">
            Earn badges and gain influence on DashDoor. Your profile must be public to participate.
          </p>

          {/* Emerging Expert Badge */}
          <div className="bg-[#f7f7f7] rounded-xl py-5 px-3 mb-4">
            {/* Padlock Icon */}
            <div className="flex mb-3">
              <div className="p-3 rounded-full bg-white flex items-center justify-center shadow-lg text-[#d6d6d6]">
                <LockIcon width={24} height={24} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#191919ff] mb-3">Emerging expert</h3>
              <p className="text-sm font-medium text-[#191919ff] mb-4">
                Share high-quality reviews or photos for 3+ stores.
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Gain more visibility for your contributions
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Megaphone className="w-5 h-5 text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Be a reliable voice for other customers
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Store className="w-[18px] h-[18px] text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Gather support for local businesses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Local Expert Badge */}
          <div className="bg-[#f7f7f7] rounded-xl py-5 px-3 relative overflow-hidden">
            {/* White overlay */}
            <div className="absolute inset-0 bg-white opacity-40 z-1" />

            {/* Padlock Icon */}
            <div className="flex mb-3 z-2 relative">
              <div className="p-3 rounded-full bg-white flex items-center justify-center shadow-lg text-[#d6d6d6]">
                <LockIcon width={24} height={24} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-[#191919ff] fill-[#191919ff]" />
                <h3 className="text-lg font-bold text-[#191919ff]">Local expert</h3>
              </div>
              <p className="text-sm font-medium text-[#191919ff] mb-4">
                Share high-quality reviews or photos for 10+ stores.
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Be top ranked and seen by the most people
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Megaphone className="w-5 h-5 text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Represent the most trusted voices
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Store className="w-[18px] h-[18px] text-[#191919ff] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-[#191919ff]">
                    Make a real difference for local businesses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-100 text-[#191919ff] font-bold text-base rounded-[28px] hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
