'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ChevronLeft } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import AddCardModal from '@/components/modals/add-card-modal';
// import PaymentFrequencyModal from '@/components/modals/payment-frequency-modal';

export default function PaymentPage() {
  const router = useRouter();
  const {
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    // currentUser,
    // setPaymentFrequency,
  } = useUserStore();
  const savedPaymentMethods = getPaymentMethods();

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  // const [showPaymentFrequencyModal, setShowPaymentFrequencyModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(
    savedPaymentMethods.find(pm => pm.default)?.id || null
  );

  // const paymentFrequency = currentUser?.paymentFrequency || 'after-each-order';

  // Handle add payment method
  const handleAddCard = (cardData: {
    cardNumber: string;
    expiration: string;
    cvc: string;
    zipCode: string;
  }) => {
    const newCard = addPaymentMethod({
      cardNumber: cardData.cardNumber,
      cvc: cardData.cvc,
      expiry: cardData.expiration,
      zipCode: cardData.zipCode,
    });
    setSelectedPaymentMethod(newCard.id);
    setShowAddCardModal(false);
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = (e: React.MouseEvent, methodId: string) => {
    e.stopPropagation();
    removePaymentMethod(methodId);
    // If deleted card was selected, select the first remaining card
    if (selectedPaymentMethod === methodId && savedPaymentMethods.length > 1) {
      const remainingMethods = savedPaymentMethods.filter(m => m.id !== methodId);
      if (remainingMethods.length > 0) {
        setSelectedPaymentMethod(remainingMethods[0].id);
      }
    }
  };

  // Handle set default payment method
  const handleSetDefaultPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setDefaultPaymentMethod(methodId);
  };

  // Handle save payment frequency
  // const handleSavePaymentFrequency = (frequency: 'once-a-day' | 'after-each-order') => {
  //   setPaymentFrequency(frequency);
  // };

  // Get display text for payment frequency
  // const getPaymentFrequencyText = () => {
  //   return paymentFrequency === 'once-a-day' ? 'Once a day' : 'Pay after each order';
  // };

  // Handle close add card modal
  const handleCloseAddCardModal = useCallback(() => {
    setShowAddCardModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Payment Methods Container with Border */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Payment Methods Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Payment Methods</h1>
          </div>

          {/* Saved Payment Methods */}
          {savedPaymentMethods.length > 0 && (
            <div className="border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 px-6 pt-6 pb-3">
                Saved Payment Methods
              </h3>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {savedPaymentMethods.map(method => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                      style={{ marginInline: '-12px' }}
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-3 flex items-center justify-center">
                          <div className="flex space-x-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {method.type}....{method.lastFour}
                          </p>
                          <p className="text-xs text-gray-600">Exp. {method.expiry}</p>
                          {method.default && (
                            <span className="inline-block mt-1 text-xs font-medium text-green-600">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedPaymentMethod === method.id ? (
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <button
                          onClick={e => handleDeletePaymentMethod(e, method.id)}
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          aria-label="Delete payment method"
                        >
                          <Trash2 className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add New Payment Method */}
          <div className="px-6 py-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Payment Method</h3>
            <div className="space-y-3">
              {/* Credit/Debit Card Option */}
              <div
                className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                style={{ marginInline: '-12px' }}
                onClick={() => setShowAddCardModal(true)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-7 bg-gray-800 rounded mr-3 flex items-center justify-center">
                    <svg
                      className="w-6 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm">Credit/Debit Card</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Dashdoor Credits Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
          {/* Credits Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">DashDoor Credits</h1>
          </div>

          {/* Credits Content */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-900">$0.00</span>
              <span className="text-sm text-gray-600">Can be applied only in United States</span>
            </div>
            <hr className="my-4 mx-3" />
            <p className="text-sm text-gray-600">
              Your credits will be automatically applied to your next order
            </p>
          </div>
        </div>

        {/* Payment Frequency Section */}
        {/* <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Payment frequency</h1>
          </div>

          <div
            className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowPaymentFrequencyModal(true)}
          >
            <span className="text-base text-gray-900">{getPaymentFrequencyText()}</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div> */}
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={showAddCardModal}
        onClose={handleCloseAddCardModal}
        onAddCard={handleAddCard}
      />

      {/* Payment Frequency Modal */}
      {/* <PaymentFrequencyModal
        isOpen={showPaymentFrequencyModal}
        onClose={() => setShowPaymentFrequencyModal(false)}
        onSave={handleSavePaymentFrequency}
        currentFrequency={paymentFrequency}
      /> */}
    </div>
  );
}
