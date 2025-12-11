'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { ChevronDown } from 'lucide-react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';

/**
 * Route: /merchant/store/[id]/customers/insights
 *
 * Customer Insights page for a specific store
 */
export default function CustomerInsightsPage() {
  const params = useParams();
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [storeSet, setStoreSet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [selectedCustomerType, setSelectedCustomerType] = useState('All');

  const storeIdParam = params.id as string;

  // Track mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get orders from merchant orders store
  const { orders: allOrders } = useMerchantOrdersStore();

  // Filter orders for this store
  const storeOrders = useMemo(() => {
    if (!storeIdParam) return [];
    return allOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId;
      return String(orderStoreId) === String(storeIdParam);
    });
  }, [allOrders, storeIdParam]);

  // Calculate customer insights from merchant orders
  const calculatedInsights = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Determine date range based on selected period
    if (selectedPeriod === 'This month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (selectedPeriod === 'Last month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      // This year
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Filter orders in the selected period
    const periodOrders = storeOrders.filter((order: any) => {
      const orderDate = order.orderDate ? new Date(order.orderDate) : null;
      if (!orderDate) return false;
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Get unique customers
    const customerMap = new Map<string, { orders: any[]; userId: string | null }>();
    periodOrders.forEach((order: any) => {
      const customerKey =
        order.userId || order.userName || order.deliveryAddress?.street || 'anonymous';
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, { orders: [], userId: order.userId || null });
      }
      customerMap.get(customerKey)!.orders.push(order);
    });

    const totalCustomers = customerMap.size;
    const customers = Array.from(customerMap.values());

    // Categorize customers
    const newCustomers = customers.filter(c => c.orders.length === 1).length;
    const occasionalCustomers = customers.filter(
      c => c.orders.length >= 2 && c.orders.length <= 4
    ).length;
    const frequentCustomers = customers.filter(c => c.orders.length >= 5).length;

    const newCustomersPercent =
      totalCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0;
    const occasionalCustomersPercent =
      totalCustomers > 0 ? Math.round((occasionalCustomers / totalCustomers) * 100) : 0;
    const frequentCustomersPercent =
      totalCustomers > 0 ? Math.round((frequentCustomers / totalCustomers) * 100) : 0;

    // Get customer locations (zip codes)
    const zipCodeMap = new Map<string, number>();
    periodOrders.forEach((order: any) => {
      const zipCode = order.deliveryAddress?.zipCode;
      if (zipCode) {
        zipCodeMap.set(zipCode, (zipCodeMap.get(zipCode) || 0) + 1);
      }
    });

    // Filter zip codes with at least 2 customers
    const customerLocations = Array.from(zipCodeMap.entries())
      .filter(([_, count]) => count >= 2)
      .map(([zipCode, customerCount]) => ({ zipCode, customerCount }))
      .sort((a, b) => b.customerCount - a.customerCount);

    return {
      totalCustomers,
      newCustomers,
      newCustomersPercent,
      occasionalCustomers,
      occasionalCustomersPercent,
      frequentCustomers,
      frequentCustomersPercent,
      customerLocations,
      totalCustomersChange: 0, // Can't calculate change without prior period data
    };
  }, [storeOrders, selectedPeriod]);

  // Use calculated insights from merchant orders store
  const insightsData = calculatedInsights;
  const isLoadingInsights = false; // No loading since we're using store data

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet) return;

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants.find(r => r.id === storeIdParam);

    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants.find(
        r =>
          r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
          r.name === storeIdParam
      );
    }

    if (restaurant) {
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true');
      }
      setStoreSet(true);
    } else {
      if (contextStoreId !== '1') {
        setCurrentStoreId('1');
      }
      setStoreSet(true);
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet]);

  // Show loading state while finding store or not mounted
  if (isLoading || !mounted) {
    return (
      <MerchantLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Date Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="appearance-none flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 bg-white pr-8 cursor-pointer"
              >
                <option value="This month">This month</option>
                <option value="Last month">Last month</option>
                <option value="This year">This year</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Overview</h2>
              <p className="text-sm text-gray-600">
                {selectedPeriod === 'This month'
                  ? `${new Date().toLocaleString('en-US', { month: 'short' })} 1 - ${new Date().getDate()}, ${new Date().getFullYear()}`
                  : selectedPeriod === 'Last month'
                    ? `${new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString('en-US', { month: 'short' })} 1 - ${new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()}, ${new Date().getFullYear()}`
                    : `Jan 1 - ${new Date().toLocaleString('en-US', { month: 'short' })} ${new Date().getDate()}, ${new Date().getFullYear()}`}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Last updated on{' '}
              {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Customers */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#ef4444"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${insightsData?.totalCustomers ? Math.min((insightsData.totalCustomers / 100) * 351.86, 351.86) : 0} 351.86`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {isLoadingInsights ? '...' : insightsData?.totalCustomers || 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Total customers</div>
              <div
                className={`text-sm ${insightsData?.totalCustomersChange && parseFloat(String(insightsData.totalCustomersChange)) > 0 ? 'text-green-600' : insightsData?.totalCustomersChange && parseFloat(String(insightsData.totalCustomersChange)) < 0 ? 'text-red-600' : 'text-gray-500'}`}
              >
                {isLoadingInsights
                  ? '--%'
                  : insightsData?.totalCustomersChange
                    ? `${insightsData.totalCustomersChange > 0 ? '+' : ''}${insightsData.totalCustomersChange}%`
                    : '--%'}
              </div>
            </div>

            {/* New Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">New</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoadingInsights ? '--' : `${insightsData?.newCustomersPercent || 0}%`}
              </div>
              <div className="text-sm text-gray-500">
                {isLoadingInsights ? '...' : `${insightsData?.newCustomers || 0} customers`}
              </div>
            </div>

            {/* Occasional Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Occasional</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoadingInsights ? '--' : `${insightsData?.occasionalCustomersPercent || 0}%`}
              </div>
              <div className="text-sm text-gray-500">
                {isLoadingInsights ? '...' : `${insightsData?.occasionalCustomers || 0} customers`}
              </div>
            </div>

            {/* Frequent Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Frequent</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoadingInsights ? '--' : `${insightsData?.frequentCustomersPercent || 0}%`}
              </div>
              <div className="text-sm text-gray-500">
                {isLoadingInsights ? '...' : `${insightsData?.frequentCustomers || 0} customers`}
              </div>
            </div>
          </div>

          {/* DashPass Description */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              DashPass is a loyalty subscription service for customers. DashPass customers
              frequently place high-value orders.
            </p>
          </div>
        </div>

        {/* Customer Locations Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Customer locations</h2>
            <p className="text-sm text-gray-600 mb-4">Top delivery destinations</p>

            {/* Customer Type Filters */}
            <div className="flex items-center gap-2 mb-4">
              {['All', 'New', 'Occasional', 'Frequent'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedCustomerType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCustomerType === type
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This map shows customer locations when at least 2 customers place orders from the same
              zip code.
            </p>
          </div>

          {/* Customer Locations List */}
          {insightsData?.customerLocations && insightsData.customerLocations.length > 0 ? (
            <div className="space-y-2 mb-4">
              {insightsData.customerLocations.map((location: any) => (
                <div
                  key={location.zipCode}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Zip Code: {location.zipCode}
                    </p>
                    <p className="text-xs text-gray-600">
                      {location.customerCount}{' '}
                      {location.customerCount === 1 ? 'customer' : 'customers'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                No customer locations with multiple customers found.
              </p>
            </div>
          )}

          {/* Map Placeholder */}
          <div className="w-full h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Map View</p>
              <p className="text-sm">
                {insightsData?.customerLocations && insightsData.customerLocations.length > 0
                  ? `${insightsData.customerLocations.length} customer location${insightsData.customerLocations.length === 1 ? '' : 's'} found`
                  : 'Customer locations map will be displayed here'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
