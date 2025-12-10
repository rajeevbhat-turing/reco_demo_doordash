'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import countryData from '@/lib/utils/countryCode.json';

interface CountryCodeDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: any) => void;
  selectedCountry: any;
  userCountry?: any;
}

export default function CountryCodeDropdown({
  isOpen,
  onClose,
  onSelect,
  selectedCountry,
  userCountry,
}: CountryCodeDropdownProps) {
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search term
  const filteredCountries = useMemo(
    () =>
      countryData.filter(
        country =>
          country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
          country.dial_code.includes(countrySearchTerm)
      ),
    [countrySearchTerm]
  );

  // Sort countries to show user country first, then USA, then others
  const sortedCountries = useMemo(() => {
    return [...filteredCountries].sort((a, b) => {
      const userCountryCode = userCountry?.code || selectedCountry.code;
      const isUserCountry = (country: any) => country.code === userCountryCode;
      const isUSA = (country: any) => country.code === 'US';

      // If user country is detected and it's not USA
      if (userCountryCode !== 'US') {
        if (isUserCountry(a)) return -1;
        if (isUserCountry(b)) return 1;
        if (isUSA(a)) return -1;
        if (isUSA(b)) return 1;
      } else {
        // If user country is USA or not detected, show USA first
        if (isUSA(a)) return -1;
        if (isUSA(b)) return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }, [filteredCountries, userCountry, selectedCountry]);

  // Handle scroll detection for showing fixed header
  useEffect(() => {
    if (!isOpen) {
      setShowFixedHeader(false);
      return;
    }

    const handleScroll = () => {
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const countryContainer = headerRef.current.closest('.country-container');
        if (countryContainer) {
          const containerRect = countryContainer.getBoundingClientRect();
          // Show fixed header when original header is out of view
          setShowFixedHeader(headerRect.bottom < containerRect.top + 10);
        }
      }
    };

    // Reset fixed header state when dropdown opens
    setShowFixedHeader(false);

    const countryContainer = document.querySelector('.country-container');
    if (countryContainer) {
      countryContainer.addEventListener('scroll', handleScroll);
      return () => countryContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-[100px] left-0 right-[15px] bottom-0 z-20 bg-white rounded-xl">
      {/* Fixed Header - appears when original header is out of view */}
      {showFixedHeader && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-white border-b border-gray-300 p-4 rounded-t-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-[#191919ff] hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-bold text-[#191919ff]">Select Country Code</h3>
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="overflow-y-auto h-full country-container">
        {/* Original Header */}
        <div ref={headerRef} className="mt-4 px-4 pb-4">
          <button
            onClick={onClose}
            className="text-[#191919ff] hover:bg-gray-100 rounded-full p-2 transition-colors ml-[-8px]"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
          <h3 className="text-[32px] font-bold text-[#191919ff]">Select Country Code</h3>
        </div>

        <div className="px-7">
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search countries..."
            value={countrySearchTerm}
            onChange={e => setCountrySearchTerm(e.target.value)}
            className="w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
            focus-visible:border-[#191919ff] rounded-lg bg-[#f7f7f7] mb-2"
          />

          {/* Country List */}
          {sortedCountries.map(country => (
            <button
              key={country.code}
              onClick={() => {
                onSelect(country);
                onClose();
                setCountrySearchTerm('');
              }}
              className="w-full flex items-center justify-between py-1 px-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{country.emoji}</span>
                <div className="text-left flex items-center">
                  <div className="font-medium text-[15px] text-[#191919ff]">{country.name}</div>
                  <div className="text-[15px] font-medium text-[#606060ff] ml-2">
                    {country.dial_code}
                  </div>
                </div>
              </div>
              {selectedCountry.code === country.code && (
                <Check className="h-6 w-6 text-[#191919ff]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
