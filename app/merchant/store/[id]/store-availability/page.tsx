'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
}

/**
 * Route: /merchant/store/[id]/store-availability
 *
 * Store Availability page for a specific store
 */
export default function StoreAvailabilityPage() {
  const params = useParams();
  const storeId = params.id as string;

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu categories for the current store
  useEffect(() => {
    async function fetchMenuCategories() {
      if (!storeId) return;

      try {
        const response = await fetch(`/api/merchant/restaurants/${storeId}/menu`);
        const result = await response.json();

        if (result.success && result.data?.categories) {
          const categories = result.data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
          }));
          setMenuCategories(categories);
          // Select first category by default
          if (categories.length > 0 && !selectedMenu) {
            setSelectedMenu(categories[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch menu categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenuCategories();
  }, [storeId, selectedMenu]);

  // Show loading state
  if (isLoading) {
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
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store availability</h1>
        </div>

        {/* Store status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store status</h2>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-medium text-gray-900">Paused</span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            All ordering channels are currently paused from receiving orders. This store will reopen
            on DashDoor at 12:16 AM PDT on 4/29/2025.
          </p>

          <div className="flex items-center gap-4 mb-6">
            {/* <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
              <Play className="h-4 w-4" />
              Open all ordering channels
            </button> */}
            {/* <Link
              href={`/merchant/store/${storeIdParam}/store-availability/status-history`}
              className="text-sm text-blue-600 hover:underline"
            >
              View status history
            </Link> */}
          </div>

          {/* Ordering channels table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">
                    Ordering channel
                  </th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Status</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-900">Marketplace</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                        <AlertCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-700">Paused</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600">
                      Paused for 1 day. Automatically reopens 12:16 AM PDT on 4/29/2025.
                    </div>
                    {/* <a href="#" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                      View store page
                    </a> */}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Drive On-Demand</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-700">Active</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    This store is currently available to use DashDoor Drive On-Demand.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Regular menu hours */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Regular menu hours</h2>
          <p className="text-sm text-gray-600 mb-4">
            These are the hours your store is available on DashDoor. Last updated on Mon, Apr 28,
            2025, 4:36 AM PDT.
          </p>

          <div className="flex items-center gap-4 mb-4">
            <select
              value={selectedMenu}
              onChange={e => setSelectedMenu(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
            >
              {menuCategories.length > 0 ? (
                menuCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="">No menus available</option>
              )}
            </select>
          </div>

          {/* Menu hours list */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {[
                { day: 'Monday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Tuesday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Wednesday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Thursday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Friday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Saturday', hours: '07:00 AM - 09:00 PM' },
                { day: 'Sunday', hours: '07:00 AM - 09:00 PM' },
              ].map(schedule => (
                <div
                  key={schedule.day}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">{schedule.day}</span>
                  <span className="text-sm text-gray-600">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special hours and closures */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Special hours and closures</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add special hours or closures for holidays, special events, or other exceptional events.
            This will temporarily replace your regular menu hours.
          </p>

          {/* <button className="mb-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            + Add new
          </button> */}

          {/* Empty table */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Name</th>
                  <th className="text-left font-medium px-4 py-3 text-gray-700">Dates</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No special hours or closures
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
