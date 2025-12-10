'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentFrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (frequency: 'once-a-day' | 'after-each-order') => void;
  currentFrequency: 'once-a-day' | 'after-each-order';
}

export default function PaymentFrequencyModal({
  isOpen,
  onClose,
  onSave,
  currentFrequency,
}: PaymentFrequencyModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<'once-a-day' | 'after-each-order'>(
    currentFrequency
  );

  useEffect(() => {
    setSelectedFrequency(currentFrequency);
  }, [currentFrequency, isOpen]);

  const handleSave = () => {
    onSave(selectedFrequency);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Payment detail</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Radio Options */}
          <div className="space-y-4 mb-6">
            {/* Pay once a day */}
            <div
              className="flex items-center cursor-pointer pb-4 border-b border-gray-200"
              onClick={() => setSelectedFrequency('once-a-day')}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                  selectedFrequency === 'once-a-day' ? 'border-gray-900' : 'border-gray-300'
                }`}
                data-testid="radio-indicator-once-a-day"
              >
                {selectedFrequency === 'once-a-day' && (
                  <div
                    className="w-3 h-3 rounded-full bg-gray-900"
                    data-testid="radio-dot-once-a-day"
                  ></div>
                )}
              </div>
              <span className="text-base text-gray-900">Pay once a day</span>
            </div>

            {/* Pay after each order */}
            <div
              className="flex items-center cursor-pointer pb-4 border-b border-gray-200"
              onClick={() => setSelectedFrequency('after-each-order')}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                  selectedFrequency === 'after-each-order' ? 'border-gray-900' : 'border-gray-300'
                }`}
                data-testid="radio-indicator-after-each-order"
              >
                {selectedFrequency === 'after-each-order' && (
                  <div
                    className="w-3 h-3 rounded-full bg-gray-900"
                    data-testid="radio-dot-after-each-order"
                  ></div>
                )}
              </div>
              <span className="text-base text-gray-900">Pay after each order</span>
            </div>
          </div>

          {/* Description Text */}
          <div className="space-y-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              Choose to pay once for all your orders in a day or pay after each order. Available for
              personal profile orders using Mastercard, Visa, Apple Pay, or Discover.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Not available for business profiles, orders over $100.00, or orders paid with American
              Express, PayPal, Venmo, Cash App, Klarna, SNAP/EBT, or HSA/FSA cards.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
