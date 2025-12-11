'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowRight, Search, MapPin, ChevronRight, Plus, Navigation } from 'lucide-react';
import AuthenticationModal from '@/components/modals/authentication-modal';
import AddNewAddressModal from '@/components/modals/landing-page/add-new-address-modal';
import AddressReviewErrorModal from '@/components/modals/landing-page/address-review-error-modal';
import AddressSearchModal from '@/components/modals/landing-page/address-search-modal';
// import NeighbourhoodSection from '@/components/landing-page/neighbourhood-section';
// import ContentSections from '@/components/landing-page/content-sections';
// import AppPromo from '@/components/landing-page/app-promo';
// import AppBanner from '@/components/landing-page/app-banner';
import { DashDoorLogoMark, DashDoorWordMark } from '@/components/common/Icons';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import addressesData from '@/data/addresses.json';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';
import { PersonIcon } from '@/lib/utils/icons';
import { isValidEmail } from '@/lib/utils/helperFunctions';

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>('signin');
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageOffset, setImageOffset] = useState(0);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showReviewErrorModal, setShowReviewErrorModal] = useState(false);
  const [pendingAddressData, setPendingAddressData] = useState<Omit<Address, 'id'> | null>(null);
  const [showAddressSearchModal, setShowAddressSearchModal] = useState(false);
  const [showSignInUI, setShowSignInUI] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInEmailError, setSignInEmailError] = useState('');

  const { setTempAddress } = useUserStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    let ticking = false;

    // Handles scroll events to toggle header visibility based on scroll position
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(isMobile ? window.scrollY > 150 : window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Calculates image offset based on viewport width
    const calculateOffset = () => {
      const vw = window.innerWidth;
      // As viewport gets smaller, increase the offset (move images further out)
      const offset = Math.max(0, (1920 - vw) * (isMobile ? 0.25 : 0.3));
      setImageOffset(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateOffset, { passive: true });
    calculateOffset(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateOffset);
    };
  }, [isMobile]);

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!addressSearchQuery.trim()) return [];

    const query = addressSearchQuery.toLowerCase();
    return addressesData
      .filter(address => {
        const fullAddress =
          `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`.toLowerCase();
        return fullAddress.includes(query);
      })
      .slice(0, 3); // Limit to 3 results
  }, [addressSearchQuery]);

  // Handle address selection
  const handleSelectAddress = (address: (typeof addressesData)[0]) => {
    setAddressSearchQuery(
      `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`
    );
    const tempAddress: Address = {
      id: 'temp-address',
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      lat: address.lat,
      lng: address.lng,
      addressType: 'house', // default type
    };
    setTempAddress(tempAddress);
    setShowAddressDropdown(false);
  };

  // Handle input change
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressSearchQuery(e.target.value);
    setShowAddressDropdown(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-address-input]')) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAddressDropdown]);

  // Display Add Address Modal
  const handleDisplayAddAddressModal = () => {
    // On small screens, show address search modal instead
    if (isMobile) {
      setShowAddressDropdown(false);
      setShowAddressSearchModal(true);
    } else {
      setShowAddAddressModal(true);
      setShowAddressDropdown(false);
    }
  };

  // Handle address form submission
  const handleAddAddressContinue = (addressData: Omit<Address, 'id'>) => {
    // Show review error modal instead of setting temp address directly
    setPendingAddressData(addressData);
    setShowAddAddressModal(false);
    setShowReviewErrorModal(true);
  };

  // Handle address selection from search modal
  const handleSearchModalSelectAddress = (address: Address) => {
    const tempAddress: Address = {
      id: 'temp-address',
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      lat: address.lat || 0,
      lng: address.lng || 0,
      addressType: address.addressType || 'house',
    };
    setTempAddress(tempAddress);
    setShowAddressSearchModal(false);
  };

  // Handle add new address from search modal
  const handleSearchModalAddNewAddress = () => {
    setShowAddressSearchModal(false);
    setShowAddAddressModal(true);
  };

  // Handle review error modal close
  const handleReviewErrorModalClose = useCallback(() => {
    setShowReviewErrorModal(false);
    setPendingAddressData(null);
  }, []);

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

  // Handle sign in UI button click
  const handleSignInForSavedAddress = () => {
    setShowSignInUI(true);
  };

  // Handle sign-in email continue
  const handleSignInEmailContinue = () => {
    // Validate email
    if (!signInEmail.trim()) {
      setSignInEmailError('Email is required');
      return;
    }
    if (!isValidEmail(signInEmail)) {
      setSignInEmailError('Email format is invalid');
      return;
    }

    // Clear error and open auth modal with prefilled email
    setSignInEmailError('');
    setAuthModalMode('signin');
  };

  // Handle search nearby link
  const handleSearchNearby = () => {
    setShowSignInUI(false);
    setSignInEmail('');
    setSignInEmailError('');
  };

  return (
    <div className="bg-white">
      {/* App Banner - Mobile Only */}
      {/* <AppBanner /> */}

      {/* Transparent Header (at top) */}
      <div
        className={`w-full bg-transparent relative top-0 left-0 right-0 z-20 px-6 flex items-center justify-center h-16 
          transition-opacity duration-200 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <div className="items-center justify-center gap-2.5 hidden md:flex">
          <DashDoorLogoMark color="#fff" width={42} height={24} />
          <DashDoorWordMark color="#fff" width={155} height={18} />
        </div>

        {/* Sign in / Sign up */}
        <div className="absolute right-6 top-0 bottom-0 items-center gap-2 hidden md:flex">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-[#d91400ff] text-white text-lg font-bold px-3 py-2 hover:bg-red-700 rounded-[28px]"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('signup')}
            className="bg-white text-[#606060ff] text-lg font-bold px-3 py-2 hover:bg-gray-100 rounded-[28px]"
          >
            Sign Up
          </button>
        </div>

        {/* Login / Open App buttons */}
        <div className="absolute right-6 top-0 bottom-0 items-center gap-2 flex md:hidden">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-white text-[#606060ff] font-bold text-base px-3 py-2 hover:bg-gray-100 rounded-[28px]"
          >
            Login
          </button>
          {/* <button className="bg-[#d91400ff] text-white text-base font-bold px-3 py-2 hover:bg-red-700 rounded-[28px]">
            Open App
          </button> */}
        </div>
      </div>

      {/* Fixed White Header (on scroll) */}
      <div
        className={`w-full bg-white fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-2 h-[72px] md:h-[50px] border-b 
          border-gray-200 shadow-sm transition-opacity duration-200 ${
            isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Desktop: Logo */}
        <div className="items-center gap-2 hidden md:flex">
          <DashDoorLogoMark width={32} height={18} />
          <div className="hidden lg:block">
            <DashDoorWordMark width={112} height={15} />
          </div>
        </div>

        {/* Mobile: Address Input Button */}
        <div className="flex-1 flex md:hidden px-2">
          <div className="w-full rounded-full px-3.5 py-1.5 flex items-center gap-3 border border-gray-200">
            <Search className="w-5 h-6 text-[#191919ff] flex-shrink-0" />
            <span
              className="text-xs font-medium text-[#606060ff] flex-1 text-left cursor-text sm:text-base"
              onClick={() => setShowAddressSearchModal(true)}
            >
              Enter delivery address
            </span>
            <div className="w-10 h-10 bg-[#eb1700ff] rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Desktop: Sign in / Sign up */}
        <div className="items-center gap-2 hidden md:flex">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-[#eb1700ff] text-white text-lg font-bold px-3 py-1.5 hover:bg-red-600 rounded-[28px]"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('signup')}
            className="text-[#606060ff] font-bold px-3 py-2 rounded-[28px]"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile: Login / Open App buttons */}
        <div className="flex items-center gap-2 md:hidden px-2">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-white text-[#606060ff] font-bold text-base px-3 py-3.5 rounded-[28px]"
          >
            Login
          </button>
          {/* <button
            className="bg-[#d91400ff] text-white text-sm font-bold px-1.5 py-2 hover:bg-red-700 rounded-[28px] sm:text-base sm:px-3 
          sm:py-3.5"
          >
            Open App
          </button> */}
        </div>
      </div>

      {/* Top section */}
      <div className="bg-[#2f477f] min-h-[100vh] relative flex flex-col items-center justify-center mt-[-64px] overflow-hidden">
        {/* Left image banner */}
        <div className="absolute top-0 bottom-0" style={{ left: `-${imageOffset}px` }}>
          <img
            src="/landing-page/food-image-1.png"
            alt="Landing page left banner"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right image banner */}
        <div className="absolute top-0 bottom-0" style={{ right: `-${imageOffset}px` }}>
          <img
            src="/landing-page/food-image-2.png"
            alt="Landing page right banner"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center relative z-10">
          <div className="max-w-[320px] mx-auto md:max-w-[550px] lg:max-w-none mb-5 flex-grow-1">
            <div className="flex items-center justify-center gap-2 mb-4 md:hidden">
              <DashDoorLogoMark width={32} height={18} color="#fff" />
              <DashDoorWordMark width={112} height={15} color="#fff" />
            </div>
            <h1 className="text-white text-3xl md:text-[40px] font-black mb-2">
              $0 DELIVERY FEE ON FIRST ORDER
            </h1>
            <span className="text-white text-xs font-semibold mb-4">Other fees may apply</span>
          </div>

          {/* Sign In UI or Address Input Field */}
          {showSignInUI ? (
            <div className="w-[470px] max-w-[90vw] mx-auto mb-4">
              {/* Sign In Card */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                {/* Email Input */}
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Enter email to get started"
                    value={signInEmail}
                    onChange={e => {
                      setSignInEmail(e.target.value);
                      if (signInEmailError) setSignInEmailError('');
                    }}
                    className={`w-full px-4 py-2 lg:py-3 rounded-[28px] text-base font-medium text-[#191919ff] placeholder-[#606060ff] 
                      focus:outline-none focus:ring-2 focus:ring-[#191919ff] focus:ring-offset-0 shadow-lg
                      ${signInEmailError ? 'bg-[#fef0ed]' : 'bg-[#f7f7f7]'}`}
                    autoFocus
                  />
                  {signInEmailError && (
                    <div className="mt-2 flex items-center gap-1 ml-0.5">
                      <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-[#b71000ff]">
                        <span className="text-[#b71000ff] text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm font-medium text-[#b71000ff]">{signInEmailError}</p>
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleSignInEmailContinue}
                  className="w-full py-2 lg:py-3 px-6 bg-[#eb1700ff] text-white rounded-[28px] text-base font-bold hover:bg-red-700 
                  transition-colors mb-4"
                >
                  Continue
                </button>

                {/* Separator */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-400"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-[#b2b2b2ff] text-base font-medium -mt-1">
                      or
                    </span>
                  </div>
                </div>

                {/* Search nearby link */}
                <div className="text-center">
                  <button
                    onClick={handleSearchNearby}
                    className="text-[#191919ff] underline text-sm font-bold"
                  >
                    Search nearby
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Address Input Field */}
              <div
                className="w-full max-w-[280px] md:max-w-[400px] lg:max-w-[450px] mx-auto relative mb-4"
                data-address-input
              >
                <div
                  className="relative flex items-center bg-white rounded-[32px] shadow-md border-2 border-transparent pl-3 md:pl-4 pr-1.5 
            py-1.5 focus-within:border-[#191919ff]"
                >
                  <MapPin className="h-6 w-6 text-[#191919ff] flex-shrink-0 hidden md:block" />
                  <Search className="h-6 w-5 text-[#191919ff] flex-shrink-0 block md:hidden" />
                  <input
                    type="text"
                    placeholder="Enter delivery address"
                    value={addressSearchQuery}
                    onChange={handleAddressInputChange}
                    contentEditable={!isMobile}
                    onFocus={e => (isMobile ? e.target.blur() : {})}
                    onClick={e => {
                      // On small screens, show modal instead of dropdown
                      if (isMobile) {
                        e.preventDefault();
                        setShowAddressSearchModal(true);
                      }
                    }}
                    className="flex-1 px-2 md:px-4 outline-none text-base font-medium text-[#191919ff] placeholder-[#606060ff] 
                max-w-[195px] md:max-w-none"
                  />
                  <button
                    className="bg-[#eb1700ff] text-white rounded-full w-10 h-10 flex items-center justify-center  
              flex-shrink-0 hover:bg-red-600 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>

                {/* Address Dropdown */}
                {showAddressDropdown && addressSearchQuery.trim() && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-sm shadow-lg border border-gray-200 
              max-h-[260px] overflow-y-auto z-50"
                  >
                    {filteredAddresses?.map(address => (
                      <div
                        onClick={() => handleSelectAddress(address)}
                        key={`address-dropdown-item-${address.id}`}
                        className="flex items-center justify-between py-2 pl-3 pr-3.5 hover:bg-gray-100 cursor-pointer transition-colors 
                    border-b border-gray-200"
                      >
                        <div className="flex flex-col min-w-0 text-left">
                          <p className="text-base font-medium text-[#191919ff]">{address.street}</p>
                          <p className="text-sm font-medium text-[#606060ff]">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-[#191919ff] flex-shrink-0 ml-2" />
                      </div>
                    ))}

                    {/* Add a new address option */}
                    <div
                      onClick={handleDisplayAddAddressModal}
                      className="px-3 py-1.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-[20px] h-[20px] bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-base font-medium text-[#191919ff]">
                              Add a new address
                            </p>
                            <p className="text-sm text-[#606060ff] font-normal">
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

              <div className="flex items-center gap-2 w-full max-w-[280px] md:max-w-none mx-auto justify-between md:justify-center">
                {/* Sign in for saved address button */}
                <button
                  onClick={handleSignInForSavedAddress}
                  className="bg-white text-[#191919ff] rounded-[28px] shadow-lg px-3 py-1.5 flex items-center 
                justify-center gap-1 hover:bg-gray-50 transition-colors"
                >
                  <PersonIcon />
                  <span className="text-sm font-bold hidden lg:block">
                    Sign in for saved address
                  </span>
                  <span className="text-sm font-bold hidden md:block lg:hidden">Sign In</span>
                  <span className="text-sm font-bold block md:hidden">Log In</span>
                </button>

                {/* Use current location */}
                <button
                  onClick={() => {
                    // Do nothing for now
                  }}
                  className="bg-white text-[#191919ff] rounded-[28px] shadow-lg px-3 py-1.5 flex items-center 
            justify-center gap-1 hover:bg-gray-50 transition-colors md:hidden"
                >
                  <Navigation className="h-4 w-4 text-[#191919ff] flex-shrink-0 fill-current" />
                  <span className="text-sm font-bold">Use current location</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* App Promo Card - Mobile Only */}
      {/* <AppPromo /> */}

      {/* Content sections */}
      {/* <ContentSections /> */}

      {/* Get more from your neighborhood section */}
      {/* <NeighbourhoodSection /> */}

      {/* Authentication Modal */}
      {authModalMode && (
        <AuthenticationModal
          onClose={() => setAuthModalMode(null)}
          defaultMode={authModalMode}
          initialEmail={signInEmail}
        />
      )}

      {/* Add Address Modal */}
      <AddNewAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onContinue={handleAddAddressContinue}
        initialData={
          pendingAddressData
            ? {
                street: pendingAddressData.street,
                city: pendingAddressData.city,
                state: pendingAddressData.state,
                zipCode: pendingAddressData.zipCode,
              }
            : undefined
        }
      />

      {/* Address Review Error Modal */}
      <AddressReviewErrorModal
        isOpen={showReviewErrorModal}
        onClose={handleReviewErrorModalClose}
        onReviewAddress={handleReviewAddress}
        onEnterNewAddress={handleEnterNewAddress}
      />

      {/* Address Search Modal - Mobile Only */}
      <AddressSearchModal
        isOpen={showAddressSearchModal}
        onClose={() => setShowAddressSearchModal(false)}
        onSelectAddress={handleSearchModalSelectAddress}
        onAddNewAddress={handleSearchModalAddNewAddress}
      />
    </div>
  );
}