'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Search, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';
import { ActiveOrdersTable } from '@/components/merchant/orders/ActiveOrdersTable';
import { ScheduledOrdersTable } from '@/components/merchant/orders/ScheduledOrdersTable';
import { HistoryOrdersTable } from '@/components/merchant/orders/HistoryOrdersTable';
import type { ProcessedOrder } from '@/components/merchant/orders/OrdersTableShared';
import OrderDetailsModal from '@/components/merchant/modals/OrderDetailsModal';

const COMPLETED_STATUSES = ['delivered', 'cancelled', 'returned', 'abandoned'];
const IN_PROGRESS_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'dasher_assigned',
  'dasher_waiting',
  'ready',
  'picked_up',
  'on_the_way',
  'dasher_nearby',
];

const SCHEDULED_TAB_STATUSES = new Set([
  'scheduled',
  'ready',
  'picked_up',
  'on_the_way',
  'dasher_nearby',
]);
const COMPLETED_TAB_STATUSES = new Set(COMPLETED_STATUSES);

// Status options per tab
const ACTIVE_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'dasher_assigned', label: 'Dasher assigned' },
  { value: 'dasher_waiting', label: 'Dasher waiting' },
];

const SCHEDULED_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ready', label: 'Ready for pickup' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'on_the_way', label: 'On the way' },
  { value: 'dasher_nearby', label: 'Dasher nearby' },
];

const HISTORY_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'abandoned', label: 'Abandoned' },
];

// Channel filter options
const CHANNEL_OPTIONS = [
  { value: '', label: 'All channels' },
  { value: 'DashDoor', label: 'DashDoor' },
  { value: 'Pickup', label: 'Pickup' },
];

// Date range filter options
const DATE_RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'all', label: 'All time' },
];

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  channelFilter: string;
  onChannelChange: (value: string) => void;
  dateRangeFilter: string;
  onDateRangeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  activeTab: 'Active' | 'Scheduled' | 'History';
}

function FilterBar({
  searchValue,
  onSearchChange,
  channelFilter,
  onChannelChange,
  dateRangeFilter,
  onDateRangeChange,
  statusFilter,
  onStatusChange,
  activeTab,
}: FilterBarProps) {
  // Get status options based on current tab
  const statusOptions =
    activeTab === 'Active'
      ? ACTIVE_STATUS_OPTIONS
      : activeTab === 'Scheduled'
      ? SCHEDULED_STATUS_OPTIONS
      : HISTORY_STATUS_OPTIONS;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <select
          value={channelFilter}
          onChange={e => onChannelChange(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
        >
          {CHANNEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={dateRangeFilter}
          onChange={e => onDateRangeChange(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
        >
          {DATE_RANGE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search orders"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 pr-3 py-1.5 w-64 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );
}

/**
 * Route: /merchant/store/[id]/orders
 *
 * Orders page for a specific store - displays all orders for that store
 * Gets store ID from URL params and ensures orders are filtered correctly
 */
export default function MerchantStoreOrdersPage() {
  const params = useParams();
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const {
    searchQuery,
    activeTab,
    setSearchQuery,
    setActiveTab,
    orders: storeOrders,
    updateOrder,
  } = useMerchantOrdersStore();
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [lastUpdated, setLastUpdated] = useState(3);
  const [storeSet, setStoreSet] = useState(false);
  // Force re-render every 10 seconds to update order statuses and timers
  const [currentTime, setCurrentTime] = useState(new Date());
  // Filter states
  const [channelFilter, setChannelFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('7');
  const [statusFilter, setStatusFilter] = useState('');
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<ProcessedOrder | null>(null);

  // Handle order status update from modal
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    // Find the actual order ID in the store (might be formatted differently)
    const storeOrder = storeOrders.find(
      o => o.id === orderId || `DD-${o.id}` === orderId || o.id === orderId.replace('DD-', '')
    );
    if (storeOrder) {
      updateOrder(storeOrder.id, { status: newStatus });
    }
  };

  const storeIdParam = params.id as string;

  // Ensure storeId is set from URL (no fetch; data already in store)
  useEffect(() => {
    if (storeSet) return;
    if (storeIdParam && contextStoreId !== storeIdParam) {
      setCurrentStoreId(storeIdParam);
    }
    setStoreSet(true);
  }, [storeIdParam, contextStoreId, setCurrentStoreId, storeSet]);

  const isLoadingOrders = false;

  // Transform store orders to merchant order format
  const orders = useMemo<ProcessedOrder[]>(() => {
    const now = currentTime;

    return storeOrders
      .map((order: any) => {
        // Parse order date - handle both ISO string and formatted string
        let orderDate: Date;
        try {
          if (order.orderDate && order.orderDate.includes(',')) {
            // Already formatted date, try to parse it
            orderDate = new Date(order.orderDate);
          } else if (order.orderDate) {
            // ISO string
            orderDate = new Date(order.orderDate);
          } else {
            orderDate = new Date();
          }
        } catch {
          orderDate = new Date();
        }

        const rawStatus = String(order.status || 'pending').toLowerCase();
        const tabStatus = COMPLETED_TAB_STATUSES.has(rawStatus)
          ? 'History'
          : SCHEDULED_TAB_STATUSES.has(rawStatus)
          ? 'Scheduled'
          : 'Active';

        const status = order.status || 'pending';
        let minutesElapsed: number | undefined;
        let secondsElapsed: number | undefined;
        let totalSecondsElapsed: number | undefined;

        if (tabStatus === 'Active' && IN_PROGRESS_STATUSES.includes(rawStatus)) {
          const totalSeconds = Math.max(
            0,
            Math.floor((now.getTime() - orderDate.getTime()) / 1000)
          );
          totalSecondsElapsed = totalSeconds;
          minutesElapsed = Math.floor(totalSeconds / 60);
          secondsElapsed = totalSeconds % 60;
        }

        // Get customer name - prioritize user name, then business name, then address
        const customerName =
          order.userName ||
          order.deliveryAddress?.businessName ||
          order.deliveryAddress?.street ||
          'Customer';

        // Parse subtotal
        const subtotalValue = (() => {
          let subtotalValueRaw = order.subtotal ?? order.total ?? 0;
          let subtotalValueNum =
            typeof subtotalValueRaw === 'number'
              ? subtotalValueRaw
              : parseFloat(String(subtotalValueRaw).replace(/[^0-9.-]/g, '')) || 0;
          if (subtotalValueNum > 1000) {
            // Likely in cents, convert to dollars
            subtotalValueNum = subtotalValueNum / 100;
          }
          return subtotalValueNum;
        })();

        return {
          customer: customerName,
          orderId: order.orderId || order.id || `DD-${order.id}`,
          status,
          tabStatus,
          date: orderDate.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
          time: orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          fulfillmentType:
            order.fulfillmentType || (order.deliveryOption?.type === 'pickup' ? 'Customer pickup' : 'DashDoor delivery'),
          channel: order.channel || 'DashDoor',
          subtotal: `$${subtotalValue.toFixed(2)}`,
          rawOrderDate: orderDate,
          minutesElapsed,
          secondsElapsed,
          totalSecondsElapsed,
          // Extended fields
          userName: order.userName || order.customer,
          userEmail: order.userEmail,
          userId: order.userId,
          items: order.items,
          deliveryAddress: order.deliveryAddress,
          storeId: order.storeId,
          storeName: order.storeName,
          storeCategory: order.storeCategory,
          serviceFee: order.serviceFee,
          deliveryFee: order.deliveryFee,
          tipAmount: order.tipAmount,
          total: order.total,
        } as ProcessedOrder;
      })
      .map(order => {
        // Debug logging for new orders
        if (order.minutesElapsed !== undefined && order.minutesElapsed < 5) {
          console.log(
            `🆕 New order found: ${order.orderId}, Status: ${order.status}, Minutes: ${order.minutesElapsed}`
          );
        }
        return order;
      });
  }, [storeOrders, currentTime]);

  // Sync search value with store
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue, setSearchQuery]);

  // Update current time every second to trigger order status recalculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setLastUpdated(prev => (prev >= 60 ? 1 : prev + 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(0);
    setCurrentTime(new Date());
    // Force refetch orders
    window.location.reload();
  };

  // Reset status filter when tab changes (since status options are different per tab)
  const handleTabChange = (tab: 'Active' | 'Scheduled' | 'History') => {
    setActiveTab(tab);
    setStatusFilter(''); // Reset status filter when switching tabs
    sessionStorage.setItem('lastTabChange', Date.now().toString());
  };

  // Common filter function for all tabs
  const applyFilters = (order: ProcessedOrder) => {
    // Search filter
    const matchesSearch =
      searchValue === '' ||
      order.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchValue.toLowerCase());

    // Channel filter
    const matchesChannel =
      channelFilter === '' ||
      (channelFilter === 'DashDoor' && order.fulfillmentType === 'DashDoor delivery') ||
      (channelFilter === 'Pickup' && order.fulfillmentType === 'Customer pickup');

    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter !== 'all' && order.rawOrderDate) {
      const daysAgo = parseInt(dateRangeFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      matchesDateRange = order.rawOrderDate >= cutoffDate;
    }

    // Status filter
    const matchesStatus =
      statusFilter === '' || order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesChannel && matchesDateRange && matchesStatus;
  };

  // Split orders by tab with filters applied
  const activeOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = order.tabStatus === 'Active';
      return matchesTab && applyFilters(order);
    });
  }, [orders, searchValue, channelFilter, dateRangeFilter, statusFilter, currentTime]);

  const scheduledOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = order.tabStatus === 'Scheduled';
      return matchesTab && applyFilters(order);
    });
  }, [orders, searchValue, channelFilter, dateRangeFilter, statusFilter]);

  const historyOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesTab = order.tabStatus === 'History';
      return matchesTab && applyFilters(order);
    });
  }, [orders, searchValue, channelFilter, dateRangeFilter, statusFilter]);

  const displayedOrders =
    activeTab === 'Active'
      ? activeOrders
      : activeTab === 'Scheduled'
      ? scheduledOrders
      : historyOrders;

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
            <p className="text-sm text-gray-600">
              Track all your orders from every channel in real-time. For even more transaction
              details, go to{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Transactions
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Last updated {lastUpdated} seconds ago</span>
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium transition-colors">
              Request a Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => handleTabChange('Active')}
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === 'Active'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active
          {orders.filter(order => order.tabStatus === 'Active').length > 0 &&
            activeTab !== 'Active' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
            )}
        </button>
        <button
          onClick={() => handleTabChange('Scheduled')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'Scheduled'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => handleTabChange('History')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'History'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-4">
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          channelFilter={channelFilter}
          onChannelChange={setChannelFilter}
          dateRangeFilter={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          activeTab={activeTab}
        />
      </div>

      {/* Table */}
      {activeTab === 'Active' && (
        <ActiveOrdersTable orders={activeOrders} isLoading={isLoadingOrders} onRowClick={setSelectedOrder} />
      )}
      {activeTab === 'Scheduled' && (
        <ScheduledOrdersTable orders={scheduledOrders} isLoading={isLoadingOrders} onRowClick={setSelectedOrder} />
      )}
      {activeTab === 'History' && (
        <HistoryOrdersTable orders={historyOrders} isLoading={isLoadingOrders} onRowClick={setSelectedOrder} />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select className="border border-gray-300 rounded px-2 py-1 bg-white">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Showing 1-{displayedOrders.length} of {displayedOrders.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">Page 1 of 1</span>
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <select className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white">
              <option>1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
        Keep all your orders in one place.{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Contact Us
        </a>{' '}
        to consolidate your Drive and Marketplace orders.
      </div>
    </MerchantLayout>
  );
}
