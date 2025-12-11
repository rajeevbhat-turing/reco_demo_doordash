'use client';

import React from 'react';
import {
  getOrderStatusColor,
  formatFulfillmentStatus,
  formatOrderStatus,
} from '@/lib/utils/order-status';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessName?: string;
}

export interface ProcessedOrder {
  customer: string;
  orderId: string;
  status: string;
  // Tab bucket derived from status
  tabStatus: 'Active' | 'Scheduled' | 'History';
  date: string;
  time: string;
  fulfillmentType: 'Customer pickup' | 'DashDoor delivery';
  channel: string;
  subtotal: string;
  rawOrderDate?: Date;
  minutesElapsed?: number;
  secondsElapsed?: number;
  totalSecondsElapsed?: number;
  // Extended fields
  userName?: string;
  userEmail?: string;
  userId?: string;
  items?: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  storeId?: string;
  storeName?: string;
  storeCategory?: string;
  serviceFee?: number;
  deliveryFee?: number;
  tipAmount?: number;
  total?: number;
}

interface OrdersTableProps {
  orders: ProcessedOrder[];
  emptyMessage: string;
  isLoading: boolean;
  onRowClick?: (order: ProcessedOrder) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, emptyMessage, isLoading, onRowClick }) => {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg bg-white mb-4">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Customer</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Order ID</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Status</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Date</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Time</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Fulfillment status</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Fulfillment type</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Channel</th>
              <th className="text-right font-medium px-4 py-3 text-gray-700">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              orders.map(order => {
                const statusColors = getOrderStatusColor(order.status);
                const progressPercent =
                  order.totalSecondsElapsed !== undefined
                    ? Math.min((order.totalSecondsElapsed / (30 * 60)) * 100, 100)
                    : 0;
                const fulfillmentText = formatFulfillmentStatus(order.status);

                return (
                  <tr
                    key={order.orderId}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(order)}
                  >
                    <td className="px-4 py-3 text-gray-900">{order.customer}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                          {formatOrderStatus(order.status)}
                        </span>

                        {order.totalSecondsElapsed !== undefined &&
                          order.tabStatus === 'Active' && (
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${
                                    progressPercent >= 75
                                      ? 'bg-orange-500'
                                      : progressPercent >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 font-medium min-w-[70px]">
                                {order.minutesElapsed !== undefined &&
                                order.secondsElapsed !== undefined
                                  ? `${order.minutesElapsed}m ${order.secondsElapsed}s / 30m`
                                  : `${order.minutesElapsed || 0}m / 30m`}
                              </span>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.date}</td>
                    <td className="px-4 py-3 text-gray-600">{order.time}</td>
                    <td className="px-4 py-3 text-gray-600">{fulfillmentText}</td>
                    <td className="px-4 py-3 text-gray-600">{order.fulfillmentType}</td>
                    <td className="px-4 py-3 text-gray-600">{order.channel}</td>
                    <td className="px-4 py-3 text-right font-medium">{order.subtotal}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
