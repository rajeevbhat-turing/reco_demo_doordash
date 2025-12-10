'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import LetterAvatar from './letter-avatar';

interface DeliveryAccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
}

export default function DeliveryAccountPopup({ isOpen, onClose, anchorElement }: DeliveryAccountPopupProps) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const logout = useDeliveryPartnerStore(state => state.logout);

  useEffect(() => {
    // Position the popup below the anchor element
    if (popupRef.current && anchorElement) {
      const anchorRect = anchorElement.getBoundingClientRect();
      const popupWidth = 320;
      
      // Position below and align to the right edge of anchor
      popupRef.current.style.top = `${anchorRect.bottom + 8}px`;
      popupRef.current.style.left = `${Math.max(10, anchorRect.right - popupWidth)}px`;
    }
  }, [anchorElement, isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }
      if (anchorElement && anchorElement.contains(target)) {
        return;
      }
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorElement]);

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSignOut = () => {
    logout();
    router.push('/delivery/sign-in');
    onClose();
  };

  const handleProfileClick = () => {
    router.push('/delivery/account');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h2 className="text-lg text-[#191919ff] font-bold">Account</h2>
      </div>

      {/* User Profile Section */}
      <div
        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={handleProfileClick}
      >
        <LetterAvatar name={currentPartner?.name || 'Driver'} size="xl" className="mr-4" />
        <div className="flex-1">
          <div className="font-bold text-lg text-[#191919ff]">
            {currentPartner?.name || 'Driver'}
          </div>
          <div className="text-sm font-medium text-gray-600">View Profile</div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="py-2">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-4 py-2">
          Account Settings
        </h4>

        {/* Account */}
        <Link href="/delivery/account" onClick={onClose}>
          <div className="hover:bg-gray-50 cursor-pointer px-4 py-3">
            <div className="text-[15px] font-medium text-[#191919ff]">Account</div>
            <div className="text-sm text-gray-500">{currentPartner?.name || 'Driver'}</div>
          </div>
        </Link>

        {/* Language */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#191919ff]">Language</span>
            <div className="rounded-full bg-gray-100 px-3 py-1 flex items-center gap-2 border border-gray-200">
              <Globe className="h-4 w-4 text-gray-600" />
              <select className="text-sm text-gray-700 bg-gray-100 font-medium outline-none cursor-pointer">
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="hover:bg-gray-50 cursor-pointer px-4 py-3 w-full text-left"
        >
          <span className="text-[15px] font-medium text-[#191919ff]">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

