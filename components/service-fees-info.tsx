'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ServiceFeesInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceFeesInfo({ isOpen, onClose }: ServiceFeesInfoProps) {
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
          <h2 className="text-xl font-bold mb-4">Pricing & Fees</h2>

          <div className="space-y-4 mb-8">
            <div>
              <h3 className="font-medium mb-1">Menu Prices</h3>
              <p className="text-sm text-gray-700">
                This merchant sets prices. Those prices may be higher than prices in-store or
                elsewhere for this location. In-store promotions may not apply. Prices for delivery
                and pickup may vary. This merchant pays DoorDash a commission on orders.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Service Fee</h3>
              <p className="text-sm text-gray-700">
                This fee goes to DoorDash. The service fee may vary but is 15% of your subtotal for
                most restaurant orders (and 5% for most eligible DashPass restaurant orders). A
                flat, minimum service fee may apply on small orders.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Delivery Fee</h3>
              <p className="text-sm text-gray-700">
                The delivery fee is a flat fee that goes to DoorDash. The delivery fee is $0 on
                eligible DashPass restaurant orders.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Other DoorDash Fees</h3>
              <p className="text-sm text-gray-700">
                Expanded range fees, Beyond local area fees, express fees, small order fees, and
                fees in response to local regulations may apply. Each are separate fees, all of
                which go to DoorDash.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Government Fees</h3>
              <p className="text-sm text-gray-700">
                Other fees such as bag fees and bottle fees required by law may apply. Some of these
                fees may be retained by DoorDash.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Checkout</h3>
              <p className="text-sm text-gray-700">
                You can see all of the fees that apply to your order at checkout prior to completing
                the transaction.
              </p>
            </div>
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
