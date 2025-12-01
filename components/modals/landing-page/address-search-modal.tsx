'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Plus, Star } from 'lucide-react';
import addressesData from '@/data/addresses.json';
import { Address } from '@/lib/types/user-types';
import { DashDoorLogoMark } from '@/components/common/Icons';

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  onAddNewAddress: () => void;
  onContinueInApp?: () => void;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onSelectAddress,
  onAddNewAddress,
  onContinueInApp,
}: AddressSearchModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return addressesData
      .filter(address => {
        const fullAddress =
          `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`.toLowerCase();
        return fullAddress.includes(query);
      })
      .slice(0, 3); // Limit to 3 results
  }, [searchQuery]);

  const handleClearInput = () => {
    setSearchQuery('');
  };

  const handleSelectAddress = (address: any) => {
    const addressWithType: Address = {
      ...address,
      addressType: 'house',
    };
    onSelectAddress(addressWithType);
    setSearchQuery('');
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        ref={dialogRef}
        className="relative flex flex-col bg-white max-w-lg rounded-xl p-4 mx-4 w-full"
      >
        {/* Top Section - Search Bar */}
        <div className="flex items-center gap-3 mt-4 mb-2">
          <div
            className="flex-1 relative flex items-center rounded-full px-4 py-2.5 border border-gray-200 
          focus-within:border-[#191919ff] focus-within:border-2 max-w-[260px]"
          >
            <Search className="h-5 w-6 text-[#191919ff] flex-shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Enter delivery address"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-base text-[#191919ff] placeholder-[#606060ff] bg-transparent font-medium px-2"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearInput}
                className="ml-2 p-0.5 hover:opacity-70 transition-opacity"
                aria-label="Clear input"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-base font-bold text-[#191919ff] py-3 hover:bg-gray-100 rounded-full"
          >
            Cancel
          </button>
        </div>

        {/* Middle Section - Address List */}
        <div className="flex-1 overflow-y-auto mx-4">
          {searchQuery.trim() && (
            <div>
              {filteredAddresses?.slice(0, 3)?.map(address => (
                <div key={address.id}>
                  <div
                    onClick={() => handleSelectAddress(address)}
                    className="py-1.5 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-[#191919ff]">{address.street}</p>
                      <p className="text-sm font-medium text-[#606060ff]">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add a new address option */}
              <div onClick={onAddNewAddress} className="py-2 cursor-pointer transition-colors mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Plus className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-medium text-[#191919ff]">Add a new address</p>
                      <p className="text-sm font-normal text-[#191919ff]">Enter address manually</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#191919ff] flex-shrink-0 ml-2" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section - App Promotion */}
        <div className="bg-[#f7f7f7] p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-[60px] h-[60px] bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
              <DashDoorLogoMark width={38} height={20} color="#eb1700ff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-[#191919ff]">Browse faster in the app</p>
              <p className="text-sm text-[#606060ff] font-medium">$0 delivery fee on first order</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    style={{ clipPath: 'inset(0 50% 0 0)' }}
                  />
                </div>
                <span className="text-sm font-medium text-[#606060ff] ml-1">20M ratings</span>
              </div>
            </div>
          </div>
          <button
            onClick={onContinueInApp || onClose}
            className="w-full py-2 px-6 bg-[#eb1700ff] text-white rounded-full font-bold text-base hover:bg-red-700 transition-colors mt-1"
          >
            Continue in app
          </button>
        </div>
      </div>
    </div>
  );
}
