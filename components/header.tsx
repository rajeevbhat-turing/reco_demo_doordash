'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import SearchBar from '@/components/search-bar';
import CartSidebar from '@/components/cart-sidebar';
import { Button } from '@/components/ui/button';
import AuthenticationModal from './modals/authentication-modal';
import { DashDoorLogoMark, DashDoorWordMark } from './common/Icons';

export default function Header() {
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update cart count whenever the cart changes
  useEffect(() => {
    // Initial cart count
    setCartItemCount(getTotalItems());

    // Subscribe to cart store changes
    const unsubscribeFromStore = useCartStore.subscribe(state => {
      setCartItemCount(state.getTotalItems());
    });

    return () => {
      unsubscribeFromStore();
    };
  }, [getTotalItems]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center flex-1 space-x-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center">
                <DashDoorLogoMark />
                <div className="ml-1">
                  <DashDoorWordMark />
                </div>
                <span className="sr-only">DashDoor</span>
              </div>
            </Link>

            {/* Search - grows to take remaining space */}
            <div className="flex-grow">
              <SearchBar />
            </div>
          </div>

          <div className="flex">
            {/* Location */}
            <div className="flex items-center mr-4 bg-[#f1f1f1] rounded-full px-5 h-8">
              <MapPin className="h-5 w-5 text-gray-700 mr-1" />
              <span className="text-sm font-medium mr-1">548 Market st</span>
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </div>

            {/* Delivery/Pickup */}
            <div className="flex items-center space-x-2 mr-3">
              <button className="bg-gray-900 text-white px-4 h-8 rounded-full text-sm font-medium">
                Delivery
              </button>
              {/* <button className="text-gray-900 px-4 bg-[#f1f1f1] py-2 rounded-full text-sm font-medium">Pickup</button> */}
            </div>

            {/* Cart */}
            <div className="ml-4">
              <button
                className="relative h-8 w-14 rounded-full bg-[#2563EB] text-white text-sm font-semibold flex items-center justify-center"
                onClick={toggleCart}
              >
                <ShoppingCart className="h-4 w-4 text-white mr-1" />
                <span className="font-medium">{cartItemCount}</span>
              </button>
            </div>

            {/* Sign In and Sign Up */}
            {isHydrated && !isAuthenticated() && (
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={() => setAuthModalMode('signin')}
                  className="bg-transparent text-gray-900 hover:bg-gray-100 rounded-full px-4 h-8 text-sm font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setAuthModalMode('signup')}
                  className="bg-gray-300 text-gray-900 hover:bg-gray-300 rounded-full px-4 h-8 text-sm font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Authentication Modal */}
      {authModalMode && (
        <AuthenticationModal 
          onClose={() => setAuthModalMode(null)}
          defaultMode={authModalMode}
        />
      )}
    </>
  );
}
