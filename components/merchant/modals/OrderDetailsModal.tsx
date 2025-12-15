'use client';

import Image from 'next/image';
import { X, MapPin, Clock, CreditCard, Package, User, Truck, ShoppingBag, Mail, Hash, Calendar } from 'lucide-react';
import type { ProcessedOrder } from '@/components/merchant/orders/OrdersTableShared';
import {
  getOrderStatusColor,
  formatFulfillmentStatus,
  formatOrderStatus,
} from '@/lib/utils/order-status';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProcessedOrder | null;
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
}

// Get the next status action button text and target status based on current status
function getNextStatusAction(status: string): { buttonText: string; nextStatus: string } | null {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus === 'pending') {
    return { buttonText: 'Confirm the order', nextStatus: 'confirmed' };
  }
  if (normalizedStatus === 'confirmed') {
    return { buttonText: 'Mark as preparing', nextStatus: 'preparing' };
  }
  if (['preparing', 'dasher_assigned', 'dasher_waiting'].includes(normalizedStatus)) {
    return { buttonText: 'Mark as Ready', nextStatus: 'ready' };
  }
  
  return null;
}

// Order details side panel modal
export default function OrderDetailsModal({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const statusColors = getOrderStatusColor(order.status);
  const fulfillmentText = formatFulfillmentStatus(order.status);
  const orderStatusText = formatOrderStatus(order.status);
  const nextStatusAction = getNextStatusAction(order.status);

  // Handle status update
  const handleUpdateStatus = () => {
    if (nextStatusAction && onUpdateStatus) {
      onUpdateStatus(order.orderId, nextStatusAction.nextStatus);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      {/* Side Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 -ml-2"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <p className="text-base text-gray-500 font-medium">Order</p>
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-900">{order.orderId}</h2>
            <p className="text-sm text-gray-600">
              {order.date} at {order.time}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 space-y-6 flex-1">
          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Order Status</h3>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
                {orderStatusText}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Fulfillment Status:</span>
                <span className="font-medium text-gray-900">{fulfillmentText}</span>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900">Customer Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{order.userName || order.customer}</p>
                    {order.userId && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Customer ID: {order.userId}
                      </p>
                    )}
                  </div>
                  {order.userEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{order.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Order Items</h3>
                <span className="text-sm text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {item.image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery/Pickup Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900">Fulfillment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  order.fulfillmentType === 'DashDoor delivery' ? 'bg-purple-100' : 'bg-teal-100'
                }`}>
                  <Truck className={`h-5 w-5 ${
                    order.fulfillmentType === 'DashDoor delivery' ? 'text-purple-600' : 'text-teal-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.fulfillmentType}</p>
                  <p className="text-sm text-gray-500">via {order.channel}</p>
                </div>
              </div>
              
              {order.deliveryAddress && order.fulfillmentType === 'DashDoor delivery' && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Delivery Address</p>
                      <p className="font-medium text-gray-900">{order.deliveryAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                      {order.deliveryAddress.businessName && (
                        <p className="text-sm text-gray-500 mt-1">{order.deliveryAddress.businessName}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.fulfillmentType === 'Customer pickup' && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Customer will pick up at store</span>
                  </div>
                  {order.status.toLowerCase() === 'scheduled' && (
                    <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-3">
                      <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Scheduled for Pickup</p>
                        <p className="text-sm text-amber-700">
                          Ready since {order.date} at {order.time}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Awaiting customer pickup
                        </p>
                      </div>
                    </div>
                  )}
                  {order.status.toLowerCase() === 'ready' && (
                    <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                      <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Ready for Pickup</p>
                        <p className="text-sm text-green-700">
                          Order is ready and waiting for customer
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Time Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900">Time Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Order Placed</p>
                  <p className="font-medium text-gray-900">
                    {order.date} at {order.time}
                  </p>
                </div>
              </div>
              {order.minutesElapsed !== undefined && order.secondsElapsed !== undefined && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time Elapsed</p>
                    <p className="font-medium text-gray-900">
                      {order.minutesElapsed}m {order.secondsElapsed}s
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900">Payment Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{order.subtotal}</span>
                </div>
                {order.serviceFee !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-gray-900">${order.serviceFee.toFixed(2)}</span>
                  </div>
                )}
                {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {order.tipAmount !== undefined && order.tipAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tip</span>
                    <span className="text-green-600">${order.tipAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {order.total !== undefined && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Total</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Progress (for active orders) */}
          {order.tabStatus === 'Active' && order.totalSecondsElapsed !== undefined && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900">Order Progress</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {order.minutesElapsed}m {order.secondsElapsed}s / 30m
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        Math.min((order.totalSecondsElapsed / (30 * 60)) * 100, 100) >= 75
                          ? 'bg-orange-500'
                          : Math.min((order.totalSecondsElapsed / (30 * 60)) * 100, 100) >= 50
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((order.totalSecondsElapsed / (30 * 60)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[28px] border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
          {nextStatusAction && (
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              {nextStatusAction.buttonText}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

