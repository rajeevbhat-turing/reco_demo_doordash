'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchAllRestaurants } from '@/lib/api/merchant/restaurants';
import type { Restaurant } from '@/constants/restaurants';
import { useMerchantStoresStore, MerchantStore } from '@/store/merchant-stores-store';

/**
 * Convert MerchantStore to Restaurant format
 */
function convertMerchantStoreToRestaurant(store: MerchantStore): Restaurant {
  // Parse address from storeAddress string (format: "street, city, state zipCode")
  const addressParts = store.storeAddress.split(',').map(part => part.trim());
  const street = addressParts[0] || '';
  const city = addressParts[1] || '';
  const stateZipParts = (addressParts[2] || '').split(' ').filter(Boolean);
  const state = stateZipParts[0] || '';
  const zipCode = stateZipParts[1] || '';

  // Build opening hours string from store data or use default
  const openingHours = store.openingHours
    ? `${store.openingHours.open} - ${store.openingHours.close}`
    : 'Not set';

  return {
    id: store.id,
    name: store.storeName,
    logo: '/placeholder-logo.png',
    banner: '/placeholder-banner.png',
    rating: null,
    reviews: null,
    distance: '',
    time: '',
    deliveryFee: '$0.00',
    isFreeDelivery: true,
    minDeliveryFee: 0,
    priceRange: '$$',
    cuisine: store.businessType,
    dashPass: false,
    isOpen: true,
    openingHours,
    street,
    city,
    state,
    zipCode,
    lat: store.lat ?? 0,
    lng: store.lng ?? 0,
    phone: store.phone,
  };
}

/**
 * Hook to fetch all restaurants (for merchant portal, etc.)
 * Combines API restaurants with locally created merchant stores
 *
 * @returns Query result with all restaurants data
 */
export function useAllRestaurants() {
  const merchantStores = useMerchantStoresStore(state => state.stores);

  const query = useQuery<Restaurant[]>({
    queryKey: ['allRestaurants'],
    queryFn: () => fetchAllRestaurants(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1, // Retry once on failure
  });

  // Combine API restaurants with merchant stores
  const combinedData = useMemo(() => {
    const apiRestaurants = query.data || [];
    const convertedStores = merchantStores.map(convertMerchantStoreToRestaurant);

    // Combine and deduplicate by id
    const allRestaurants = [...apiRestaurants];
    convertedStores.forEach(store => {
      if (!allRestaurants.some(r => r.id === store.id)) {
        allRestaurants.push(store);
      }
    });

    return allRestaurants;
  }, [query.data, merchantStores]);

  return {
    ...query,
    data: combinedData,
  };
}
