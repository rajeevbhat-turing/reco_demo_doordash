'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  Home,
  FileText,
  CircleUserRound,
} from 'lucide-react';
import AuthenticationModal from './modals/authentication-modal';
import AccountPopup from './account-popup';
import { useUserStore } from '@/store/user-store';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  );
  
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [accountButtonRef, setAccountButtonRef] = useState<HTMLDivElement | null>(null);

  const handleSignUpClick = () => {
    setAuthModalMode('signup');
  };

  const handleAccountClick = () => {
    setShowAccountPopup(!showAccountPopup);
  };

  return (
    <>
      <aside className="fixed top-16 left-0 w-[220px] border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto bg-white z-40 hidden md:block">
        <nav className="py-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/home"
                className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                  pathname === '/' || pathname === '/home'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-5 w-5 mr-3" />
                <span>Home</span>
              </Link>
            </li>
          </ul>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <ul className="space-y-1">
              {/* Orders menu - only show if user is logged in */}
              {isAuthenticated && (
                <li>
                  <Link
                    href="/orders"
                    className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                      pathname.startsWith('/orders')
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    <span>Orders</span>
                  </Link>
                </li>
              )}

              {/* Account menu - show if user is logged in, otherwise show Sign up/Login */}
              <li>
                {isAuthenticated ? (
                  <div
                    ref={setAccountButtonRef}
                    onClick={handleAccountClick}
                    className={`flex items-center px-4 py-3 rounded-lg mx-2 text-left cursor-pointer ${
                      showAccountPopup
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CircleUserRound className="h-5 w-5 mr-3" />
                    <span>Account</span>
                  </div>
                ) : (
                  <div
                    onClick={handleSignUpClick}
                    className="flex items-center px-4 py-3 rounded-lg mx-2 text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <CircleUserRound className="h-5 w-5 mr-3" />
                    <span>Sign up or Login</span>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Account Popup */}
      {showAccountPopup && (
        <AccountPopup
          isOpen={showAccountPopup}
          onClose={() => setShowAccountPopup(false)}
          anchorElement={accountButtonRef}
        />
      )}

      {/* Authentication Modal */}
      {authModalMode && (
        <AuthenticationModal onClose={() => setAuthModalMode(null)} defaultMode={authModalMode} />
      )}
    </>
  );
}
