'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { Address } from '@/lib/types/user-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import countriesData from '@/lib/utils/countries.json';
import {
  validateZipCode,
  formatZipCodeInput,
  getZipCodeMaxLength,
  getZipCodeLabel,
} from '@/lib/utils/zip-code-validation';

interface AddAddressModalProps {
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

export default function AddAddressModal({
  isOpen,
  onClose,
  onContinue,
  onBack,
  initialData,
}: AddAddressModalProps) {
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // const handleClickOutside = (event: MouseEvent) => {
    //   const target = event.target as HTMLElement;
    //   // Don't close if clicking inside the modal or inside a Select dropdown (Radix UI Portal)
    //   if (
    //     dialogRef.current &&
    //     !dialogRef.current.contains(target) &&
    //     !target.closest('[data-radix-select-content]') &&
    //     !target.closest('[data-radix-select-viewport]') &&
    //     !target.closest('[data-radix-select-item]')
    //   ) {
    //     onClose();
    //   }
    // };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
      // document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
      // document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
      setState(states[0] || '');
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
      setState(initialData.state || 'Alabama');
      setZipCode(initialData.zipCode || '');
    } else {
      // Reset to defaults if no initial data
      setStreetAddress('');
      setApartmentSuite('');
      setCity('');
      setState(states[0] || 'Alabama');
      setZipCode('');
      setErrors({});
    }
  }, [initialData, isOpen, states]);

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
    
    // Validate ZIP/postal code with country-specific rules
    const zipValidation = validateZipCode(zipCode, country);
    if (!zipValidation.isValid) {
      newErrors.zipCode = zipValidation.error;
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
    const formatted = formatZipCodeInput(e.target.value, country);
    setZipCode(formatted);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div ref={dialogRef} className="relative bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-6">Add new address</h2>

          {/* Form */}
          <div className="space-y-4">
            {/* Country */}
            <div>
              <Label htmlFor="country" className="text-[15px] font-bold text-gray-900 mb-2 block">
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger
                  className="w-full px-4 py-2 border-2 border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 
                  focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg focus:border-[#191919ff] 
                  focus-visible:border-[#191919ff] bg-[#f7f7f7] text-sm h-auto"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {countries.map(c => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger
                    className="w-full px-4 py-2 border-2 border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 
                    focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg focus:border-[#191919ff] 
                    focus-visible:border-[#191919ff] bg-[#f7f7f7] text-sm h-auto"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {states.map((stateName: string) => (
                      <SelectItem key={stateName} value={stateName}>
                        {stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode" className="text-[15px] font-bold text-gray-900 mb-2 block">
                  {getZipCodeLabel(country)}
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={handleZipCodeChange}
                  maxLength={getZipCodeMaxLength(country)}
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
          <div className="mt-8 space-y-3">
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleBack}
              className="w-full py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}