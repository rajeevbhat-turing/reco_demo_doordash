'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAppStore } from '@/store/app-store';
import { useUserStore } from '@/store/user-store';
import SearchBar from '@/components/search-bar';
import CartSidebar from '@/components/cart-sidebar';
import { Button } from '@/components/ui/button';
import AuthenticationModal from './modals/authentication-modal';
import AddressesModal from './modals/addresses-modal';
import { DashDoorLogoMark, DashDoorWordMark } from './common/Icons';

export default function Header() {
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const { getAddresses } = useUserStore();
  const addresses = getAddresses();

  // Initialize selected address with first address
  useEffect(() => {
    if (addresses.length > 0) {
      // If selected address doesn't exist anymore, or no address selected, use first address
      if (!selectedAddressId || !addresses.find(a => a.id === selectedAddressId)) {
        setSelectedAddressId(addresses[0].id);
      }
    } else {
      setSelectedAddressId('');
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const displayAddress = selectedAddress
    ? selectedAddress.street.length > 20
      ? `${selectedAddress.street.substring(0, 17)}...`
      : selectedAddress.street
    : null;

  // Update cart count whenever the cart or current store changes
  useEffect(() => {
    const updateCartCount = () => {
      const cartState = useCartStore.getState();
      const appState = useAppStore.getState();

      // If no current store is set, show number of carts
      if (!appState.currentStore?.id) {
        setCartItemCount(cartState.carts.length);
        return;
      }

      // If current store is set, show items in that store's cart
      const currentStoreId = appState.currentStore.id;
      const currentCategory = appState.currentCategory || 'grocery';
      const currentCart = cartState.findCart(currentStoreId, currentCategory);

      if (currentCart) {
        const itemCount = currentCart.items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(itemCount);
      } else {
        setCartItemCount(0);
      }
    };

    // Initial cart count
    updateCartCount();

    // Subscribe to both cart and app store changes
    const unsubscribeFromCart = useCartStore.subscribe(updateCartCount);
    const unsubscribeFromApp = useAppStore.subscribe(updateCartCount);

    return () => {
      unsubscribeFromCart();
      unsubscribeFromApp();
    };
  }, []);

  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  );

  // Check if current path is in account flow
  const isAccountFlow = pathname.startsWith('/consumer') || pathname.startsWith('/password-reset');

  // Check if current path is store or reviews
  const isStoreOrReviews =
    pathname.startsWith('/store') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/consumer/profile');

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressesModal(false);
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
            {!isStoreOrReviews && (
              <div className="flex-grow">
                <SearchBar />
              </div>
            )}
          </div>

          <div className="flex">
            {/* Location */}
            <button
              onClick={() => setShowAddressesModal(true)}
              className="flex items-center mr-4 bg-[#f1f1f1] rounded-full px-5 h-8 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <MapPin className="h-5 w-5 text-gray-700 mr-1" />
              <span className="text-sm font-medium mr-1">
                {displayAddress || 'No address selected'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </button>

            {/* Delivery/Pickup - Hide in account flow */}
            {!isAccountFlow && !isStoreOrReviews && (
              <div className="flex items-center space-x-2 mr-3">
                <button className="bg-gray-900 text-white px-4 h-8 rounded-full text-sm font-medium">
                  Delivery
                </button>
                {/* <button className="text-gray-900 px-4 bg-[#f1f1f1] py-2 rounded-full text-sm font-medium">Pickup</button> */}
              </div>
            )}

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
            {!isAuthenticated && (
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
        <AuthenticationModal onClose={() => setAuthModalMode(null)} defaultMode={authModalMode} />
      )}

      {/* Addresses Modal */}
      <AddressesModal
        isOpen={showAddressesModal}
        onClose={() => setShowAddressesModal(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleSelectAddress}
      />
    </>
  );
}
