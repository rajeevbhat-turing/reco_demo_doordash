'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import VerticalListPage from '@/components/vertical-list-page';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useUserStore } from '@/store/user-store';
import { Suspense, useMemo } from 'react';
import { RestaurantsSkeleton } from '@/components/skeletons/restaurant-skeleton';
import { useAllDeals } from '@/lib/hooks/use-deals';
import type { Deal } from '@/types/deal-types';
import { hasValidLogo } from '@/lib/utils/helperFunctions';

// Inner component that uses searchParams
function AllItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get user's address for location-based filtering
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses?.find(a => a.default);

  // Fetch restaurants near user's address
  const { data: restaurants, isLoading } = useRestaurants(
    defaultAddress?.lat,
    defaultAddress?.lng,
    10 // 10 mile radius
  );

  // Get parameters from the URL
  const title = decodeURIComponent(searchParams.get('title') || 'All Items');
  const type = searchParams.get('type') || 'restaurant';
  const section = searchParams.get('section')
    ? decodeURIComponent(searchParams.get('section') || '')
    : '';

  // Only fetch all deals when needed for "deals-for-you" section (optimization)
  const shouldFetchDeals = section === 'deals-for-you';
  const { data: allDeals } = useAllDeals(shouldFetchDeals);

  // Get the items based on the section - memoized to prevent unnecessary recalculations
  const items = useMemo(() => {
    // Restaurant items
    if (type === 'restaurant') {
      if (!restaurants) return [];

      let filteredRestaurants: any[] = [];

      switch (section) {
        case 'national-favourites':
          filteredRestaurants = restaurants.filter(
            r => r.featured === true && hasValidLogo(r.logo)
          );
          break;
        case 'fastest-near-you':
          filteredRestaurants = restaurants.filter(r => {
            const timeStr = r.time;
            const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '100');
            return minutes < 30 && hasValidLogo(r.logo);
          });
          break;
        case 'deals-for-you':
          // Filter restaurants that have at least one restaurant-specific deal
          if (allDeals && allDeals.length > 0) {
            const restaurantIdsWithDeals = new Set<string>(
              allDeals
                .filter(
                  (deal: Deal) => deal.restaurantId !== null && deal.id !== 'dashpass-delivery-fee'
                )
                .map((deal: Deal) => deal.restaurantId!)
            );
            filteredRestaurants = restaurants.filter(
              r => restaurantIdsWithDeals.has(r.id) && hasValidLogo(r.logo)
            );
          } else {
            filteredRestaurants = [];
          }
          break;
        case 'new-on-dashdoor':
          filteredRestaurants = restaurants.filter(r => r.new && hasValidLogo(r.logo));
          break;
        case 'all-stores':
        default:
          filteredRestaurants = restaurants; // Filter "all-stores" section too
      }

      // Convert restaurants to ListItem format
      return filteredRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.banner || restaurant.logo || '',
        rating: restaurant.rating,
        reviews: restaurant.reviews,
        distance: restaurant.distance,
        time: restaurant.time,
        deliveryFee: restaurant.deliveryFee,
        category: restaurant.category,
        cuisine: restaurant.cuisine,
        tags: restaurant.tags,
        dashPass: restaurant.dashPass,
        isOpen: restaurant.isOpen,
        discount: restaurant.discount,
        featured: restaurant.featured,
        new: restaurant.new,
      }));
    }

    // Only restaurants are supported now
    // Return empty array for non-restaurant types

    // Default to empty array for other types
    return [];
  }, [restaurants, section, type, allDeals]);

  const handleBack = () => {
    // Redirect to the appropriate home page based on the type
    switch (type) {
      case 'restaurant':
        router.push('/home');
        break;
      case 'grocery':
        router.push('/grocery');
        break;
      case 'pets':
        router.push('/pets');
        break;
      case 'retail':
        router.push('/retail');
        break;
      case 'convenience':
        router.push('/convenience');
        break;
      default:
        router.push('/home');
    }
  };

  // Determine the URL prefix based on the type
  const getUrlPrefix = () => {
    switch (type) {
      case 'restaurant':
        return '/store';
      case 'grocery':
        return '/grocery/store';
      case 'pets':
        return '/pets/store';
      case 'retail':
        return '/retail/store';
      case 'convenience':
        return '/convenience/store';
      default:
        return '/store';
    }
  };

  // Show loading skeleton while fetching restaurants
  if (type === 'restaurant' && isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <RestaurantsSkeleton count={12} />
      </div>
    );
  }

  // Show address prompt if no address for restaurants
  if (type === 'restaurant' && !defaultAddress) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-3">Add Your Delivery Address</h2>
          <p className="text-gray-600 mb-4">
            We need your address to show restaurants that deliver to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <VerticalListPage
      title={title}
      items={items}
      onBackClick={handleBack}
      categoryType={type}
      urlPrefix={getUrlPrefix()}
    />
  );
}

// Loading fallback component
function LoadingContent() {
  return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
}

// Main component with Suspense boundary
export default function AllItemsPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <AllItemsContent />
    </Suspense>
  );
}
