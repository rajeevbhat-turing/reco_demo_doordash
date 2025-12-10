'use client';

import { useEffect, useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Star, X } from 'lucide-react';
import { useMerchantMenuStore } from '@/store/merchant-menu-store';
import OverviewTab from '@/components/merchant/menu-manager/OverviewTab';
import ModifiersTab from '@/components/merchant/menu-manager/ModifiersTab';

/**
 * Route: /merchant/store/[id]/menu
 *
 * Menu Manager page for a specific store - displays all menu items and categories
 * Gets store ID from URL params and ensures all menu items are displayed correctly
 */
export default function MerchantStoreMenuPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modifiers'>('overview');

  const {
    categories: storeCategories,
    expandedCategories,
    showBanner,
    toggleCategory,
    setShowBanner,
  } = useMerchantMenuStore();

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure at least one category expanded when data is present
  useEffect(() => {
    if (!isMounted) return;
    if (expandedCategories.size === 0 && storeCategories.length > 0) {
      toggleCategory(storeCategories[0].id);
    }
  }, [
    isMounted,
    expandedCategories,
    toggleCategory,
    storeCategories,
  ]);

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Manager</h1>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('modifiers')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'modifiers'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Modifiers
          </button>
        </div>
      </div>

      {/* Information Banner */}
      {showBanner && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 relative">
          <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3">
              Help us get your pickup times right by reviewing suggested prep times. We've
              automatically set prep times for your items. Confirm that they're correct and make any
              edits to help ensure Dashers arrive at the right time.
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Review prep times
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs content */}
      {activeTab === 'overview' ? (
        <OverviewTab isLoadingMenu={false} isMounted={isMounted} />
      ) : (
        <ModifiersTab />
      )}
    </MerchantLayout>
  );
}
