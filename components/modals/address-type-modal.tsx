'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Home, Building2, Hotel as HotelIcon, Building, MapPin } from 'lucide-react';
import { Address } from '@/lib/types/user-types';

interface AddressTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressData: Omit<Address, 'id' | 'addressType'> & { addressType?: Address['addressType'] };
  onNext: (addressType: Address['addressType']) => void;
  onBack: () => void;
}

export default function AddressTypeModal({
  isOpen,
  onClose,
  addressData,
  onNext,
  onBack,
}: AddressTypeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<Address['addressType']>(
    addressData.addressType || 'house'
  );

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

  const addressTypes = [
    { value: 'house' as const, label: 'House', icon: Home },
    { value: 'apartment' as const, label: 'Apartment', icon: Building2 },
    { value: 'hotel' as const, label: 'Hotel', icon: HotelIcon },
    { value: 'office' as const, label: 'Office', icon: Building },
    { value: 'other' as const, label: 'Other', icon: MapPin },
  ];

  const handleNext = () => {
    onNext(selectedType);
  };

  // Format full address string
  const fullAddress = `${addressData.street}, ${addressData.city} ${addressData.state} ${addressData.zipCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-6">Address type</h2>

          {/* Address Display */}
          <p className="text-gray-900 mb-6">{fullAddress}</p>

          {/* Address Type Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {addressTypes.slice(0, 3).map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    selectedType === type.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Second Row - 2 items */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {addressTypes.slice(3, 5).map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    selectedType === type.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
