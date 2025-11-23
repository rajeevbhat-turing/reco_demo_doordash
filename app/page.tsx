'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  MapPin,
  ChevronRight,
  Plus,
  Navigation,
} from 'lucide-react';
import AuthenticationModal from '@/components/modals/authentication-modal';
import AddNewAddressModal from '@/components/modals/landing-page/add-new-address-modal';
import AddressReviewErrorModal from '@/components/modals/landing-page/address-review-error-modal';
import AddressSearchModal from '@/components/modals/landing-page/address-search-modal';
import { DashDoorLogoMark, DashDoorWordMark } from '@/components/common/Icons';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import addressesData from '@/data/addresses.json';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';
import { PersonIcon } from '@/lib/utils/icons';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import { useTopChains, useTopCuisines, useTopCities } from '@/lib/hooks/use-top-chains';

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>('signin');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'cities' | 'cuisines' | 'chains'>('cities');
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const [showAllChains, setShowAllChains] = useState(false);
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

  // Fetch top chains from API (restaurants with rating > 4.5)
  const { data: topChains = [] } = useTopChains();

  // Derive top cuisines from top chains (cuisines of restaurants with rating > 4.5)
  const topCuisines = useTopCuisines();

  // Derive top cities from top chains (cities of restaurants with rating > 4.5)
  const topCities = useTopCities();

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
      .filter(
        address =>
          address.street.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.state.toLowerCase().includes(query) ||
          address.zipCode.includes(query)
      )
      .slice(0, 5); // Limit to 5 results
  }, [addressSearchQuery]);

  // Handle address selection
  const handleSelectAddress = (address: (typeof addressesData)[0]) => {
    setAddressSearchQuery(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);
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
  const handleReviewErrorModalClose = () => {
    setShowReviewErrorModal(false);
    setPendingAddressData(null);
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
      <div className="w-full bg-white md:hidden">
        <div className="w-full max-w-7xl mx-auto px-4 pb-3 pt-5 flex items-center justify-between gap-4">
          {/* Left: App Icon and Text */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-gray-200">
                <DashDoorLogoMark width={54} height={30} />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#191919ff] truncate">
                Browse faster in the app
              </h3>
              <p className="text-sm text-[#606060ff] font-medium truncate">
                $0 delivery fee on first order
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(star => (
                  <Star
                    key={star}
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    fill="currentColor"
                  />
                ))}
                {/* Half star */}
                <div className="relative w-4 h-4">
                  <Star className="w-4 h-4 text-yellow-400 absolute" fill="transparent" />
                  <div className="absolute overflow-hidden w-2 h-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" fill="currentColor" />
                  </div>
                </div>
                <span className="text-sm font-medium text-[#606060ff] ml-1">20M ratings</span>
              </div>
            </div>
          </div>

          {/* Right: Open Button */}
          <button className="bg-[#eb1700ff] text-white font-bold text-base px-3 py-1 rounded-[28px] flex-shrink-0 hover:bg-red-600">
            Open
          </button>
        </div>
      </div>

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
          <button className="bg-[#d91400ff] text-white text-base font-bold px-3 py-2 hover:bg-red-700 rounded-[28px]">
            Open App
          </button>
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
          <button className="bg-[#d91400ff] text-white text-sm font-bold px-1.5 py-2 hover:bg-red-700 rounded-[28px] sm:text-base sm:px-3 
          sm:py-3.5">
            Open App
          </button>
        </div>
      </div>

      {/* Top section */}
      <div className="bg-[#2f477f] h-[650px] relative flex flex-col items-center justify-center mt-[-64px] overflow-hidden">
        {/* Left image banner */}
        <div className="absolute top-0 bottom-0" style={{ left: `-${imageOffset}px` }}>
          <Image
            src="/landing-page/food-image-1.png"
            alt="Landing page left banner"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right image banner */}
        <div className="absolute top-0 bottom-0" style={{ right: `-${imageOffset}px` }}>
          <Image
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

                {/* Legal Disclaimer */}
                <p className="text-xs text-[#606060ff] mb-4 leading-relaxed font-bold">
                  By clicking on any "Continue" button, you agree to DoorDash's{' '}
                  {/* <a href="" className="text-[#1700ee] underline hover:text-blue-700"> */}
                    Terms and Conditions
                  {/* </a> */}
                  {' '}
                  and{' '}
                  {/* <a href="" className="text-[#1700ee] underline hover:text-blue-700"> */}
                    Privacy Policy
                  {/* </a> */}
                  .
                </p>

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
                    {filteredAddresses?.slice(0, 3)?.map((address, index) => (
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
      <div className="w-full px-4 pt-6 md:hidden">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-[#f7f7f7ff] rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-[#f5f5f5] max-w-[400px] mx-auto">
            {/* Top Section: Icon and Text */}
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="flex-shrink-0">
                <div className="w-[60px] h-[60px] rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <DashDoorLogoMark width={44} height={20} />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#191919ff]">Browse faster in the app</h3>
                <p className="text-sm text-[#606060ff] font-medium mb-1">
                  $0 delivery fee on first order
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                  <span className="text-sm font-medium text-[#606060ff] ml-1">20M ratings</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <button className="w-full bg-[#eb1700ff] text-white font-bold text-base py-2 rounded-[28px] hover:bg-red-600">
              Continue in app
            </button>
          </div>
        </div>
      </div>

      {/* Content section 1 */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-20 pb-[120px] md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Become a Dasher */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <Image
                src="/landing-page/dasher.png"
                alt="Dasher"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">Become a Dasher</h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                As a delivery driver, make money and work on your schedule. Sign up in minutes.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Start earning
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>

          {/* Become a Merchant */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <Image
                src="/landing-page/merchant.png"
                alt="Merchant"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">Become a Merchant</h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                Attract new customers and grow sales, starting with 0% commissions for up to 30
                days.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Sign up for DashDoor
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>

          {/* Get the best DashDoor experience */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <Image
                src="/landing-page/mobile.png"
                alt="Mobile app"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">
                Get the best DashDoor experience
              </h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                Experience the best your neighborhood has to offer, all in one app.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Get the app
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 2 */}
      <div className="relative pb-0">
        <div className="w-full max-w-7xl mx-auto px-6 bg-[#fef1ee] md:bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
            {/* Left column - Text content */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1 order-2 md:order-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] md:mb-4 leading-[40px]">
                Everything you crave, delivered.
              </h2>
              <h3 className="text-lg md:text-xl font-bold text-[#191919ff] mb-2">
                Your favorite local restaurants
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Get a slice of pizza or the whole pie delivered, or pick up house lo mein from the
                Chinese takeout spot you've been meaning to try.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Find restaurants
              </button>
            </div>

            {/* Right column - Image */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2 order-1 md:order-2 -mt-10 md:mt-0">
              <Image
                src="/landing-page/gallery-1.png"
                alt="Person enjoying delivered food outdoors"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content section 3 */}
      <div className="bg-[#fef1ee] pt-10 md:pt-20 pb-6 lg:pt-24 relative z-0 md:-mt-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Image - 1 column on md, 2 columns on lg */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2">
              <Image
                src="/landing-page/gallery-2.png"
                alt="DashPass food items"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>

            {/* Text content - 1 column on both md and lg */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-4 leading-tight">
                DashPass is delivery for less
              </h2>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Members get a $0 delivery fee on DashPass orders, 5% back on pickup orders, and so
                much more. Plus, it's free for 30 days.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Get DashPass
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Content section 6 */}
      <div className="bg-[#fef1ee] py-10 md:-mt-6 md:pt-20 md:pb-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#191919ff] mb-12 max-w-[320px] md:max-w-[450px] mx-auto">
            Helping you with to-dos and gifting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Item 1: Beauty essentials */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <Image
                  src="/landing-page/gallery-5.png"
                  alt="Beauty essentials"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Beauty essentials from top brands
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Get all your beauty and self-care needs delivered at home or on-the-go
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Shop beauty
              </button>
            </div>

            {/* Item 2: Flowers */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <Image
                  src="/landing-page/gallery-6.png"
                  alt="Flowers"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Flowers for any occasion
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Shop hand-picked and thoughtfully-arranged blooms from florists near you.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Send Flowers
              </button>
            </div>

            {/* Item 3: Restock the minibar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <Image
                  src="/landing-page/gallery-7.png"
                  alt="Restock the minibar"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Restock the minibar
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Hosting a get-together or need a special cocktail ingredient? Get liquor, beer,
                mixers, champagne and wine delivered fast.*
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit mb-3"
              >
                Shop Alcohol
              </button>
              <p className="text-xs md:text-sm font-medium text-[#191919ff]">
                *Must be 21+. Enjoy responsibly.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* White bg on small screens */}
      <div className="w-full h-[180px] md:h-0 md:w-0"></div>

      {/* Content section 7 */}
      <div className="relative pb-0">
        <div className="w-full max-w-7xl mx-auto px-6 md:pt-16 bg-[#fef1ee] md:bg-transparent relative">
          <div className="relative -top-[140px] md:top-0 mb-[-140px] md:mb-0">
            <h2
              className="text-2xl md:text-3xl font-bold text-center text-[#191919ff] mb-8 md:mb-12 max-w-[320px] 
            md:max-w-[450px] mx-auto"
            >
              Unlocking opportunity for Dashers and businesses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
              {/* Left column - Text content */}
              <div className="flex flex-col md:col-span-1 lg:col-span-1 order-2 md:order-1">
                <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] md:mb-4 leading-[40px]">
                  Sign up to dash and get paid
                </h2>
                <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                  Deliver with the #1 Food and Drink App in the U.S. As a delivery driver, you'll
                  make money and work on your schedule. Sign up in minutes.
                </p>
                <button
                  className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
                >
                  Become a Dasher
                </button>
              </div>

              {/* Right column - Image */}
              <div className="w-full relative z-10 md:col-span-1 lg:col-span-2 order-1 md:order-2">
                <Image
                  src="/landing-page/gallery-9.png"
                  alt="Dasher delivery driver"
                  width={700}
                  height={500}
                  className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 8 */}
      <div className="bg-[#fef1ee] pt-10 md:pt-20 pb-6 lg:pt-24 relative z-0 md:-mt-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Image - 1 column on md, 2 columns on lg */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2">
              <Image
                src="/landing-page/gallery-10.png"
                alt="Business partner"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>

            {/* Text content - 1 column on both md and lg */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-4 leading-tight">
                Grow your business with DashDoor
              </h2>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Businesses large and small partner with DashDoor to reach new customers, increase
                order volume, and drive more sales.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Get more from your neighborhood section */}
      <div className="w-full bg-white py-12">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#191919ff] mb-6">
            Get more from your neighborhood
          </h2>

          {/* Tabs */}
          <div className="grid grid-cols-3 mb-6 border-b border-gray-200 w-full">
            <button
              onClick={() => setActiveTab('cities')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'cities'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Cities
            </button>
            <button
              onClick={() => setActiveTab('cuisines')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'cuisines'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Cuisines
            </button>
            <button
              onClick={() => setActiveTab('chains')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'chains'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Chains
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            {activeTab === 'cities' && (
              <div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                    !showAllCities ? 'mb-6' : ''
                  }`}
                >
                  {(showAllCities ? topCities : topCities.slice(0, 15)).map((city, index) => (
                    <div
                      key={`city-${city.name}-${index}`}
                      className="text-base font-medium text-[#191919ff] hover:underline"
                    >
                      {city.name}
                    </div>
                  ))}
                </div>
                {topCities.length > 15 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2 text-[#191919ff]">
                      {showAllCities ? (
                        <>
                          <span className="font-bold text-xl">See less</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCities(false)}
                          >
                            <ChevronUp className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xl">See more</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCities(true)}
                          >
                            <ChevronDown className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cuisines' && (
              <div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                    !showAllCuisines ? 'mb-6' : ''
                  }`}
                >
                  {(showAllCuisines ? topCuisines : topCuisines.slice(0, 15)).map(
                    (cuisine, index) => (
                      <div
                        key={`cuisine-${cuisine.name}-${index}`}
                        className="text-base font-medium text-[#191919ff] hover:underline"
                      >
                        {cuisine.name}
                      </div>
                    )
                  )}
                </div>
                {topCuisines.length > 15 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2 text-[#191919ff]">
                      {showAllCuisines ? (
                        <>
                          <span className="font-bold text-xl">See less</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCuisines(false)}
                          >
                            <ChevronUp className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xl">See more</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCuisines(true)}
                          >
                            <ChevronDown className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chains' && (
              <div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                    !showAllChains ? 'mb-6' : ''
                  }`}
                >
                  {(showAllChains ? topChains : topChains.slice(0, 15)).map((chain, index) => (
                    <div
                      key={`chain-${chain.id}-${index}`}
                      className="text-base font-medium text-[#191919ff] hover:underline"
                    >
                      {chain.name}
                    </div>
                  ))}
                </div>
                {topChains.length > 15 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2 text-[#191919ff]">
                      {showAllChains ? (
                        <>
                          <span className="font-bold text-xl">See less</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllChains(false)}
                          >
                            <ChevronUp className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xl">See more</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllChains(true)}
                          >
                            <ChevronDown className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
