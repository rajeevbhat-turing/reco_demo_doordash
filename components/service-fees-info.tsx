'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getCategoryConfig } from '@/lib/utils/fee-calculator';
import type { CartCategory } from '@/store/cart-store';

interface Restaurant {
  id?: string;
  name?: string;
  isFreeDelivery?: boolean;
  minDeliveryFee?: number;
  dashPass?: boolean;
}

interface ServiceFeesInfoProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: Restaurant | null;
  category?: CartCategory;
}

export default function ServiceFeesInfo({ isOpen, onClose, restaurant, category = 'restaurant' }: ServiceFeesInfoProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Get fee configuration from the fee calculator
  const feeConfig = getCategoryConfig(category);
  const serviceFeePercentage = Math.round(feeConfig.serviceFeePercentage * 100);
  const minServiceFee = feeConfig.minServiceFee.toFixed(2);

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

  // Calculate delivery fee display
  const getDeliveryFeeDisplay = () => {
    if (restaurant?.isFreeDelivery) {
      return '$0.00';
    }
    if (restaurant?.minDeliveryFee) {
      return `$${(restaurant.minDeliveryFee / 100).toFixed(2)}`;
    }
    return '$1.99';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg w-full max-w-[480px] max-h-[80vh] overflow-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4" aria-label="Close dialog">
          <X className="h-6 w-6 text-gray-500" />
        </button>

        <div className="p-6">
          {/* Delivery Fee */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Delivery Fee: {getDeliveryFeeDisplay()}</h2>
            <p className="text-sm text-gray-700">
              This is a flat fee that varies for each store based on your location and other factors. 
              It helps us pay Dashers and facilitate convenient delivery. Promotions or discounts that 
              reduce delivery fees may apply. Distance surcharges may apply for deliveries beyond 2 miles.
            </p>
          </div>

          {/* Service Fee */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Service Fee: {serviceFeePercentage}% of subtotal</h2>
            <p className="text-sm text-gray-700">
              This fee is typically {serviceFeePercentage}% of your subtotal (minimum ${minServiceFee}). It helps us pay 
              Dashers and facilitate convenient delivery. For deliveries beyond 5 miles, an additional 10% 
              may be added to the service fee.
            </p>
          </div>

          {/* Other DoorDash Fees */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Other Dashdoor Fees</h2>
            <p className="text-sm text-gray-700">
              Express fees ($2.99 for faster delivery) and fees in response to local regulations may apply. 
              These fees go to Dashdoor.
            </p>
          </div>

          {/* Menu Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Menu Pricing</h2>
            <p className="text-sm text-gray-700">
              This merchant sets prices. Those prices may be higher than prices in-store or elsewhere 
              for this location. In-store promotions may not apply. Prices for delivery and pickup may vary.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
