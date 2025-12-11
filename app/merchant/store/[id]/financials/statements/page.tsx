'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { ExternalLink } from 'lucide-react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';

interface Statement {
  month: string;
  sales: string;
  dashDoorServices: string;
  amendments: string;
  netTotal: string;
}

const mockStatements: Statement[] = [
  {
    month: 'March 2025',
    sales: '$0.00',
    dashDoorServices: '-$18.00',
    amendments: '$0.00',
    netTotal: '-$18.00',
  },
  {
    month: 'February 2025',
    sales: '$0.00',
    dashDoorServices: '-$12.00',
    amendments: '$27.00',
    netTotal: '$15.00',
  },
  {
    month: 'January 2025',
    sales: '$16.96',
    dashDoorServices: '-$28.57',
    amendments: '$0.00',
    netTotal: '-$11.61',
  },
  {
    month: 'December 2024',
    sales: '$24.62',
    dashDoorServices: '-$32.10',
    amendments: '$0.00',
    netTotal: '-$7.48',
  },
  {
    month: 'November 2024',
    sales: '$27.50',
    dashDoorServices: '-$28.19',
    amendments: '$0.00',
    netTotal: '-$0.69',
  },
  {
    month: 'October 2024',
    sales: '$0.00',
    dashDoorServices: '-$24.00',
    amendments: '$0.00',
    netTotal: '-$24.00',
  },
  {
    month: 'September 2024',
    sales: '$26.57',
    dashDoorServices: '-$25.44',
    amendments: '$0.00',
    netTotal: '$1.13',
  },
  {
    month: 'August 2024',
    sales: '$723.00',
    dashDoorServices: '-$18.38',
    amendments: '$0.00',
    netTotal: '-$11.15',
  },
];

/**
 * Route: /merchant/store/[id]/financials/statements
 *
 * Statements page for a specific store
 */
export default function StatementsPage() {
  const params = useParams();
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [storeSet, setStoreSet] = useState(false);
  const [activeTab, setActiveTab] = useState<'Monthly statements' | 'Tax forms'>(
    'Monthly statements'
  );
  const [selectedYear, setSelectedYear] = useState('All years');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());

  const storeIdParam = params.id as string;

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

  const toggleMonthSelection = (month: string) => {
    const updated = new Set(selectedMonths);
    if (updated.has(month)) {
      updated.delete(month);
    } else {
      updated.add(month);
    }
    setSelectedMonths(updated);
  };

  // Show loading state while finding store
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
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statements</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('Monthly statements')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'Monthly statements'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly statements
          </button>
          <button
            onClick={() => setActiveTab('Tax forms')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'Tax forms'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tax forms
          </button>
        </div>

        {activeTab === 'Monthly statements' && (
          <>
            {/* Section Header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Monthly statements</h2>
              <p className="text-sm text-gray-600">
                These are your monthly statements based on your business activity. Monthly
                statements will be available by the 5th day of every month.
              </p>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
              >
                <option>All years</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>

            {/* Statements Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-medium px-4 py-3 text-gray-700 w-12">
                      <input
                        type="checkbox"
                        checked={selectedMonths.size === mockStatements.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMonths(new Set(mockStatements.map(s => s.month)));
                          } else {
                            setSelectedMonths(new Set());
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="text-left font-medium px-4 py-3 text-gray-700">Month</th>
                    <th className="text-right font-medium px-4 py-3 text-gray-700">Sales</th>
                    <th className="text-right font-medium px-4 py-3 text-gray-700">
                      DashDoor services
                    </th>
                    <th className="text-right font-medium px-4 py-3 text-gray-700">Amendments</th>
                    <th className="text-right font-medium px-4 py-3 text-gray-700">Net total</th>
                    {/* <th className="text-right font-medium px-4 py-3 text-gray-700">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {mockStatements.map(statement => (
                    <tr key={statement.month} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMonths.has(statement.month)}
                          onChange={() => toggleMonthSelection(statement.month)}
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">{statement.month}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{statement.sales}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {statement.dashDoorServices}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{statement.amendments}</td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          statement.netTotal.startsWith('-') ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {statement.netTotal}
                      </td>
                      {/* <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Tax forms' && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">Tax forms will be available here.</p>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
