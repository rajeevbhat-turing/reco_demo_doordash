'use client';
import { useEffect, useState, useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, ChevronDown, ShoppingCart, ChevronRight, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAppStore } from '@/store/app-store';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';
import SearchBar from '@/components/search-bar';
import CartSidebar from '@/components/cart-sidebar';
import { Button } from '@/components/ui/button';
import AuthenticationModal from './modals/authentication-modal';
import AddressesModal from './modals/addresses-modal';
import AddAddressModal from './modals/add-address-modal';
import AddressReviewErrorModal from './modals/address-review-error-modal';
import AddressTypeModal from './modals/address-type-modal';
import AddressDetailsModal from './modals/address-details-modal';
import ChooseAddressLabelModal from './modals/choose-address-label-modal';
import ChooseLabelModal from './modals/choose-label-modal';
import AddressSelectionModal from './modals/address-selection-modal';
import { DashDoorLogoMark, DashDoorWordMark } from './common/Icons';
import addressesData from '@/data/addresses.json';

export default function Header() {
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showChooseLabelModal, setShowChooseLabelModal] = useState(false);
  const [addressToLabel, setAddressToLabel] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showReviewErrorModal, setShowReviewErrorModal] = useState(false);
  const [pendingAddressData, setPendingAddressData] = useState<Omit<Address, 'id'> | null>(null);

  // Address type modal state
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false);
  const [tempAddressData, setTempAddressData] = useState<Omit<Address, 'id'> | null>(null);
  const [showAddressPopover, setShowAddressPopover] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [selectedPopoverAddress, setSelectedPopoverAddress] = useState<Address | null>(null);
  const [apartmentSuite, setApartmentSuite] = useState('');
  const [dropOffOption, setDropOffOption] = useState<'hand' | 'door'>('door');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showManualEntryError, setShowManualEntryError] = useState(false);
  const [showAddressSelectionModal, setShowAddressSelectionModal] = useState(false);

  // Manual entry form states
  const [manualCountry, setManualCountry] = useState('United States');
  const [manualStreet, setManualStreet] = useState('');
  const [manualApartment, setManualApartment] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('Alabama');
  const [manualZipCode, setManualZipCode] = useState('');

  // Checking if current path is auth flow
  const isAuthFlow = pathname.startsWith('/auth');

  const { getAddresses, addAddress, updateAddress, setDefaultAddress, setTempAddress } =
    useUserStore();
  const shouldOpenCart = useCartStore(state => state.shouldOpenCart);
  const resetOpenCartTrigger = useCartStore(state => state.resetOpenCartTrigger);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const addresses = getAddresses();
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().getTempAddress(),
    () => null // fallback for SSR
  );

  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  );

  // Always sync with default address when addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      // Find default address
      const defaultAddress = addresses.find(a => a.default);
      const defaultAddressId = defaultAddress?.id || addresses[0].id;

      // If there's a default address and it's different from current selection, update it
      if (defaultAddressId !== selectedAddressId) {
        setSelectedAddressId(defaultAddressId);
      }
    } else {
      setSelectedAddressId('');
    }
  }, [addresses]);

  // Show address selection modal if user is authenticated and doesn't have a default address
  useEffect(() => {
    if (isAuthenticated) {
      const hasDefaultAddress = addresses.some(a => a.default);
      if (!hasDefaultAddress) {
        // Show modal if user doesn't have a default address
        setShowAddressSelectionModal(true);
      } else {
        // If user has a default address, close the modal
        setShowAddressSelectionModal(false);
      }
    } else {
      // Don't show address selection modal if user is not authenticated
      setShowAddressSelectionModal(false);
    }
  }, [isAuthenticated, addresses]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  // Display logic: show temp address for non-authenticated users, otherwise show selected address
  const displayAddress = useMemo(() => {
    if (!isAuthenticated && tempAddress) {
      // Show temp address for non-authenticated users
      const street = tempAddress.street;
      return street.length > 20 ? `${street.substring(0, 17)}...` : street;
    }
    // Show selected address for authenticated users
    if (selectedAddress) {
      return selectedAddress.street.length > 20
        ? `${selectedAddress.street.substring(0, 17)}...`
        : selectedAddress.street;
    }
    return null;
  }, [isAuthenticated, tempAddress, selectedAddress]);

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

  // Listen for cart open trigger (for reorder functionality)
  useEffect(() => {
    if (shouldOpenCart) {
      console.log('[HEADER] Opening cart sidebar due to trigger');
      setIsCartOpen(true);
      resetOpenCartTrigger();
    }
  }, [shouldOpenCart, resetOpenCartTrigger]);

  // Check if current path is in account flow
  const isAccountFlow = pathname.startsWith('/consumer') || pathname.startsWith('/password-reset');

  // Check if current path is store or reviews
  const isStoreOrReviews =
    pathname.startsWith('/store') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/consumer/profile');

  // Check if current path is checkout page
  const isCheckoutPage = pathname === '/checkout';

  const toggleCart = () => {
    console.log('[HEADER] Toggling cart, current state:', isCartOpen);
    setIsCartOpen(!isCartOpen);
  };

  const handleCloseCart = () => {
    console.log('[HEADER] Closing cart');
    setIsCartOpen(false);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setDefaultAddress(addressId); // Set as default address
    setShowAddressesModal(false);
  };

  // Handle select address from search results
  const handleSelectSearchAddress = (address: Address) => {
    // Store the search result temporarily (without id)
    const { id, ...addressWithoutId } = address;
    setTempAddressData(addressWithoutId);
    setShowAddressesModal(false);
    setShowAddressTypeModal(true);
  };

  // Handle address type selection
  const handleAddressTypeNext = (addressType: Address['addressType']) => {
    if (tempAddressData) {
      const addressWithType = { ...tempAddressData, addressType };
      setTempAddressData(addressWithType);
      setShowAddressTypeModal(false);
      setShowAddressDetailsModal(true);
    }
  };

  // Handle saving address details
  const handleSaveAddressDetails = (addressData: any) => {
    if (tempAddressData) {
      // This is from search results - save as new address
      const newAddress = addAddress({
        ...tempAddressData,
        ...addressData,
        addressType: addressData.addressType || tempAddressData.addressType || 'house',
      });
      setSelectedAddressId(newAddress.id);
      setTempAddressData(null);
    } else if (selectedAddressId) {
      // This is editing an existing address
      updateAddress(selectedAddressId, addressData);
    }
    setShowAddressDetailsModal(false);
  };

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!addressSearchQuery.trim()) return [];

    const query = addressSearchQuery.toLowerCase();
    return addressesData
      .filter(
        address =>
          address.street.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.state.toLowerCase().includes(query) ||
          address.zipCode.includes(query)
      )
      .slice(0, 5); // Limit to 5 results
  }, [addressSearchQuery]);

  const handleManualEntry = () => {
    setShowAddressesModal(false);
    setShowAddAddressModal(true);
  };

  // Handle edit address from addresses modal
  const handleEditAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressesModal(false);
    setShowAddressDetailsModal(true);
  };

  // Handle adding new address - show review error modal
  const handleAddAddress = (addressData: Omit<Address, 'id'>) => {
    setPendingAddressData(addressData);
    setShowAddAddressModal(false);
    setShowReviewErrorModal(true);
  };

  // Handle review address - go back to add address modal with pre-filled data
  const handleReviewAddress = () => {
    setShowReviewErrorModal(false);
    if (pendingAddressData) {
      setShowAddAddressModal(true);
    }
  };

  // Handle enter new address - open add address modal with empty state
  const handleEnterNewAddress = () => {
    setPendingAddressData(null);
    setShowReviewErrorModal(false);
    setShowAddAddressModal(true);
  };

  const router = useRouter();

  const handleBackToStore = () => {
    router.back();
  };

  // Handle address selection from popover
  const handlePopoverAddressSelect = (address: any) => {
    setSelectedPopoverAddress(address as Address);
    setAddressSearchQuery('');
  };

  // Handle save from popover address details
  const handleSavePopoverAddress = () => {
    if (selectedPopoverAddress) {
      const tempAddressData: Address = {
        id: 'temp-address',
        street: selectedPopoverAddress.street,
        city: selectedPopoverAddress.city,
        state: selectedPopoverAddress.state,
        zipCode: selectedPopoverAddress.zipCode,
        lat: selectedPopoverAddress.lat || 0,
        lng: selectedPopoverAddress.lng || 0,
        addressType: 'house', // default type for popover
        apartmentSuite: apartmentSuite,
        deliveryPreference: dropOffOption === 'door' ? 'door' : 'location',
        meetLocation: dropOffOption === 'door' ? '' : 'door',
        deliveryInstructions: deliveryInstructions,
      };
      setTempAddress(tempAddressData);
      setShowAddressPopover(false);
      setSelectedPopoverAddress(null);
      setApartmentSuite('');
      setDropOffOption('door');
      setDeliveryInstructions('');
    }
  };

  // Handle cancel from popover address details
  const handleCancelPopoverAddress = () => {
    setSelectedPopoverAddress(null);
    setApartmentSuite('');
    setDropOffOption('door');
    setDeliveryInstructions('');
  };

  // Handle manual entry click
  const handleManualEntryClick = () => {
    setShowManualEntry(true);
    setAddressSearchQuery('');
  };

  // Handle back from manual entry
  const handleBackFromManualEntry = () => {
    setShowManualEntry(false);
    setManualStreet('');
    setManualApartment('');
    setManualCity('');
    setManualState('Alabama');
    setManualZipCode('');
  };

  // Handle continue from manual entry - show error view
  const handleManualEntryContinue = () => {
    setShowManualEntry(false);
    setShowManualEntryError(true);
  };

  // Handle review address - go back to manual entry with populated fields
  const handleReviewManualAddress = () => {
    setShowManualEntryError(false);
    setShowManualEntry(true);
    // Fields remain populated
  };

  // Handle enter new address - go back to manual entry with cleared fields
  const handleEnterNewManualAddress = () => {
    setShowManualEntryError(false);
    setShowManualEntry(true);
    // Clear all fields
    setManualStreet('');
    setManualApartment('');
    setManualCity('');
    setManualState('Alabama');
    setManualZipCode('');
  };

  return (
    <>
      <header className="fixed h-16 top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {isCheckoutPage || isAuthFlow ? (
            <>
              {/* Checkout Header Layout */}
              {/* Back to store button */}
              {!isAuthFlow && (
                <button
                  onClick={handleBackToStore}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="font-medium">Back to store</span>
                </button>
              )}

              {/* Centered Logo */}
              <Link
                href={isAuthenticated ? '/home' : '/'}
                className="absolute left-1/2 transform -translate-x-1/2"
              >
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
                <Link href={isAuthenticated ? '/home' : '/'} className="flex-shrink-0">
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
                <div className="relative">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        setShowAddressesModal(true);
                      } else {
                        setShowAddressPopover(!showAddressPopover);
                      }
                    }}
                    className="flex items-center mr-4 bg-[#f1f1f1] rounded-full px-5 h-8 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {displayAddress && <MapPin className="h-5 w-5 text-gray-700 mr-1" />}
                    <span className="text-sm font-medium mr-1">
                      {displayAddress ? (
                        displayAddress
                      ) : (
                        <>
                          + Your address
                          <ChevronDown className="h-4 w-4 text-gray-700 inline-block ml-1" />
                        </>
                      )}
                    </span>
                    {displayAddress && <ChevronDown className="h-4 w-4 text-gray-700" />}
                  </button>

                  {/* Address Popover for non-authenticated users */}
                  {showAddressPopover && !isAuthenticated && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                          setShowAddressPopover(false);
                          setShowManualEntry(false);
                          setShowManualEntryError(false);
                          setSelectedPopoverAddress(null);
                        }}
                      />

                      {/* Popover */}
                      <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        {showManualEntryError ? (
                          <>
                            {/* Address review error view */}
                            <div className="p-6">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                We can't add this address at the moment
                              </h2>

                              <p className="text-gray-900 mb-8">
                                We're currently reviewing the address. Please check for any typos
                                and re-enter your address.
                              </p>

                              <div className="space-y-3">
                                <button
                                  onClick={handleReviewManualAddress}
                                  className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                  Review address
                                </button>
                                <button
                                  onClick={handleEnterNewManualAddress}
                                  className="w-full py-3 px-6 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                >
                                  Enter new address
                                </button>
                              </div>
                            </div>
                          </>
                        ) : showManualEntry ? (
                          <>
                            {/* Manual entry form view */}
                            <div className="p-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Add new address
                              </h3>

                              {/* Country */}
                              <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Country
                                </label>
                                <div className="relative">
                                  <select
                                    value={manualCountry}
                                    onChange={e => setManualCountry(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                  >
                                    <option value="United States">United States</option>
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                                </div>
                              </div>

                              {/* Street Address */}
                              <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Street Address
                                </label>
                                <input
                                  type="text"
                                  value={manualStreet}
                                  onChange={e => setManualStreet(e.target.value)}
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                />
                              </div>

                              {/* Apartment/Suite and City */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Apartment/Suite
                                  </label>
                                  <input
                                    type="text"
                                    value={manualApartment}
                                    onChange={e => setManualApartment(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    City
                                  </label>
                                  <input
                                    type="text"
                                    value={manualCity}
                                    onChange={e => setManualCity(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              {/* State and Zip code */}
                              <div className="grid grid-cols-2 gap-3 mb-6">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    State
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={manualState}
                                      onChange={e => setManualState(e.target.value)}
                                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                    >
                                      <option value="Alabama">Alabama</option>
                                      <option value="Alaska">Alaska</option>
                                      <option value="Arizona">Arizona</option>
                                      <option value="Arkansas">Arkansas</option>
                                      <option value="California">California</option>
                                      <option value="Colorado">Colorado</option>
                                      <option value="Connecticut">Connecticut</option>
                                      <option value="Delaware">Delaware</option>
                                      <option value="Florida">Florida</option>
                                      <option value="Georgia">Georgia</option>
                                      <option value="Hawaii">Hawaii</option>
                                      <option value="Idaho">Idaho</option>
                                      <option value="Illinois">Illinois</option>
                                      <option value="Indiana">Indiana</option>
                                      <option value="Iowa">Iowa</option>
                                      <option value="Kansas">Kansas</option>
                                      <option value="Kentucky">Kentucky</option>
                                      <option value="Louisiana">Louisiana</option>
                                      <option value="Maine">Maine</option>
                                      <option value="Maryland">Maryland</option>
                                      <option value="Massachusetts">Massachusetts</option>
                                      <option value="Michigan">Michigan</option>
                                      <option value="Minnesota">Minnesota</option>
                                      <option value="Mississippi">Mississippi</option>
                                      <option value="Missouri">Missouri</option>
                                      <option value="Montana">Montana</option>
                                      <option value="Nebraska">Nebraska</option>
                                      <option value="Nevada">Nevada</option>
                                      <option value="New Hampshire">New Hampshire</option>
                                      <option value="New Jersey">New Jersey</option>
                                      <option value="New Mexico">New Mexico</option>
                                      <option value="New York">New York</option>
                                      <option value="North Carolina">North Carolina</option>
                                      <option value="North Dakota">North Dakota</option>
                                      <option value="Ohio">Ohio</option>
                                      <option value="Oklahoma">Oklahoma</option>
                                      <option value="Oregon">Oregon</option>
                                      <option value="Pennsylvania">Pennsylvania</option>
                                      <option value="Rhode Island">Rhode Island</option>
                                      <option value="South Carolina">South Carolina</option>
                                      <option value="South Dakota">South Dakota</option>
                                      <option value="Tennessee">Tennessee</option>
                                      <option value="Texas">Texas</option>
                                      <option value="Utah">Utah</option>
                                      <option value="Vermont">Vermont</option>
                                      <option value="Virginia">Virginia</option>
                                      <option value="Washington">Washington</option>
                                      <option value="West Virginia">West Virginia</option>
                                      <option value="Wisconsin">Wisconsin</option>
                                      <option value="Wyoming">Wyoming</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Zip code
                                  </label>
                                  <input
                                    type="text"
                                    value={manualZipCode}
                                    onChange={e => setManualZipCode(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                  />
                                </div>
                              </div>

                              {/* Continue Button */}
                              <button
                                onClick={handleManualEntryContinue}
                                className="w-full py-3 px-6 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors mb-3"
                              >
                                Continue
                              </button>

                              {/* Back Button */}
                              <button
                                onClick={handleBackFromManualEntry}
                                className="w-full py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-full transition-colors"
                              >
                                Back
                              </button>
                            </div>
                          </>
                        ) : !selectedPopoverAddress ? (
                          <>
                            {/* Initial view - address search */}
                            <div className="p-4 pb-3">
                              <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Enter Your Address
                              </h3>

                              {/* Address Input */}
                              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors">
                                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                                <input
                                  type="text"
                                  placeholder="Address"
                                  value={addressSearchQuery}
                                  onChange={e => setAddressSearchQuery(e.target.value)}
                                  className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-500"
                                />
                              </div>
                              {/* Address Search Results Section - shown when there's input */}
                              {addressSearchQuery.trim() && (
                                <div className="border border-gray-300 w-full mt-2 rounded-lg">
                                  <div className="max-h-80 overflow-y-auto">
                                    {filteredAddresses.map((address, index) => (
                                      <div key={address.id} className="w-full">
                                        <div
                                          onClick={() => handlePopoverAddressSelect(address)}
                                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors w-full"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                              {address.street}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {address.city} {address.state} {address.zipCode}
                                            </p>
                                          </div>
                                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                                        </div>
                                        {index < filteredAddresses.length - 1 && (
                                          <div className="border-t border-gray-300" />
                                        )}
                                      </div>
                                    ))}

                                    {/* Separator before manual entry */}
                                    {filteredAddresses.length > 0 && (
                                      <div className="border-t border-gray-100" />
                                    )}

                                    {/* Enter address manually option */}
                                    <div
                                      onClick={handleManualEntryClick}
                                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors w-full"
                                    >
                                      <div className="flex items-center min-w-0 flex-1">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                          <Plus className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-gray-900">
                                            Add a new address
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Enter address manually
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Sign in button - always show at bottom */}
                            <div className="p-4 pt-3">
                              <button
                                onClick={() => {
                                  setShowAddressPopover(false);
                                  setAuthModalMode('signin');
                                }}
                                className="w-auto flex items-center py-1.5 px-3 text-xs font-medium text-black bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border border-gray-200"
                              >
                                <svg
                                  className="w-4 h-4 mr-1 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>Sign in for saved address</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Address details view */}
                            <div className="p-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {selectedPopoverAddress.street}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                {selectedPopoverAddress.city} {selectedPopoverAddress.state}{' '}
                                {selectedPopoverAddress.zipCode}
                              </p>

                              {/* Map */}
                              {/* <div className="mb-4">
                                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-3 right-3">
                                    <button className="bg-white px-4 py-1.5 rounded-full shadow-md text-sm font-medium">
                                      Adjust Pin
                                    </button>
                                  </div>
                                </div>
                              </div> */}

                              {/* Apartment Number or Suite */}
                              <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Apartment Number or Suite
                                </label>
                                <input
                                  type="text"
                                  value={apartmentSuite}
                                  onChange={e => setApartmentSuite(e.target.value)}
                                  placeholder="Apartment Number or Suite"
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                />
                              </div>

                              {/* Drop-off Options */}
                              <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                  Drop-off Options
                                </label>
                                <div className="space-y-3">
                                  <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                      <input
                                        type="radio"
                                        name="dropoff"
                                        value="hand"
                                        checked={dropOffOption === 'hand'}
                                        onChange={() => setDropOffOption('hand')}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                          dropOffOption === 'hand'
                                            ? 'border-black'
                                            : 'border-gray-300'
                                        }`}
                                      >
                                        {dropOffOption === 'hand' && (
                                          <div className="w-3 h-3 bg-black rounded-full"></div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                      Hand it to me
                                    </span>
                                  </label>
                                  <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                      <input
                                        type="radio"
                                        name="dropoff"
                                        value="door"
                                        checked={dropOffOption === 'door'}
                                        onChange={() => setDropOffOption('door')}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                          dropOffOption === 'door'
                                            ? 'border-black'
                                            : 'border-gray-300'
                                        }`}
                                      >
                                        {dropOffOption === 'door' && (
                                          <div className="w-3 h-3 bg-black rounded-full"></div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                      Leave it at my door
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* Delivery Instructions */}
                              <div className="mb-4">
                                <textarea
                                  value={deliveryInstructions}
                                  placeholder="e.g. ring the bell after dropoff, leave next to the porch, call upon arrival, etc."
                                  onChange={e => setDeliveryInstructions(e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3">
                                <button
                                  onClick={handleCancelPopoverAddress}
                                  className="flex-1 py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSavePopoverAddress}
                                  className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

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
      <CartSidebar isOpen={isCartOpen} onClose={handleCloseCart} />

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
        onEditAddress={handleEditAddress}
        onManualEntry={handleManualEntry}
        onSelectSearchAddress={handleSelectSearchAddress}
        onAddLabel={() => setShowLabelModal(true)}
      />

      {/* Choose Address to Label Modal */}
      <ChooseAddressLabelModal
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        addresses={addresses}
        onSelectAddress={addressId => {
          setAddressToLabel(addressId);
          setShowLabelModal(false);
          setShowChooseLabelModal(true);
        }}
        onSelectSearchAddress={address => {
          // Store the search result temporarily (without id)
          const { id, ...addressWithoutId } = address;
          setTempAddressData(addressWithoutId);
          setShowLabelModal(false);
          setShowAddressTypeModal(true);
        }}
        onManualEntry={() => {
          setShowLabelModal(false);
          setShowAddAddressModal(true);
        }}
      />

      {/* Choose Label Modal */}
      <ChooseLabelModal
        isOpen={showChooseLabelModal}
        onClose={() => setShowChooseLabelModal(false)}
        currentLabel={addresses.find(a => a.id === addressToLabel)?.personalLabel}
        onSave={label => {
          if (addressToLabel) {
            updateAddress(addressToLabel, { personalLabel: label });
          }
          setShowChooseLabelModal(false);
          setAddressToLabel('');
        }}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false);
          setPendingAddressData(null);
        }}
        onContinue={handleAddAddress}
        onBack={() => {
          setShowAddAddressModal(false);
          setPendingAddressData(null);
          // If address-selection-modal is open, don't open addresses modal
          // Just close add-address-modal and let address-selection-modal remain visible
          if (!showAddressSelectionModal) {
            setShowAddressesModal(true);
          }
        }}
        initialData={
          pendingAddressData
            ? (() => {
                // Extract apartment/suite from street if it exists
                const streetParts = pendingAddressData.street.split(',').map(s => s.trim());
                return {
                  street: pendingAddressData.street,
                  apartmentSuite: streetParts[1] || '',
                  city: pendingAddressData.city,
                  state: pendingAddressData.state,
                  zipCode: pendingAddressData.zipCode,
                };
              })()
            : undefined
        }
      />

      {/* Address Review Error Modal */}
      <AddressReviewErrorModal
        isOpen={showReviewErrorModal}
        onClose={() => {
          setShowReviewErrorModal(false);
          setPendingAddressData(null);
        }}
        onReviewAddress={handleReviewAddress}
        onEnterNewAddress={handleEnterNewAddress}
      />

      {/* Address Type Modal */}
      <AddressTypeModal
        isOpen={showAddressTypeModal}
        onClose={() => {
          setShowAddressTypeModal(false);
          setTempAddressData(null);
        }}
        addressData={
          tempAddressData || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            lat: 0,
            lng: 0,
            addressType: 'house',
          }
        }
        onNext={handleAddressTypeNext}
        onBack={() => {
          setShowAddressTypeModal(false);
          setShowAddressesModal(true);
        }}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        isOpen={showAddressDetailsModal}
        onClose={() => {
          setShowAddressDetailsModal(false);
          setTempAddressData(null);
        }}
        address={
          tempAddressData
            ? (tempAddressData as Address | Omit<Address, 'id'> | undefined)
            : addresses.find(a => a.id === selectedAddressId)
        }
        onSave={handleSaveAddressDetails}
        hideAddressType={!!tempAddressData} // Hide type dropdown when coming from search flow
        onBack={
          tempAddressData
            ? () => {
                setShowAddressDetailsModal(false);
                setShowAddressTypeModal(true);
              }
            : undefined
        }
      />

      {/* Address Selection Modal - Shows when logged in user has no default address */}
      <AddressSelectionModal
        isOpen={showAddressSelectionModal}
        onAddNewAddress={() => setShowAddAddressModal(true)}
      />
    </>
  );
}
