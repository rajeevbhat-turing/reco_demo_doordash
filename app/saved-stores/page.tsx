'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import type { Restaurant } from '@/constants/restaurants';
import { useUserStore } from '@/store/user-store';
import { getDefaultRating } from '@/lib/utils/rating-utils';
import { useRestaurantsOpenStatus } from '@/lib/hooks/use-restaurant-open-status';
import { useAllDeals } from '@/lib/hooks/use-deals';
import type { Deal } from '@/types/deal-types';
import { RestaurantsSkeleton } from '@/components/skeletons/restaurant-skeleton';

/**
 * Format a deal into a short display text for restaurant cards
 */
function formatDealText(deal: Deal): string {
  const { discountType, discountValue, minimumPurchase, maximumDiscount } = deal;

  if (!discountType || discountValue === undefined) {
    return deal.title;
  }

  if (discountType === 'percentage') {
    let text = `${discountValue}% off`;
    if (minimumPurchase && minimumPurchase > 0) {
      text += ` $${minimumPurchase}+`;
    }
    if (maximumDiscount && maximumDiscount > 0) {
      text += `. Up to $${maximumDiscount} off`;
    }
    return text;
  } else if (discountType === 'fixed') {
    let text = `$${discountValue} off`;
    if (minimumPurchase && minimumPurchase > 0) {
      text += ` on $${minimumPurchase}+`;
    }
    return text;
  }

  return deal.title;
}

interface ExtendedRestaurant extends Restaurant {
  isOutOfRadius?: boolean;
}

export default function SavedStoresPage() {
  const router = useRouter();
  const [savedRestaurants, setSavedRestaurants] = useState<ExtendedRestaurant[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get authentication status and user
  const currentUser = useUserStore(state => state.currentUser);
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false
  );

  // Get user's address for distance calculation
  const defaultAddress = currentUser?.addresses?.find(a => a.default);
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().getTempAddress(),
    () => null
  );
  const activeAddress = isAuthenticated ? defaultAddress : tempAddress;

  // Calculate open status for all restaurants
  const openStatusMap = useRestaurantsOpenStatus(savedRestaurants);

  // Fetch all deals
  const { data: allDeals } = useAllDeals();

  // Create map of restaurant ID to their first deal
  const restaurantDealsMap = useMemo(() => {
    const map = new Map<string, Deal>();
    if (!allDeals) return map;

    const restaurantSpecificDeals = allDeals.filter(
      (deal: Deal) => deal.restaurantId !== null
    );

    for (const deal of restaurantSpecificDeals) {
      if (deal.restaurantId && !map.has(deal.restaurantId)) {
        map.set(deal.restaurantId, deal);
      }
    }

    return map;
  }, [allDeals]);

  // Load favorites from localStorage
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          const favoritesObj: { [userId: string]: string[] } = JSON.parse(saved);
          const userFavorites = favoritesObj[currentUser.id] || [];
          setFavorites(Array.isArray(userFavorites) ? userFavorites : []);
        } catch {
          setFavorites([]);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  // Fetch restaurant details for favorites
  useEffect(() => {
    const fetchSavedRestaurants = async () => {
      if (favorites.length === 0) {
        setSavedRestaurants([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('ids', favorites.join(','));
        if (activeAddress?.lat) params.set('lat', String(activeAddress.lat));
        if (activeAddress?.lng) params.set('lng', String(activeAddress.lng));

        const response = await fetch(`/api/restaurants/by-ids?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSavedRestaurants(data.data);
        } else {
          setSavedRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching saved restaurants:', error);
        setSavedRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedRestaurants();
  }, [favorites, activeAddress?.lat, activeAddress?.lng]);

  // Remove from favorites
  const removeFavorite = (restaurantId: string) => {
    if (!currentUser) return;

    const newFavorites = favorites.filter(id => id !== restaurantId);
    setFavorites(newFavorites);

    // Update localStorage
    const saved = localStorage.getItem('favorites');
    let favoritesObj: { [userId: string]: string[] } = {};
    if (saved) {
      try {
        favoritesObj = JSON.parse(saved);
      } catch {
        favoritesObj = {};
      }
    }
    favoritesObj[currentUser.id] = newFavorites;
    localStorage.setItem('favorites', JSON.stringify(favoritesObj));
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your saved stores</h1>
          <p className="text-gray-600 mb-6">
            Save your favorite restaurants for quick access
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#eb1700] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#c91400] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 pt-20 pb-8">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Saved Stores</h1>

      {isLoading ? (
        <RestaurantsSkeleton count={6} />
      ) : savedRestaurants.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved stores yet</h2>
          <p className="text-gray-500 mb-6">
            Tap the heart icon on any restaurant to save it here
          </p>
          <Link
            href="/home"
            className="inline-block bg-[#eb1700] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#c91400] transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedRestaurants.map(restaurant => {
            const isOpen = openStatusMap.get(restaurant.id) ?? restaurant.isOpen;
            const deal = restaurantDealsMap.get(restaurant.id);

            return (
              <div key={restaurant.id} className="relative">
                {/* Favorite button - positioned absolutely */}
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(restaurant.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
                  aria-label="Remove from favorites"
                >
                  <Heart className="w-5 h-5 fill-[#eb1700] text-[#eb1700]" />
                </button>

                <Link
                  href={`/store/${restaurant.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  prefetch={true}
                  onMouseEnter={() => {
                    router.prefetch(`/store/${restaurant.id}`);
                  }}
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={restaurant.logo || '/placeholder-logo.svg'}
                        alt={restaurant.name}
                        width={64}
                        height={64}
                        className="object-cover"
                        loading="lazy"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-logo.svg';
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{restaurant.name}</h3>
                      </div>

                      <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                        {restaurant.dashPass && (
                          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-flex items-center">
                            DashPass
                          </span>
                        )}
                      </div>

                      {restaurant?.rating && restaurant.rating !== 0 ? (
                        <div className="text-sm text-gray-500">
                          ★ {getDefaultRating(restaurant.rating)} ({restaurant.reviews || '0'})
                        </div>
                      ) : null}

                      <div className="text-sm text-gray-500">
                        {restaurant.distance && (
                          <>
                            <span>{restaurant.distance}</span>
                            <span className="mx-1">•</span>
                          </>
                        )}
                        <span>{isOpen ? restaurant.time : 'Closed'}</span>
                      </div>

                      <div className="text-sm text-gray-500">{restaurant.deliveryFee}</div>

                      {/* Out of delivery radius notice */}
                      {restaurant.isOutOfRadius && (
                        <div className="text-sm font-medium text-red-600 mt-1">
                          Out of delivery radius
                        </div>
                      )}

                      {/* Restaurant-specific deal */}
                      {deal && (
                        <div className="text-xs font-medium text-red-600 mt-1 bg-red-50 px-2 py-0.5 rounded inline-block">
                          {formatDealText(deal)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
