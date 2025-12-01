'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Lock } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
// import { GiftIcon, GlitterIcon, MedalIcon, MessageIcon } from '@/utils/icons';
interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
}

export default function AccountPopup({ isOpen, onClose, anchorElement }: AccountPopupProps) {
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);
  const currentUser = useUserStore(state => state.currentUser);
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const setTempAddress = useUserStore(state => state.setTempAddress);

  useEffect(() => {
    // Position the popup next to the anchor element
    if (popupRef.current && anchorElement) {
      const anchorRect = anchorElement.getBoundingClientRect();
      popupRef.current.style.top = `${anchorRect.top}px`;
      popupRef.current.style.left = `${anchorRect.right + 10}px`;
    }
  }, [anchorElement, isOpen]);

  // Close popup when clicking outside (but not when clicking the anchor element)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking inside the popup
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }
      // Don't close if clicking on the anchor element (Account button) - let the toggle handle it
      if (anchorElement && anchorElement.contains(target)) {
        return;
      }
      // Close if clicking anywhere else
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
    setCurrentUser(null);
    setTempAddress(null); // Clear temp address on logout

    // Navigate to home page
    router.push('/');

    onClose();
  };

  // Go to profile page
  const handleProfileClick = () => {
    router.push(`/consumer/profile/${currentUser?.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="account-popup"
      ref={popupRef}
      className="fixed z-50 translate-y-[-150px] w-[380px] max-h-[580px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      {/* Fixed Header */}
      <div className="px-4 py-3 bg-white">
        <h2 className="text-lg text-[#191919ff] font-bold">Account</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-2">
        {/* User Profile Section */}
        <div className="flex items-center p-3 hover:bg-gray-100 cursor-pointer">
          <div className="w-[56px] h-[56px] bg-[#91a5f9] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <span className="text-white font-bold text-[32px]">
              {currentUser?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1" onClick={handleProfileClick}>
            <div className="flex items-center">
              <span className="font-bold text-lg text-[#191919ff]">
                {currentUser?.name || 'User'}
              </span>
              {/* Display lock icon if the user is restricted */}
              {currentUser?.is_restricted ? (
                <Lock className="h-4 w-4 ml-1 text-[#191919ff]" />
              ) : null}
            </div>
            <div className="text-[16px] font-medium text-[#191919ff]">View Profile</div>
          </div>
        </div>

        {/* DashPass Promotion */}
        {/* <div className="bg-[#ecfcfc] px-4 py-[18px] flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0 w-[26px] h-[26px] mr-3">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                  fill="#00838a"
                ></path>
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-medium text-[#00838a] max-w-[260px]">
                Save an average of $5 on each order. Sign up for DashPass!
              </div>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-[#00838a] flex-shrink-0" />
        </div> */}

        {/* <div>
          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                  fill="#00838a"
                ></path>
              </svg>
              <span className="text-[15px] font-medium text-[#00666d]">Get $0 delivery fees</span>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <Heart className="h-[22px] w-[22px] text-[#191919ff]" />
              <span className="text-[15px] font-medium text-[#191919ff]">Saved Stores</span>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <div className="h-[22px] w-[22px] text-[#191919ff]">
                <MedalIcon height={22} width={22} />
              </div>
              <span className="text-[15px] font-medium text-[#191919ff]">My Rewards</span>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <Plane className="h-[22px] w-[22px] text-[#191919ff]" />
              <div className="flex items-center gap-2 w-full">
                <span className="text-[15px] font-medium text-[#191919ff]">
                  Velocity Frequent Flyer
                </span>
                <span className="text-xs font-bold bg-[#fff0edff] text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                  <GlitterIcon height={12} width={12} />
                  New
                </span>
              </div>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <MessageIcon height={22} width={22} />
              <span className="text-[15px] font-medium text-[#191919ff]">Help</span>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <GiftIcon height={22} width={22} />
              <span className="text-[15px] font-medium text-[#191919ff]">Gift Card</span>
            </div>
          </div>

          <div className="pl-[14px] hover:bg-red-100 bg-red-50 cursor-pointer">
            <div className="flex items-center gap-3 border-b border-gray-200 py-[10px] pr-[14px]">
              <UsersRound className="h-[22px] w-[22px] text-[#191919ff]" />
              <span className="text-[15px] font-medium text-[#191919ff]">Get $1 in Credits</span>
            </div>
          </div>
        </div> */}

        <div className="w-full h-2 bg-gray-100 border-y border-gray-200" />

        <div>
          <h4 className="text-lg font-bold text-[#191919ff] px-4 py-3">Account Settings</h4>

          {/* Account */}
          <Link href="/consumer/edit_profile">
            <div className="hover:bg-gray-100 cursor-pointer px-4 py-[10px]" onClick={onClose}>
              <div className="text-[15px] font-medium text-[#191919ff]">Account</div>
              <div className="text-sm text-[#606060ff] font-medium">
                {currentUser?.name || 'User'}
              </div>
            </div>
          </Link>

          {/* Payment */}
          <div
            className="hover:bg-gray-100 cursor-pointer px-4 py-[10px]"
            onClick={() => {
              router.push('/payment');
              onClose();
            }}
          >
            <div className="text-[15px] font-medium text-[#191919ff]">Payment</div>
          </div>

          {/* Language */}
          <div className="px-4 py-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#191919ff]">Language</span>
              <div className="rounded-[28px] bg-[#f1f1f1] px-4 py-1 flex items-center gap-2 border-2 border-gray-200 focus-within:border-[#191919ff]">
                <Globe className="h-[22px] w-[22px] text-[#191919ff] flex-shrink-0" />
                <select className="text-sm text-[#191919ff] bg-[#f1f1f1] font-medium rounded-[28px] outline-none">
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="hover:bg-gray-100 cursor-pointer px-4 py-[10px] w-full text-left"
          >
            <span className="text-[15px] font-medium text-[#191919ff]">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
