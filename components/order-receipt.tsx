'use client';

import { Phone, MessageSquare, Home, Briefcase } from 'lucide-react';
import { Order } from '@/constants/order-data';

interface OrderReceiptProps {
  order: Order;
  deliveryFee?: number;
  serviceFee?: number;
  estimatedTax?: number;
  dasherTip?: number;
  dasherName?: string;
  paymentMethod?: string;
  paymentDate?: string;
  completionDate?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryInstructions?: string;
}

export default function OrderReceipt({
  order,
  deliveryFee = 0.99,
  serviceFee = 3.0,
  estimatedTax = 0.42,
  dasherTip = 1.5,
  dasherName = 'Dasher',
  paymentMethod,
  paymentDate,
  completionDate,
  deliveryAddress,
  deliveryCity,
  deliveryInstructions,
}: OrderReceiptProps) {
  // Helper functions for backward compatibility
  const getStoreName = () => order.storeName || order.restaurantName || 'Store';
  const getTotal = () => order.total || order.totalAmount || 0;
  const subtotal =
    order.subtotal || order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const total = getTotal();

  // Use order data or fallback to props/defaults
  const finalDeliveryAddress =
    deliveryAddress || order.deliveryAddress?.street || 'Address not available';
  const finalDeliveryCity =
    deliveryCity ||
    (order.deliveryAddress
      ? `${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
      : '');
  const finalDeliveryInstructions =
    deliveryInstructions ||
    order.deliveryAddress?.deliveryInstructions ||
    'No special instructions';
  const finalPaymentMethod =
    paymentMethod ||
    (order.paymentCard?.type
      ? `${order.paymentCard.type} ...${order.paymentCard.lastFour}`
      : 'Payment method');
  const finalPaymentDate = paymentDate || order.orderDate;
  const finalCompletionDate = completionDate || order.orderDate;

  return (
    <div className="max-w-3xl mx-auto bg-white">
      {/* Dashdoor Logo */}
      <div className="mb-6">
        <svg width="140" height="28" viewBox="0 0 140 28" fill="none">
          <path
            d="M0 14C0 6.268 6.268 0 14 0h112c7.732 0 14 6.268 14 14s-6.268 14-14 14H14C6.268 28 0 21.732 0 14z"
            fill="#FF3008"
          />
          <text
            x="24"
            y="19"
            fill="white"
            fontSize="16"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            DASHDOOR
          </text>
        </svg>
      </div>

      {/* Order Complete Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Complete</h1>
            <p className="text-gray-600">{finalCompletionDate}</p>
          </div>
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
            <img src="/placeholder-logo.svg" alt="Store" width={40} height={40} />
          </div>
        </div>
        <p className="text-gray-600 mt-3">Your order is complete. Enjoy!</p>
      </div>

      {/* Dasher Info */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">Your Dasher</p>
              <p className="font-semibold text-lg">{dasherName}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Phone className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Store and Items */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
            <img src="/placeholder-logo.svg" alt={getStoreName()} width={40} height={40} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{getStoreName()}</h3>
            <p className="text-gray-600">
              {order.items?.length || 0} Item{(order.items?.length || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src="/placeholder.svg" alt={item.name} width={40} height={40} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-base">
                      {item.quantity}× {item.name}
                    </p>
                    <p className="font-medium text-base">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-300 py-5">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <div className="flex items-center gap-1">
              <span>Service Fee</span>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <div className="flex items-center gap-1">
              <span>Estimated Tax</span>
              <button className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <span>${estimatedTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Dasher Tip</span>
            <span>${dasherTip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-300">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <text x="2" y="16" fill="white" fontSize="10" fontWeight="bold">
                  VISA
                </text>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base">Payment</p>
              <p className="text-gray-600">
                {finalPaymentMethod} • {finalPaymentDate}
              </p>
            </div>
          </div>
          <p className="font-semibold text-lg">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-base mb-1">Address</p>
            <p className="text-gray-600">{finalDeliveryAddress}</p>
            {finalDeliveryCity && <p className="text-gray-600">{finalDeliveryCity}</p>}
          </div>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-base mb-1">Leave it at my door</p>
            <p className="text-gray-600">{finalDeliveryInstructions}</p>
          </div>
        </div>
      </div>

      {/* Business Profile CTA */}
      <div className="border-t border-gray-300 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-base">Create a business profile</p>
              <p className="text-gray-600">Keep track of your business receipts</p>
            </div>
          </div>
          <button className="px-5 py-2 text-base font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
