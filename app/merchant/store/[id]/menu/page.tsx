'use client';

import { useEffect, useMemo, useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Star, X } from 'lucide-react';
import { useMerchantMenuStore } from '@/store/merchant-menu-store';
import OverviewTab from '@/components/merchant/menu-manager/OverviewTab';
import { useMerchantMenu } from '@/lib/hooks/use-merchant-menu';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/use-restaurants';
import { useParams } from 'next/navigation';
import ModifiersTab from '@/components/merchant/menu-manager/ModifiersTab';
import { mergeMenuCategories } from '@/lib/utils/merchant/store-menu-utils';

/**
 * Route: /merchant/store/[id]/menu
 *
 * Menu Manager page for a specific store - displays all menu items and categories
 * Gets store ID from URL params and ensures all menu items are displayed correctly
 */
export default function MerchantStoreMenuPage() {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [storeSet, setStoreSet] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modifiers'>('overview');

  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();

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
      // Only set if it's different from current store ID to avoid unnecessary updates
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id);
        console.log(`✅ Set merchant store to: ${restaurant.name} (ID: ${restaurant.id})`);
      }
      // Set merchant mode flag in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true');
      }
      setStoreSet(true);
    } else {
      console.warn(`Store not found: ${storeIdParam}, using default`);
      // If store not found, set to default store (ID 1)
      if (contextStoreId !== '1') {
        setCurrentStoreId('1');
      }
      setStoreSet(true);
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet]);

  // Find the current restaurant directly from URL param - this is the source of truth
  const currentRestaurant = useMemo(() => {
    if (!restaurants || isLoading) return null;

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

    return restaurant;
  }, [restaurants, storeIdParam, isLoading]);

  // Use restaurant.id which is the numeric database ID as string (e.g., "56")
  // Fallback to storeIdParam if restaurant not found yet
  const numericStoreId = currentRestaurant?.id || storeIdParam || null;

  // Fetch menu items from database (only after mount to prevent hydration issues)
  const { categories: dbCategories, isLoading: isLoadingMenu } = useMerchantMenu(
    isMounted ? numericStoreId : null
  );

  const {
    expandedCategories,
    showBanner,
    toggleCategory,
    setShowBanner,
    setCategories: setStoreCategories,
    deletedItemIds,
  } = useMerchantMenuStore();

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update store when database categories change (only after mount)
  useEffect(() => {
    if (isMounted && dbCategories.length > 0) {
      const currentStoreCategories = useMerchantMenuStore.getState().categories;
      const merged = mergeMenuCategories({
        dbCategories,
        storeCategories: currentStoreCategories,
        deletedItemIds,
      });
      setStoreCategories(merged);
      // Auto-expand first category if none are expanded
      if (expandedCategories.size === 0 && merged.length > 0) {
        toggleCategory(merged[0].id);
      }
    }
  }, [
    isMounted,
    dbCategories,
    setStoreCategories,
    expandedCategories,
    toggleCategory,
    deletedItemIds,
  ]);

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
        <OverviewTab isLoadingMenu={isLoadingMenu} isMounted={isMounted} />
      ) : (
        <ModifiersTab />
      )}
    </MerchantLayout>
  );
}
