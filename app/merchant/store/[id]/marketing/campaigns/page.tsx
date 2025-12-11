'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Search, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: 'Active' | 'Paused' | 'Ended';
  startDate: string;
  endDate: string | null;
  sales: string;
  newCustomers: number | string;
  spend: string;
  ro: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 'interops-biz-admin-mxp-sl-ars-2',
    name: 'Interops - biz admin MxP SL - ARS 2',
    channel: 'Marketplace',
    status: 'Active',
    startDate: '04/14/2025',
    endDate: null,
    sales: '$0.00',
    newCustomers: 'N/A',
    spend: '$0.00',
    ro: 'N/A',
  },
  {
    id: 'interops-business-admin-sl-mxp-rename',
    name: 'Interops Business Admin SL MxP - Rename Xiaochuan',
    channel: 'Marketplace',
    status: 'Active',
    startDate: '04/10/2025',
    endDate: null,
    sales: '$0.00',
    newCustomers: 0,
    spend: '$0.00',
    ro: 'N/A',
  },
  {
    id: 'rohan-demo-4-10',
    name: 'ROHAN DEMO 4/10',
    channel: 'Marketplace',
    status: 'Active',
    startDate: '04/02/2025',
    endDate: null,
    sales: '$0.00',
    newCustomers: 0,
    spend: '$0.00',
    ro: 'N/A',
  },
  {
    id: 'sponsored-listing-03-29',
    name: 'Sponsored Listing 03/29/2025',
    channel: 'Marketplace',
    status: 'Active',
    startDate: '03/30/2025',
    endDate: null,
    sales: '$0.00',
    newCustomers: 0,
    spend: '$0.00',
    ro: 'N/A',
  },
];

type SortField =
  | 'name'
  | 'channel'
  | 'status'
  | 'startDate'
  | 'endDate'
  | 'sales'
  | 'newCustomers'
  | 'spend'
  | 'ro';
type SortDirection = 'asc' | 'desc';

/**
 * Route: /merchant/store/[id]/marketing/campaigns
 *
 * Marketing campaigns page for a specific store
 */
export default function CampaignsPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentStoreId, currentStoreId: contextStoreId, currentStoreData } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [storeSet, setStoreSet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Ads & promotions' | 'Emails'>('Ads & promotions');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState('All campaigns');

  const storeIdParam = params.id as string;

  // Track mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet || !mounted) return;

    let restaurant = restaurants.find(r => r.id === storeIdParam);
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
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet, mounted]);

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
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('All channels');
  const [selectedTimeframeFilter, setSelectedTimeframeFilter] = useState('Last 7 days');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const storeName = currentStoreData?.storeName || 'Store';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-gray-900" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-900" />
    );
  };

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampaignFilter =
      selectedCampaignFilter === 'All campaigns' || campaign.status === selectedCampaignFilter;
    const matchesChannelFilter =
      selectedChannelFilter === 'All channels' || campaign.channel === selectedChannelFilter;
    return matchesSearch && matchesCampaignFilter && matchesChannelFilter;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'startDate' || sortField === 'endDate') {
      // Simple date comparison (assuming MM/DD/YYYY format)
      aValue = new Date(aValue || '01/01/1970');
      bValue = new Date(bValue || '01/01/1970');
    } else if (sortField === 'sales' || sortField === 'spend') {
      // Remove $ and parse as float
      aValue = parseFloat(aValue.replace('$', '').replace(',', '')) || 0;
      bValue = parseFloat(bValue.replace('$', '').replace(',', '')) || 0;
    } else if (sortField === 'newCustomers') {
      aValue = typeof aValue === 'number' ? aValue : 0;
      bValue = typeof bValue === 'number' ? bValue : 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
            <p className="text-sm text-gray-600">
              Review campaigns and create reports for {storeName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/merchant/store/${storeIdParam}/reports/create`)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              Create report
            </button>
            <button
              onClick={() => router.push(`/merchant/store/${storeIdParam}/marketing/run-campaign`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Run a campaign
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('Ads & promotions')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'Ads & promotions'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ads & promotions
          </button>
          <button
            onClick={() => setActiveTab('Emails')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'Emails'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Emails
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedCampaignFilter}
              onChange={e => setSelectedCampaignFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
            >
              <option>All campaigns</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Ended</option>
            </select>
            <select
              value={selectedChannelFilter}
              onChange={e => setSelectedChannelFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
            >
              <option>All channels</option>
              <option>Marketplace</option>
              <option>Drive</option>
            </select>
            <select
              value={selectedTimeframeFilter}
              onChange={e => setSelectedTimeframeFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Name
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('channel')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Channel
                    <SortIcon field="channel" />
                  </button>
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('startDate')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Start date
                    <SortIcon field="startDate" />
                  </button>
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('endDate')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    End date
                    <SortIcon field="endDate" />
                  </button>
                </th>
                <th className="text-right font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('sales')}
                    className="flex items-center gap-1 hover:text-gray-900 ml-auto"
                  >
                    Sales
                    <SortIcon field="sales" />
                  </button>
                </th>
                <th className="text-right font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('newCustomers')}
                    className="flex items-center gap-1 hover:text-gray-900 ml-auto"
                  >
                    New customers
                    <SortIcon field="newCustomers" />
                  </button>
                </th>
                <th className="text-right font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('spend')}
                    className="flex items-center gap-1 hover:text-gray-900 ml-auto"
                  >
                    Spend
                    <SortIcon field="spend" />
                  </button>
                </th>
                <th className="text-right font-medium px-4 py-3 text-gray-700">
                  <button
                    onClick={() => handleSort('ro')}
                    className="flex items-center gap-1 hover:text-gray-900 ml-auto"
                  >
                    RO
                    <SortIcon field="ro" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map(campaign => (
                <tr
                  key={campaign.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/merchant/store/${storeIdParam}/marketing/campaigns/${campaign.id}`
                    )
                  }
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/merchant/marketing/campaigns/${campaign.id}`}
                      className="text-gray-900 font-medium underline hover:text-gray-700"
                      onClick={e => e.stopPropagation()}
                    >
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{campaign.channel}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          campaign.status === 'Active'
                            ? 'bg-green-500'
                            : campaign.status === 'Paused'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-gray-700">{campaign.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{campaign.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{campaign.endDate || 'None'}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{campaign.sales}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {typeof campaign.newCustomers === 'number'
                      ? campaign.newCustomers
                      : campaign.newCustomers}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">{campaign.spend}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{campaign.ro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MerchantLayout>
  );
}
