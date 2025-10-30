"use client"
import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, ChevronDown, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useAppStore } from "@/store/app-store"
import { useUserStore } from "@/store/user-store"
import { Address } from "@/lib/types/user-types"
import SearchBar from "@/components/search-bar"
import CartSidebar from "@/components/cart-sidebar"
import { Button } from "@/components/ui/button"
import AuthenticationModal from "./modals/authentication-modal"
import AddressesModal from "./modals/addresses-modal"
import AddAddressModal from "./modals/add-address-modal"
import AddressReviewErrorModal from "./modals/address-review-error-modal"
import AddressTypeModal from "./modals/address-type-modal"
import AddressDetailsModal from "./modals/address-details-modal"
import { DashDoorLogoMark, DashDoorWordMark } from "./common/Icons"

export default function Header() {
  const pathname = usePathname()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [showAddressesModal, setShowAddressesModal] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)
  const [showReviewErrorModal, setShowReviewErrorModal] = useState(false)
  const [pendingAddressData, setPendingAddressData] = useState<Omit<Address, 'id'> | null>(null)
  
  // Address type modal state
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false)
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false)
  const [tempAddressData, setTempAddressData] = useState<Omit<Address, 'id'> | null>(null)

  const { getAddresses, addAddress, updateAddress } = useUserStore()
  const addresses = getAddresses()
  
  // Always sync with default address when addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      // Find default address
      const defaultAddress = addresses.find(a => a.default)
      const defaultAddressId = defaultAddress?.id || addresses[0].id
      
      // If there's a default address and it's different from current selection, update it
      if (defaultAddressId !== selectedAddressId) {
        setSelectedAddressId(defaultAddressId)
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
  const isAccountFlow = pathname.startsWith("/consumer") || pathname.startsWith("/password-reset");
  
  // Check if current path is store or reviews
  const isStoreOrReviews =
    pathname.startsWith('/store') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/consumer/profile');
  
  // Check if current path is checkout page
  const isCheckoutPage = pathname === "/checkout"

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressesModal(false);
  };

  // Handle select address from search results
  const handleSelectSearchAddress = (address: Address) => {
    // Store the search result temporarily (without id)
    const { id, ...addressWithoutId } = address
    setTempAddressData(addressWithoutId)
    setShowAddressesModal(false)
    setShowAddressTypeModal(true)
  }

  // Handle address type selection
  const handleAddressTypeNext = (addressType: Address['addressType']) => {
    if (tempAddressData) {
      const addressWithType = { ...tempAddressData, addressType }
      setTempAddressData(addressWithType)
      setShowAddressTypeModal(false)
      setShowAddressDetailsModal(true)
    }
  }

  // Handle saving address details
  const handleSaveAddressDetails = (addressData: any) => {
    if (tempAddressData) {
      // This is from search results - save as new address
      const newAddress = addAddress({
        ...tempAddressData,
        ...addressData,
        addressType: addressData.addressType || tempAddressData.addressType || 'house',
      })
      setSelectedAddressId(newAddress.id)
      setTempAddressData(null)
    }
    setShowAddressDetailsModal(false)
  }

  const handleManualEntry = () => {
    setShowAddressesModal(false)
    setShowAddAddressModal(true)
  }

  // Handle adding new address - show review error modal
  const handleAddAddress = (addressData: Omit<Address, 'id'>) => {
    setPendingAddressData(addressData)
    setShowAddAddressModal(false)
    setShowReviewErrorModal(true)
  }

  // Handle review address - go back to add address modal with pre-filled data
  const handleReviewAddress = () => {
    setShowReviewErrorModal(false)
    if (pendingAddressData) {
      setShowAddAddressModal(true)
    }
  }

  // Handle enter new address - open add address modal with empty state
  const handleEnterNewAddress = () => {
    setPendingAddressData(null)
    setShowReviewErrorModal(false)
    setShowAddAddressModal(true)
  }

  const router = useRouter()

  const handleBackToStore = () => {
    router.back()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {isCheckoutPage ? (
            <>
              {/* Checkout Header Layout */}
              {/* Back to store button */}
              <button 
                onClick={handleBackToStore}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to store</span>
              </button>

              {/* Centered Logo */}
              <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center">
                  <DashDoorLogoMark />
                  <div className="ml-1">
                    <DashDoorWordMark />
                  </div>
                  <span className="sr-only">DashDoor</span>
                </div>
              </Link>

              {/* Empty div for layout balance */}
              <div className="w-[140px]"></div>
            </>
          ) : (
            <>
              {/* Normal Header Layout */}
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
                    {displayAddress || "No address selected"}
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
            </>
          )}
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
        onManualEntry={handleManualEntry}
        onSelectSearchAddress={handleSelectSearchAddress}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false)
          setPendingAddressData(null)
        }}
        onContinue={handleAddAddress}
        onBack={() => {
          setShowAddAddressModal(false)
          setShowAddressesModal(true)
          setPendingAddressData(null)
        }}
        initialData={pendingAddressData ? (() => {
          // Extract apartment/suite from street if it exists
          const streetParts = pendingAddressData.street.split(',').map(s => s.trim())
          return {
            street: pendingAddressData.street,
            apartmentSuite: streetParts[1] || "",
            city: pendingAddressData.city,
            state: pendingAddressData.state,
            zipCode: pendingAddressData.zipCode,
          }
        })() : undefined}
      />

      {/* Address Review Error Modal */}
      <AddressReviewErrorModal
        isOpen={showReviewErrorModal}
        onClose={() => {
          setShowReviewErrorModal(false)
          setPendingAddressData(null)
        }}
        onReviewAddress={handleReviewAddress}
        onEnterNewAddress={handleEnterNewAddress}
      />

      {/* Address Type Modal */}
      <AddressTypeModal
        isOpen={showAddressTypeModal}
        onClose={() => {
          setShowAddressTypeModal(false)
          setTempAddressData(null)
        }}
        addressData={tempAddressData || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          addressType: 'house'
        }}
        onNext={handleAddressTypeNext}
        onBack={() => {
          setShowAddressTypeModal(false)
          setShowAddressesModal(true)
        }}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        isOpen={showAddressDetailsModal}
        onClose={() => {
          setShowAddressDetailsModal(false)
          setTempAddressData(null)
        }}
        address={tempAddressData as Address | Omit<Address, 'id'> | undefined}
        onSave={handleSaveAddressDetails}
        hideAddressType={!!tempAddressData} // Hide type dropdown when coming from search flow
        onBack={tempAddressData ? () => {
          setShowAddressDetailsModal(false)
          setShowAddressTypeModal(true)
        } : undefined}
      />
    </>
  );
}
