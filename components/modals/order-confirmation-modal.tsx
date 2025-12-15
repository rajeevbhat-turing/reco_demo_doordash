'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle } from 'lucide-react';
import { useCartStore, type CartCategory } from '@/store/cart-store';
import { useVerifierStore } from '@/store/verifier-store';
import { useDealsStore } from '@/store/deals-store';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  total: number;
  tipAmount?: number;
  scheduledTime?: string;
  deliveryTime?: string;
  storeName?: string;
  storeId?: string;
  category?: CartCategory;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderId,
  total,
  tipAmount = 0,
  scheduledTime,
  deliveryTime,
  storeName,
  storeId,
  category,
}: OrderConfirmationModalProps) {
  const router = useRouter();
  const { findCart, clearCart } = useCartStore();
  const { recordOrderCompletion } = useVerifierStore();
  const { removeDeal } = useDealsStore();

  // Get the current cart using the provided storeId and category
  const currentCart = storeId && category ? findCart(storeId, category) : null;
  const items = currentCart?.items || [];

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    console.log('[ORDER] 🚀 Order completion starting...', {
      orderId,
      tipAmount,
      total,
      storeName: storeName || 'Store',
      category: category,
      itemsCount: items.length,
      items: items.map(item => item.itemName),
    });

    // Record order completion in cart store for verifiers
    if (category) {
      recordOrderCompletion({
        orderId,
        tipAmount,
        orderTotal: total,
        storeName: storeName || 'Store',
        category: category,
        items,
      });
      console.log('[ORDER] ✅ Recorded order completion in cart store');
    }

    // Clear the specific cart and remove applied deal
    if (storeId && category) {
      // Remove applied deal for this cart
      const cartId = `${storeId}-${category}`;
      removeDeal(cartId);

      // Clear the cart
      clearCart(storeId, category);
      console.log('[ORDER] ✅ Cart cleared for:', storeId, category);
    }

    // Close modal
    onClose();

    // Navigate to home page
    router.push('/home');
    console.log('[ORDER] ✅ Order completion finished - navigating home');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      data-testid="order-confirmation-modal-backdrop"
    >
      <div ref={dialogRef} className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>

        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>

          {/* Order Details */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Your order has been placed successfully</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono font-bold text-lg">{orderId}</p>
            </div>
            <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
          </div>

          {/* Estimated Delivery Time */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              {scheduledTime ? 'Scheduled Delivery Time' : 'Estimated Delivery Time'}
            </p>
            <p className="text-blue-900 font-bold">
              {scheduledTime || deliveryTime || '45-60 minutes'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            You will receive SMS and email updates about your order status
          </p>
        </div>
      </div>
    </div>
  );
}
