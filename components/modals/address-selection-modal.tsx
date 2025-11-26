'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ChevronRight, Plus, MapPin } from 'lucide-react';
import addressesData from '@/data/addresses.json';
import Image from 'next/image';
import { useUserStore } from '@/store/user-store';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onAddNewAddress: () => void;
  onClose?: () => void;
}

export default function AddressSelectionModal({
  isOpen,
  onAddNewAddress,
  onClose,
}: AddressSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(230);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { addAddress, setDefaultAddress } = useUserStore();

  // Calculate dropdown max height based on available space
  useEffect(() => {
    if (searchQuery.trim() && inputContainerRef.current) {
      const calculateMaxHeight = () => {
        const inputContainer = inputContainerRef.current;
        if (!inputContainer) return;

        const inputRect = inputContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownTop = inputRect.bottom + 8; // mt-2 = 8px
        const availableSpace = viewportHeight - dropdownTop - 16; // 16px padding from bottom
        const maxHeight = Math.max(50, Math.min(availableSpace, 230)); // Min 50px, max 230px

        setDropdownMaxHeight(maxHeight);
      };

      // Calculate immediately
      calculateMaxHeight();

      // Recalculate on window resize
      window.addEventListener('resize', calculateMaxHeight);
      window.addEventListener('scroll', calculateMaxHeight);

      return () => {
        window.removeEventListener('resize', calculateMaxHeight);
        window.removeEventListener('scroll', calculateMaxHeight);
      };
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        searchQuery.trim() &&
        dropdownRef.current &&
        inputContainerRef.current &&
        !dropdownRef.current.contains(target) &&
        !inputContainerRef.current.contains(target)
      ) {
        // Close dropdown if clicking outside the dropdown and input, 
        // including when clicking inside other modals
        setSearchQuery('');
      }
    };

    if (searchQuery.trim()) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [searchQuery]);

  // Handle escape key and outside click to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside the modal, input container, dropdown, or Select dropdown (Radix UI Portal)
      if (
        dialogRef.current &&
        !dialogRef.current.contains(target) &&
        !inputContainerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target) &&
        !target.closest('[data-radix-select-content]') &&
        !target.closest('[data-radix-select-viewport]') &&
        !target.closest('[data-radix-select-item]') &&
        onClose
      ) {
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

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return addressesData
      .filter(
        address =>
          address.street.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.state.toLowerCase().includes(query) ||
          address.zipCode.includes(query)
      )
      .slice(0, 3); // Limit to 3 results
  }, [searchQuery]);

  const handleClearInput = () => {
    setSearchQuery('');
  };

  const handleSelectAddress = (address: any) => {
    // Add address directly with default: true
    const { id, ...addressWithoutId } = address;
    const newAddress = addAddress({
      ...addressWithoutId,
      lat: address.lat || 0,
      lng: address.lng || 0,
      addressType: 'house',
      default: true, // Set as default address
    });
    // Set as default address
    setDefaultAddress(newAddress.id);
    // Clear search query
    setSearchQuery('');
    // The modal will close automatically when default address is detected by the header's useEffect
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    // Close dropdown
    setSearchQuery('');

    // Open add address modal
    onAddNewAddress();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col"
        >
          {/* Non-scrollable content */}
          <div className="px-6 py-6">
            {/* Top Section - Food Icons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/address-selection-image-1.png"
                  alt="Food item 1"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/address-selection-image-2.png"
                  alt="Food item 2"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/address-selection-image-3.png"
                  alt="Food item 3"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-[#191919ff] text-left mb-3">
              Unlock $0 delivery fee on your first order
            </h2>

            {/* Disclaimer */}
            <p className="text-base text-[#191919ff] text-left font-medium mb-4 leading-relaxed">
              Other fees, taxes and gratuity still apply. Enter your exact address to find all available stores and delivery times.
            </p>

            {/* Address Input Label */}
            <label className="block text-base font-bold text-[#191919ff] mb-2">
              Enter delivery address
            </label>

            {/* Address Input Field with Dropdown */}
            <div className="relative" ref={inputContainerRef}>
              <div
                className="relative flex items-center border border-gray-200 rounded-xl px-4 py-2 focus-within:border-2 
              focus-within:border-[#191919ff]"
              >
                <MapPin className="h-5 w-5 text-[#191919ff] flex-shrink-0 mr-2" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter delivery address"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-base text-[#191919ff] placeholder-[#606060ff] bg-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={handleClearInput}
                    className="ml-2 p-0.5 hover:opacity-70 transition-opacity"
                    aria-label="Clear input"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Address Suggestions Dropdown - Positioned below input field */}
              {searchQuery.trim() && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 
                  overflow-y-auto z-[60]"
                  style={{
                    maxHeight: `${dropdownMaxHeight}px`,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f5f9',
                  }}
                >
                  {filteredAddresses?.slice(0, 3)?.map(address => (
                    <div
                      key={address.id}
                      onClick={() => handleSelectAddress(address)}
                      className="pl-4 pr-3 py-1 bg-white hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-[#191919ff]">{address.street}</p>
                          <p className="text-sm text-[#606060ff]">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-[#191919ff] flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}

                  {/* Add a new address option */}
                  <div
                    onClick={handleAddNewAddress}
                    className="pl-4 pr-3 py-1 bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-[#191919ff]">
                            Add a new address
                          </p>
                          <p className="text-sm text-[#191919ff] font-normal">
                            Enter address manually
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-[#191919ff] flex-shrink-0 ml-2" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
