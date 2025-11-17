'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Address } from '@/lib/types/user-types';
import countriesData from '@/lib/utils/countries.json';

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (addressData: Omit<Address, 'id'>) => void;
  onBack?: () => void;
  initialData?: {
    street: string;
    apartmentSuite?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// Filter countries to only show the 4 specified
const AVAILABLE_COUNTRIES = ['United States', 'Canada', 'Australia', 'New Zealand'];

export default function AddNewAddressModal({
  isOpen,
  onClose,
  onContinue,
  onBack,
  initialData,
}: AddNewAddressModalProps) {
  const [country, setCountry] = useState('United States');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartmentSuite, setApartmentSuite] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Alabama');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<{
    streetAddress?: string;
    city?: string;
    zipCode?: string;
  }>({});

  // Get countries data
  const countries = useMemo(() => {
    return (countriesData as any[]).filter(c => AVAILABLE_COUNTRIES.includes(c.name));
  }, []);

  // Get states for selected country
  const states = useMemo(() => {
    const selectedCountry = countries.find(c => c.name === country);
    if (!selectedCountry?.states) return [];

    // Filter states based on country-specific subdivision types
    let filteredStates = selectedCountry.states;

    if (country === 'United States') {
      // US: Only states, not territories/districts
      filteredStates = selectedCountry.states.filter((s: any) => s.subdivision === 'state');
    } else if (country === 'Canada') {
      // Canada: Provinces and territories
      filteredStates = selectedCountry.states.filter(
        (s: any) => s.subdivision === 'province' || s.subdivision === 'territory'
      );
    } else if (country === 'Australia') {
      // Australia: All states (subdivision is null)
      filteredStates = selectedCountry.states;
    } else if (country === 'New Zealand') {
      // New Zealand: All states (includes islands and regional councils)
      filteredStates = selectedCountry.states;
    }

    return filteredStates.map((s: any) => s.name).sort();
  }, [country, countries]);

  // Set default state when country changes
  useEffect(() => {
    if (states.length > 0 && !states.includes(state)) {
      setState(states[0]?.name || '');
    }
  }, [country, states, state]);

  // Update form when initialData changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Extract street and apartment from initial data
      const streetParts = initialData.street.split(',').map(s => s.trim());
      setStreetAddress(streetParts[0] || '');
      setApartmentSuite(initialData.apartmentSuite || streetParts[1] || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setZipCode(initialData.zipCode || '');
    } else {
      // Reset to defaults if no initial data
      setStreetAddress('');
      setApartmentSuite('');
      setCity('');
      setState(states[0]?.name || '');
      setZipCode('');
      setErrors({});
    }
  }, [initialData, isOpen, states]);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleContinue = () => {
    // Validate required fields
    const newErrors: typeof errors = {};

    if (!streetAddress.trim()) {
      newErrors.streetAddress = 'Required field';
    }
    if (!city.trim()) {
      newErrors.city = 'Required field';
    }
    if (!zipCode.trim()) {
      newErrors.zipCode = 'Required field';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    // Combine street address with apartment/suite if provided
    const fullStreetAddress = apartmentSuite
      ? `${streetAddress}, ${apartmentSuite}`.trim()
      : streetAddress.trim();

    const addressData: Omit<Address, 'id'> = {
      street: fullStreetAddress,
      city: city,
      state: state,
      zipCode: zipCode,
      addressType: 'house',
      lat: 0,
      lng: 0,
    };
    onContinue(addressData);
  };

  // Clear error when user starts typing
  const handleStreetAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreetAddress(e.target.value);
    if (errors.streetAddress) {
      setErrors(prev => ({ ...prev, streetAddress: undefined }));
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: undefined }));
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value.replace(/\D/g, '').slice(0, 10));
    if (errors.zipCode) {
      setErrors(prev => ({ ...prev, zipCode: undefined }));
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div ref={dialogRef} className="relative bg-white rounded-xl w-full max-w-md md:max-w-xl mx-4">
        <div className="py-6 px-8 md:px-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-6 mt-12 md:mt-8">
            Add new address
          </h2>

          {/* Form */}
          <div className="space-y-4">
            {/* Country */}
            <div>
              <Label htmlFor="country" className="text-[15px] font-bold text-gray-900 mb-2 block">
                Country
              </Label>
              <div className="relative">
                <select
                  id="country"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 
                  focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg focus:border-[#191919ff] 
                  focus-visible:border-[#191919ff] bg-[#f7f7f7] appearance-none text-sm"
                >
                  {countries.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <Label
                htmlFor="streetAddress"
                className="text-[15px] font-bold text-gray-900 mb-2 block"
              >
                Street Address
              </Label>
              <Input
                id="streetAddress"
                type="text"
                value={streetAddress}
                onChange={handleStreetAddressChange}
                className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg focus-visible:border-[#191919ff] ${
                  errors.streetAddress ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                }`}
              />
              {errors.streetAddress && (
                <div className="flex mt-1 text-[#b71000ff]">
                  <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="text-sm font-medium">{errors.streetAddress}</span>
                </div>
              )}
            </div>

            {/* Apartment/Suite and City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="apartmentSuite"
                  className="text-[15px] font-bold text-gray-900 mb-2 block"
                >
                  Apartment/Suite
                </Label>
                <Input
                  id="apartmentSuite"
                  type="text"
                  value={apartmentSuite}
                  onChange={e => setApartmentSuite(e.target.value)}
                  className="w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg focus-visible:border-[#191919ff] bg-[#f7f7f7]"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-[15px] font-bold text-gray-900 mb-2 block">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg focus-visible:border-[#191919ff] ${
                    errors.city ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                  }`}
                />
                {errors.city && (
                  <div className="flex mt-1 text-[#b71000ff]">
                    <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-medium">{errors.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* State and Zip code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state" className="text-[15px] font-bold text-gray-900 mb-2 block">
                  State
                </Label>
                <div className="relative">
                  <select
                    id="state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 
                    focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg focus:border-[#191919ff] 
                    focus-visible:border-[#191919ff] bg-[#f7f7f7] appearance-none text-sm"
                  >
                    {states.map((stateName: string) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-[15px] font-bold text-gray-900 mb-2 block">
                  Zip code
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={handleZipCodeChange}
                  maxLength={10}
                  className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent rounded-lg focus-visible:border-[#191919ff] ${
                    errors.zipCode ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
                  }`}
                />
                {errors.zipCode && (
                  <div className="flex mt-1 text-[#b71000ff]">
                    <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm font-medium">{errors.zipCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 space-y-2">
            <button
              onClick={handleContinue}
              className="w-full py-2 px-6 bg-[#eb1700ff] text-white rounded-[28px] text-base font-bold hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleBack}
              className="w-full py-2 px-6 text-[#191919ff] font-bold hover:bg-gray-100 rounded-[28px] text-base transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
