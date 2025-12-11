'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Package, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import { DeliveryOrder } from '@/lib/types/delivery-types';

type StatusFilter = 'all' | 'completed' | 'cancelled';

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
  
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentPartner?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/delivery/orders?partnerId=${currentPartner.id}&status=${statusFilter}&limit=${pagination.limit}&offset=${pagination.offset}`
        );
        const result = await response.json();

        if (result.success) {
          setOrders(result.data.orders);
          setPagination(result.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPartner?.id, statusFilter, pagination.offset, pagination.limit]);

  // Format currency (cents to dollars)
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Calculate stats
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalEarnings, 0);
  const totalTips = completedOrders.reduce((sum, o) => sum + o.tipAmount, 0);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600 mt-1">View your past deliveries and earnings</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4561ED]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#4561ED]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tips</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalTips)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPagination(prev => ({ ...prev, offset: 0 }));
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#4561ED] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? "You haven't completed any deliveries yet."
              : `No ${statusFilter} orders to display.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {order.storeLogo ? (
                    <img
                      src={order.storeLogo}
                      alt={order.storeName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.storeName}</h3>
                    <p className="text-sm text-gray-500">{order.itemsCount} items • {order.distanceMiles} mi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'completed' ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      Cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Pickup</p>
                    <p className="text-gray-700">{order.storeAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#4561ED] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Dropoff ({order.customerName})</p>
                    <p className="text-gray-700">{order.customerAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {formatDate(order.orderDate)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Base Pay</p>
                    <p className="font-medium text-gray-900">{formatCurrency(order.basePay)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tip</p>
                    <p className="font-medium text-green-600">{formatCurrency(order.tipAmount)}</p>
                  </div>
                  <div className="text-right pl-4 border-l border-gray-200">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-[#4561ED]">{formatCurrency(order.totalEarnings)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && !isLoading && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

