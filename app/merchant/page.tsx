'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, ChevronRight } from 'lucide-react';
import { DashDoorLogoMark } from '@/components/common/Icons';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';
import addressesData from '@/data/addresses.json';

export default function MerchantLandingPage() {
  const router = useRouter();
  const setTempStore = useMerchantAuthStore(state => state.setTempStore);
  const getMerchantByEmail = useMerchantAuthStore(state => state.getMerchantByEmail);
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAddressCoords, setSelectedAddressCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const addressInputRef = useRef<HTMLDivElement>(null);

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!addressSearchQuery.trim()) return addressesData.slice(0, 5); // Show first 5 when empty

    const query = addressSearchQuery.toLowerCase();
    return addressesData
      .filter(address => {
        const fullAddress =
          `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`.toLowerCase();
        return fullAddress.includes(query);
      })
      .slice(0, 5); // Limit to 5 results
  }, [addressSearchQuery]);

  // Handle address selection
  const handleSelectAddress = (address: (typeof addressesData)[0]) => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    setStoreAddress(fullAddress);
    setAddressSearchQuery(fullAddress);
    setSelectedAddressCoords({ lat: address.lat, lng: address.lng });
    setShowAddressDropdown(false);
    if (errors.storeAddress) {
      setErrors(prev => ({ ...prev, storeAddress: '' }));
    }
  };

  // Handle input change for address
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressSearchQuery(value);
    setStoreAddress(''); // Clear selected address when typing
    setSelectedAddressCoords(null); // Clear coords when typing
    setShowAddressDropdown(true);
    if (errors.storeAddress) {
      setErrors(prev => ({ ...prev, storeAddress: '' }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
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

  // Validate email format
  const isValidEmail = (emailValue: string): boolean => {
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(emailValue);
  };

  // Validate phone number format (US format)
  const isValidPhone = (phoneValue: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phoneValue.replace(/\D/g, '');
    // Must have exactly 10 digits (US phone number)
    return digitsOnly.length === 10;
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length <= 3) return `(${digitsOnly}`;
    if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    if (!storeAddress.trim()) {
      newErrors.storeAddress = 'Please select a store address';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    } else {
      // Check if email already exists in merchant auth store
      const existingMerchant = getMerchantByEmail(email);
      if (existingMerchant) {
        newErrors.email = 'An account with this email already exists';
      }
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Save temp store data
      setTempStore({
        storeName,
        storeAddress,
        email,
        phone,
        businessType: 'restaurant',
        lat: selectedAddressCoords?.lat,
        lng: selectedAddressCoords?.lng,
      });
      // Navigate to sign up page with store email
      router.push(`/merchant/auth/user/signup?store_email=${encodeURIComponent(email)}`);
    }
  };

  const handleLogin = () => {
    router.push('/merchant/auth');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(87, 0, 0)' }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo and Wordmark */}
          <div className="flex items-center gap-2">
            <DashDoorLogoMark color="##0066cc" width={32} height={18} />
            <span className="font-semibold text-lg">Merchants</span>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-[#EB1700] text-white font-semibold rounded-full hover:bg-[#c91400] transition-colors"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 w-full lg:w-1/2">
            {/* Headline */}
            <h1 className="text-lg md:text-xl lg:text-3xl font-black text-white mb-8 uppercase tracking-tight leading-tight">
              Sign up for
              <br />
              DashDoor and
              <br />
              unlock sales.
            </h1>

            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl max-w-md">
              <h2 className="text-xl font-bold text-[#570000] uppercase mb-2">
                0% Commissions for up to 30 Days
              </h2>
              <p className="text-gray-700 mb-6 text-sm">
                Partner with DashDoor to help drive growth and take your business to the next level.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Store Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Store name"
                    value={storeName}
                    onChange={e => {
                      setStoreName(e.target.value);
                      if (errors.storeName) {
                        setErrors(prev => ({ ...prev, storeName: '' }));
                      }
                    }}
                    className={`w-full px-3 py-1.5 bg-gray-50 border-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#191919] ${
                      errors.storeName ? 'border-[#EB1700]' : 'border-transparent'
                    }`}
                  />
                  {errors.storeName && (
                    <p className="text-[#EB1700] text-xs mt-1">{errors.storeName}</p>
                  )}
                </div>

                {/* Store Address with Dropdown */}
                <div ref={addressInputRef} className="relative">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search store address"
                      value={addressSearchQuery}
                      onChange={handleAddressInputChange}
                      onFocus={() => setShowAddressDropdown(true)}
                      className={`w-full pl-10 pr-3 py-1.5 bg-gray-50 border-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#191919] ${
                        errors.storeAddress ? 'border-[#EB1700]' : 'border-transparent'
                      }`}
                    />
                  </div>

                  {/* Address Dropdown */}
                  {showAddressDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredAddresses.length > 0 ? (
                        filteredAddresses.map(address => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleSelectAddress(address)}
                            className="w-full flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex flex-col min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {address.street}
                              </p>
                              <p className="text-xs text-gray-500">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-gray-500 text-center">
                          No addresses found
                        </div>
                      )}
                    </div>
                  )}

                  {errors.storeAddress && (
                    <p className="text-[#EB1700] text-xs mt-1">{errors.storeAddress}</p>
                  )}
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      className={`w-full px-3 py-1.5 bg-gray-50 border-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#191919] ${
                        errors.email ? 'border-[#EB1700]' : 'border-transparent'
                      }`}
                    />
                    {errors.email && <p className="text-[#EB1700] text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={phone}
                      onChange={e => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhone(formatted);
                        if (errors.phone) {
                          setErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      maxLength={14}
                      className={`w-full px-3 py-1.5 bg-gray-50 border-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#191919] ${
                        errors.phone ? 'border-[#EB1700]' : 'border-transparent'
                      }`}
                    />
                    {errors.phone && <p className="text-[#EB1700] text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Terms Text */}
                <p className="text-xs text-gray-600">
                  By clicking &quot;Start Free Trial,&quot; I agree to receive marketing electronic
                  communications from DashDoor.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-1.5 text-base bg-[#EB1700] text-white font-bold rounded-full hover:bg-[#c91400] transition-colors"
                >
                  Start Free Trial
                </button>
              </form>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                src="/landing-page/gallery-7.png"
                alt="Merchant partners"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
