'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import DeliveryAccountPopup from './account-popup';
import LetterAvatar from './letter-avatar';

export default function DeliveryHeader() {
  const pathname = usePathname();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [accountButtonRef, setAccountButtonRef] = useState<HTMLButtonElement | null>(null);

  // Check if we're on auth pages
  const isAuthPage = pathname === '/delivery/sign-in' || pathname === '/delivery/sign-up';

  const handleAccountClick = useCallback(() => {
    setShowAccountPopup(prev => !prev);
  }, []);

  const handleCloseAccountPopup = useCallback(() => {
    setShowAccountPopup(false);
  }, []);

  return (
    <>
      <header className="fixed h-16 top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {!isAuthPage && isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            )}

            {/* Logo */}
            <Link href="/delivery" className="flex items-center gap-2">
              <div className="flex items-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="32" height="32" rx="8" fill="#4561ED" />
                  <path
                    d="M8 16L16 10L24 16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14V22H22V14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 22V18H18V22"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  <span className="text-[#4561ED]">Dash</span>Door
                </span>
                <span className="ml-1 text-sm font-medium text-gray-500 hidden sm:inline">Driver</span>
              </div>
            </Link>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && !isAuthPage && (
              <>
                {/* User avatar - clickable for account popup */}
                <button
                  ref={setAccountButtonRef}
                  onClick={handleAccountClick}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LetterAvatar name={currentPartner?.name || ''} size="sm" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {currentPartner?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 hidden sm:block transition-transform ${showAccountPopup ? 'rotate-180' : ''}`} />
                </button>
              </>
            )}

            {!isAuthenticated && !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link
                  href="/delivery/sign-in"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/delivery/sign-up"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4561ED] hover:bg-[#3651d4] rounded-full transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-2">
              <Link
                href="/delivery/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 ${
                  pathname === '/delivery/dashboard' ? 'bg-[#4561ED]/10 text-[#4561ED]' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/delivery/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 ${
                  pathname?.startsWith('/delivery/orders') ? 'bg-[#4561ED]/10 text-[#4561ED]' : 'text-gray-700'
                }`}
              >
                Orders
              </Link>
              <Link
                href="/delivery/earnings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 ${
                  pathname?.startsWith('/delivery/earnings') ? 'bg-[#4561ED]/10 text-[#4561ED]' : 'text-gray-700'
                }`}
              >
                Earnings
              </Link>
              <Link
                href="/delivery/ratings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 ${
                  pathname?.startsWith('/delivery/ratings') ? 'bg-[#4561ED]/10 text-[#4561ED]' : 'text-gray-700'
                }`}
              >
                Ratings
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Account Popup */}
      <DeliveryAccountPopup
        isOpen={showAccountPopup}
        onClose={handleCloseAccountPopup}
        anchorElement={accountButtonRef}
      />
    </>
  );
}
