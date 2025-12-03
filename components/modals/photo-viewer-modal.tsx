'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: string;
  userName: string;
  timestamp: string;
}

export default function PhotoViewerModal({
  isOpen,
  onClose,
  photo,
  userName,
  timestamp,
}: PhotoViewerModalProps) {
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

  const formattedDate = format(new Date(timestamp), 'M/d/yy');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      data-testid="photo-viewer-modal-backdrop"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl mx-4 flex flex-col py-3"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="w-8 h-8 cursor-pointer mx-4" aria-label="Close modal">
          <X className="w-6 h-6 text-[#191919ff]" strokeWidth={2} />
        </button>

        {/* User Info Section */}
        <div className="flex gap-2 items-center px-4 py-3">
          <div
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: generateAvatarColor(userName) }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-[#191919ff] text-sm leading-tight">{userName}</p>
            <p className="text-xs text-[#767676] leading-tight font-bold">{formattedDate}</p>
          </div>
        </div>

        {/* Image Container */}
        <div className="bg-black relative h-[400px] w-[420px] mx-4 rounded-xl overflow-hidden">
          <img src={photo} alt={`Photo by ${userName}`} className="w-full h-full object-contain" />
        </div>

        {/* Done Button */}
        <div className="border-t border-[#e5e5e5] mt-7 flex justify-end px-4 pt-3 pb-1">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-[#d91400ff] text-white rounded-[28px] font-bold text-base hover:bg-red-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
