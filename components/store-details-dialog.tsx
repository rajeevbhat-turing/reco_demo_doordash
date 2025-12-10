'use client';

import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Clock, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface StoreDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  store: {
    id: string;
    name: string;
    logo?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    address?: string; // Fallback for backward compatibility
    isOpen: boolean;
    openingHours: string;
    phone: string;
  };
  isRestaurantOpen?: boolean;
}

export default function StoreDetailsDialog({
  isOpen,
  onClose,
  store,
  isRestaurantOpen,
}: StoreDetailsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [showHours, setShowHours] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-[8px] w-full max-w-[480px] max-h-[80vh] overflow-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10" aria-label="Close dialog">
          <X className="h-6 w-6 text-gray-500" />
        </button>

        <div className="p-6">
          {/* Store Name */}
          <div className="flex items-center mb-6">
            {store.logo && (
              <div className="mr-3 w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={store.logo}
                  alt={store.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold">{store.name}</h2>
          </div>

          {/* Map Location */}
          {/* <div className="mb-6">
            <div className="relative h-48 w-full bg-gray-200 rounded-lg overflow-hidden mb-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-red-600" />
                <span className="text-gray-500 ml-2">Map integration would go here</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Map data would be shown here</p>
          </div> */}

          {/* Address */}
          <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Address</h3>
              {store.street && store.city && store.state && store.zipCode ? (
                <div>
                  {store.street}, {store.city}, {store.state} {store.zipCode}
                </div>
              ) : (
                <p className="text-gray-700">{store.address || 'Address not available'}</p>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">Hours</h3>
                <button onClick={() => setShowHours(!showHours)} className="text-gray-500">
                  {showHours ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-gray-700">
                {isRestaurantOpen ? (
                  <span className="text-green-600 font-medium">Open now</span>
                ) : (
                  <span className="text-red-600 font-medium">Closed now</span>
                )}
                {' • '}
                {store.openingHours}
              </p>

              {showHours && (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tuesday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Wednesday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Thursday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Friday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span>{store.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>{store.openingHours}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Phone</h3>
              <p className="text-gray-700">{store.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
