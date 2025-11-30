'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrdersStore } from '@/store/orders-store';
import { Download, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/constants/order-data';
import ReviewDialog from '@/components/review-dialog';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';
import { OrderItem as ReviewOrderItem } from '@/types/review-types';
import './print.css';

export default function OrderReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateOrderReview } = useOrdersStore();
  const [mounted, setMounted] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const orderId = params.orderId as string;
  const order = orders.find(o => o.id === orderId);

  // Get restaurant ID for the order
  const restaurantId = order?.storeId || order?.restaurantId || undefined;

  // Fetch restaurant and menu data for review dialog
  const { data: orderRestaurant } = useRestaurant(restaurantId);
  const { data: orderMenuData } = useRestaurantMenu(restaurantId);

  // Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle review dialog close
  const handleCloseReviewDialog = useCallback(() => {
    setShowReviewDialog(false);
  }, []);

  // Handle review submit
  const handleReviewSubmit = useCallback(
    (rating: number, text: string, _likedItems?: ReviewOrderItem[]) => {
      if (order) {
        updateOrderReview(order.id, rating, text);
        setShowReviewDialog(false);
      }
    },
    [order, updateOrderReview]
  );

  // Helper function to get store name (support both old and new field names)
  const getStoreName = (order: Order) => {
    // First, try to get store name from order
    const storeName = order.storeName || order.restaurantName;

    // Validate storeName - check if it's valid (not empty, not a number, not "Unknown Store")
    if (
      storeName &&
      storeName.trim() !== '' &&
      storeName !== 'Unknown Store' &&
      !/^\d+$/.test(storeName)
    ) {
      return storeName;
    }

    // Fallback - if storeName is a number or invalid, return a generic name
    return 'Store';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  // Calculate original subtotal (before free item discount) and final subtotal
  const originalSubtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  // Always use stored subtotal from order if available (most accurate)
  // If not available, calculate using original prices and apply stored freeItemDiscount
  let subtotal = order.subtotal || 0;
  if (subtotal === 0 && order.items) {
    // Calculate from original prices
    const calculatedSubtotal = order.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    // Apply free item discount if stored
    const freeItemDiscount = (order as any).freeItemDiscount || 0;
    subtotal = calculatedSubtotal - freeItemDiscount;
  }

  // Check if there's a free item discount (original subtotal > final subtotal)
  const hasFreeItemDiscount = originalSubtotal > subtotal;

  // Use actual order data or fallback to placeholders
  const discount = (order as any).discount || 0;
  const deliveryFee = order.deliveryFee ?? order.deliveryOption?.extraFee ?? 0.99;
  const serviceFee = order.serviceFee || 3.0;

  // Always use stored tax from order to ensure consistency with checkout
  // Only recalculate if absolutely necessary (should not happen in normal flow)
  let estimatedTax = (order as any).estimatedTax ?? 0;
  if (estimatedTax === 0 && order.deliveryAddress) {
    // Fallback: recalculate only if tax was not stored (should not happen)
    console.warn('Tax not stored in order, recalculating - this may cause inconsistency');
    const { calculateEstimatedTax } = require('@/lib/utils/fee-calculator');
    estimatedTax = calculateEstimatedTax(subtotal, deliveryFee, serviceFee, order.deliveryAddress);
  }

  // Use stored tip amount from order (should be 0 if not set in checkout)
  // Don't default to 1.5 to maintain consistency with checkout
  const dasherTip = order.tipAmount ?? 0;

  // Calculate original total (before discounts) and final total
  const originalTotal = originalSubtotal + serviceFee + deliveryFee + estimatedTax + dasherTip;
  // Recalculate total using adjusted subtotal (after free item discount)
  // Total = subtotal + serviceFee + deliveryFee - discount + estimatedTax + dasherTip
  const total = subtotal + serviceFee + deliveryFee - discount + estimatedTax + dasherTip;
  const hasTotalDiscount = originalTotal > total;

  // Delivery info
  const deliveryAddress = order.deliveryAddress?.street || 'Address not available';
  const deliveryCity = order.deliveryAddress
    ? `${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
    : '';
  const deliveryPreference = order.deliveryAddress?.deliveryPreference || 'Leave it at my door';
  const deliveryInstructions =
    order.deliveryAddress?.deliveryInstructions || 'No special instructions';
  const dasherName = 'Dasher'; // TODO: Add to order data
  const paymentMethod = order.paymentCard?.type
    ? `${order.paymentCard.type} ...${order.paymentCard.lastFour}`
    : 'Payment method';
  const paymentDate = order.orderDate;
  const completionDate = order.orderDate;

  // Handle download receipt
  const handleDownloadReceipt = () => {
    window.print();
  };

  // Convert order items to review OrderItem format
  const convertOrderItemsToReviewItems = (order: Order): ReviewOrderItem[] => {
    if (!order.items || order.items.length === 0) return [];
    const restaurantId = order.storeId || order.restaurantId || '';

    return order.items.map(item => {
      // Try to find matching menu item by name to get image
      const menuItem = orderMenuData?.menuItems.find(
        mi => mi.id?.toString() === item.id?.toString()
      );

      return {
        id: item.id,
        name: item.name,
        restaurantId: restaurantId,
        image: menuItem?.image || (item as any).image || null,
        menuItemId: menuItem?.id || (item as any).menuItemId,
        price: item.price,
      };
    });
  };

  // Format order date for display
  const formatOrderDate = (order: Order): string => {
    if (order.orderDate) {
      // If orderDate is already formatted, return it
      if (order.orderDate.includes(',')) {
        return order.orderDate;
      }
      // Otherwise, try to format it
      try {
        const date = new Date(order.orderDate);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      } catch {
        return order.orderDate;
      }
    }
    return '';
  };

  // Check if order has been reviewed
  const isOrderReviewed = order?.rating && order?.reviewDate;

  // Handle rate store button click
  const handleRateStore = () => {
    if (!isOrderReviewed) {
      setShowReviewDialog(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 mt-16">
      {/* Main Layout: Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative bg-gray-200 no-print">
          {/* Placeholder for map - to be implemented */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
            <div className="text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm">Map View (To be implemented)</p>
            </div>

            {/* Back button */}
            <button
              className="p-2.5 bg-white hover:bg-gray-50 rounded-full transition-colors absolute top-5 left-5 shadow-md"
              onClick={() => router.replace('/orders')}
            >
              <ArrowLeft className="w-5.5 h-5.5" />
            </button>

            {/* Help button */}
            {/* <button className="px-3 py-1.5 bg-white hover:bg-gray-50 rounded-2xl shadow-md absolute top-5 right-5 text-sm font-bold text-[#191919ff]">
              Help
            </button> */}
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
              <span className="text-xl font-light">+</span>
            </button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
              <span className="text-xl font-light">−</span>
            </button>
          </div>
        </div>

        {/* Receipt Sidebar - Original Design */}
        <div
          id="receipt-sidebar"
          className="w-[420px] bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0"
        >
          <div className="h-full">
            {/* DoorDash Logo - Only visible in print */}
            <div className="hidden print:block p-4 pb-2">
              <div className="flex items-center">
                {/* Logo Mark */}
                <svg
                  aria-hidden="true"
                  width="32"
                  height="18"
                  viewBox="0 0 99.5 56.5"
                  fill="#2563EB"
                >
                  <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
                </svg>
                {/* Word Mark */}
                <svg
                  aria-hidden="true"
                  width="112"
                  height="13"
                  viewBox="0 0 363 40"
                  fill="#2563EB"
                  className="ml-1"
                >
                  {/* D */}
                  <path d="M1,1A1,1,0,0,1,2,0H22.32c12.32,0,22.18,9.27,22.18,20.1S34.64,40.21,22.32,40.21H2a1,1,0,0,1-1-1ZM22.32,31.54c7.46,0,13.51-5.46,13.51-11.44S29.78,8.66,22.32,8.66H9.54V31.54Z" />
                  {/* A */}
                  <path d="M85.33,39.26a1,1,0,0,1-.94.95H77.74a1,1,0,0,1-1-.68L74.2,31.87H57.65l-2.57,7.66a1,1,0,0,1-1,.68H47.51a1,1,0,0,1-.94-1.36L61.11,1.22A1,1,0,0,1,62.05.54h8.25a1,1,0,0,1,.94.68L86.27,38.58a1,1,0,0,1-.94,1.36M72.17,24.14,65.93,7.73,59.69,24.14Z" />
                  {/* S */}
                  <path d="M104.36,40.21c-8.93,0-16.12-5.59-16.12-12.78a1,1,0,0,1,1-1h6.4a1,1,0,0,1,1,1c0,2.84,3.38,5.05,7.73,5.05,3.92,0,6.76-1.63,6.76-4.33,0-6.35-21.3-3.11-21.3-16.39,0-6.62,6.08-11.78,14-11.78s14.68,5.16,14.68,11.78a1,1,0,0,1-1,1H111a1,1,0,0,1-1-1c0-2.3-2.84-4.05-6.62-4.05s-6.35,1.76-6.35,4.05c0,6.49,21.3,3.25,21.3,16.39,0,7.19-6.49,12.05-14,12.05" />
                  {/* H */}
                  <path d="M122.47,1a1,1,0,0,1,1-1h6.54a1,1,0,0,1,1,1V15.63h16.66V1a1,1,0,0,1,1-1h6.54a1,1,0,0,1,1,1V39.26a1,1,0,0,1-1,1h-6.54a1,1,0,0,1-1-1V23.36H130V39.26a1,1,0,0,1-1,1h-6.54a1,1,0,0,1-1-1Z" />
                  {/* D */}
                  <path d="M161.14,1a1,1,0,0,1,1-1h20.32c12.32,0,22.18,9.27,22.18,20.1s-9.86,20.11-22.18,20.11H162.14a1,1,0,0,1-1-1ZM182.46,31.54c7.46,0,13.51-5.46,13.51-11.44S189.92,8.66,182.46,8.66H169.68V31.54Z" />
                  {/* O */}
                  <path d="M229.46,40.21c-11.51,0-20.78-8.93-20.78-20.11S217.95,0,229.46,0s20.78,8.93,20.78,20.1-9.27,20.11-20.78,20.11m0-31.55c-6.62,0-12.05,5.05-12.05,11.44s5.43,11.44,12.05,11.44,12.05-5.05,12.05-11.44S236.08,8.66,229.46,8.66" />
                  {/* O */}
                  <path d="M276.46,40.21c-11.51,0-20.78-8.93-20.78-20.11S264.95,0,276.46,0s20.78,8.93,20.78,20.1-9.27,20.11-20.78,20.11m0-31.55c-6.62,0-12.05,5.05-12.05,11.44s5.43,11.44,12.05,11.44,12.05-5.05,12.05-11.44S283.08,8.66,276.46,8.66" />
                  {/* R */}
                  <path d="M308.75,8.66h-8.91V19.3h8.91a5.22,5.22,0,0,0,5.46-5.17,5.28,5.28,0,0,0-5.46-5.46M291.22,1.95a1,1,0,0,1,1-1H309c8,0,13.79,5.86,13.79,13.22a13,13,0,0,1-7.18,11.78l7.74,13.68a1,1,0,0,1-.91,1.56h-6.79a1,1,0,0,1-.91-.54l-7.46-13.54h-7.47v13a1,1,0,0,1-1,1h-6.54a1,1,0,0,1-1-1Z" />
                </svg>
              </div>
            </div>

            {/* Order Complete Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold mb-1">Order Complete</h2>
                  <p className="text-gray-600 text-xs">{completionDate}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <img src="/placeholder-logo.svg" alt="Store" width={24} height={24} />
                </div>
              </div>

              {/* Order Status Timeline - Hidden in print */}
              <div className="flex items-center justify-between mb-3 no-print">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                  </svg>
                </div>
                <div className="flex-1 h-0.5 bg-black mx-1"></div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div className="flex-1 h-0.5 bg-black mx-1"></div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
                <div className="flex-1 h-0.5 bg-black mx-1"></div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <Home className="w-4 h-4" />
                </div>
              </div>

              <p className="text-center text-xs text-gray-600 mb-3 no-print">
                Your order is complete. Enjoy!
              </p>
              <p className="hidden print:block text-left text-xs text-gray-600 mb-3">
                Your order is complete. Enjoy!
              </p>

              {/* Download Receipt Button */}
              <button
                onClick={handleDownloadReceipt}
                className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm no-print"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Download receipt</span>
              </button>
            </div>

            {/* Dasher Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Your Dasher</p>
                    <p className="font-semibold text-sm">{dasherName}</p>
                  </div>
                </div>
                {/* <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            {/* Store and Items */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <img
                      src="/placeholder-logo.svg"
                      alt={getStoreName(order)}
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{getStoreName(order)}</h3>
                    <p className="text-xs text-gray-600">
                      {order.items?.length || 0} Item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Rate store button - only show if order is not reviewed */}
                {!isOrderReviewed && (
                  <button
                    onClick={handleRateStore}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-2xl shadow-sm text-sm font-bold text-[#191919ff]"
                  >
                    Rate store
                  </button>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <img src="/placeholder.svg" alt={item.name} width={24} height={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-medium truncate">
                            {item.quantity}x {item.name}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(() => {
                              const finalPrice =
                                (item as any).final_price !== undefined
                                  ? (item as any).final_price
                                  : item.price;
                              const originalTotal = item.price * item.quantity;
                              const finalTotal = finalPrice * item.quantity;
                              const hasDiscount = finalTotal < originalTotal;

                              return hasDiscount ? (
                                <>
                                  <span className="text-sm font-medium text-[#eb1700ff]">
                                    ${finalTotal.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-[#606060ff] line-through">
                                    ${originalTotal.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-gray-900">
                                  ${finalTotal.toFixed(2)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <div className="flex items-center gap-2">
                    {hasFreeItemDiscount && (
                      <span className="text-[#606060ff] font-medium line-through text-sm">
                        ${originalSubtotal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    Service Fee
                    {/* Hidden for now */}
                    {/* <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button> */}
                  </span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    Estimated Tax
                    {/* Hidden for now */}
                    {/* <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button> */}
                  </span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dasher Tip</span>
                  <span>${dasherTip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                  <span>Total</span>
                  <div className="flex items-center gap-2">
                    {hasTotalDiscount && (
                      <span className="text-[#606060ff] line-through text-sm">
                        ${originalTotal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[#eb1700ff] font-bold text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v2h16V6H4zm0 4v6h16v-6H4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Payment</p>
                    <p className="text-xs text-gray-600">
                      {paymentMethod} • {paymentDate}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-sm">${total.toFixed(2)}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Address</p>
                  <p className="text-xs text-gray-600">{deliveryAddress}</p>
                  {deliveryCity && <p className="text-xs text-gray-600">{deliveryCity}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {deliveryPreference === 'location'
                      ? 'Meet at a location'
                      : 'Leave it at my door'}
                  </p>
                  {deliveryInstructions && (
                    <p className="text-xs text-gray-600">{deliveryInstructions}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {order && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={handleCloseReviewDialog}
          restaurantName={getStoreName(order)}
          vendorId={order.storeId || order.restaurantId}
          defaultRating={0}
          orderItems={convertOrderItemsToReviewItems(order)}
          orderDate={formatOrderDate(order)}
          vendorLogo={orderRestaurant?.logo || undefined}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
