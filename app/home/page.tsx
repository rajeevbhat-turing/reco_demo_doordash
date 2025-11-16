'use client';

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import FoodCategories from '@/components/food-categories';
import FilterOptions, {
  type FilterOptionsRef,
  type FilterState,
} from '@/components/filter-options';
import PromoBanners from '@/components/promo-banners';
import RestaurantSection from '@/components/restaurant-section';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useAllDeals } from '@/lib/hooks/use-deals';
import type { Restaurant } from '@/constants/restaurants';
import type { Deal } from '@/types/deal-types';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import { useAppStore } from '@/store/app-store';
import { getDefaultRating } from '@/utils/rating-utils';
import { RestaurantsSkeleton } from '@/components/skeletons/restaurant-skeleton';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null,
    dashPass: false,
    cuisine: null,
    dietaryPreferences: null,
  });
  const [allFilteredRestaurants, setAllFilteredRestaurants] = useState<Restaurant[]>([]);
  const filterOptionsRef = useRef<FilterOptionsRef>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { updateSearchResults, clearSearchResults } = useAppStore();

  // Get cart store to set category
  const cartStore = useCartStore();

  // Get authentication status
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  );

  // Get user's address for location-based filtering
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses.find(a => a.default);

  // Get temp address for guest users
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().getTempAddress(),
    () => null // fallback for SSR
  );

  // Determine which address to use: logged-in user's default address or guest's temp address
  const activeAddress = isAuthenticated ? defaultAddress : tempAddress;

  // Fetch restaurants near user's address
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useRestaurants(
    activeAddress?.lat,
    activeAddress?.lng,
    10 // 10 mile radius
  );

  // Set the category to restaurant when component mounts
  useEffect(() => {
    cartStore.setCategory('restaurant');
  }, []);

  // Get address from user store for location filtering
  const { getAddresses, getTempAddress } = useUserStore();
  const addresses = getAddresses();
  const userIsAuthenticated = isAuthenticated;

  // Get active address (selected address for authenticated users, temp address for non-authenticated)
  const selectedAddress = useMemo(() => {
    if (userIsAuthenticated && addresses.length > 0) {
      // Find default address or use first address
      return addresses.find(a => a.default) || addresses[0] || null;
    }
    return null;
  }, [userIsAuthenticated, addresses]);

  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidLogo = (logoUrl: string | undefined): boolean => {
    if (!logoUrl || logoUrl.trim() === '') return false;
    if (logoUrl.includes('placeholder.svg')) return false;
    if (logoUrl.includes('placeholder.png')) return false;
    return true;
  };

  // Function to filter out non-restaurant stores from the restaurants array
  const filterOnlyRestaurants = (restaurantList: Restaurant[]): Restaurant[] => {
    const nonRestaurantIds = [
      'target',
      'michaels',
      'designer-blooms',
      'safeway-flower-shop',
      'the-bouqs-co.-flower-shop',
    ];
    return restaurantList.filter(restaurant => !nonRestaurantIds.includes(restaurant.id));
  };

  // Function to apply default ratings to restaurants
  const withDefaultRatings = (restaurantList: Restaurant[]): Restaurant[] => {
    return restaurantList.map(restaurant => ({
      ...restaurant,
      rating: getDefaultRating(restaurant.rating),
    }));
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    // Scroll to top when a category is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get only actual restaurants (filter out stores like Target, flower shops)
  const actualRestaurants = useMemo(() => {
    if (!restaurants) return [];
    return withDefaultRatings(filterOnlyRestaurants(restaurants));
  }, [restaurants]);

  // Group restaurants by their section field from the database
  const restaurantsBySection = useMemo(() => {
    const sections: { [key: string]: Restaurant[] } = {};

    actualRestaurants.forEach(restaurant => {
      const section = restaurant.section || 'Other';
      if (!sections[section]) {
        sections[section] = [];
      }
      if (hasValidLogo(restaurant.logo)) {
        sections[section].push(restaurant);
      }
    });

    // Limit each section to 8 restaurants
    Object.keys(sections).forEach(key => {
      sections[key] = sections[key].slice(0, 8);
    });

    return sections;
  }, [actualRestaurants]);

  // Legacy sections for backward compatibility and filtering
  const nationalFavorites = useMemo(() => {
    return actualRestaurants
      .filter(restaurant => restaurant.featured && hasValidLogo(restaurant.logo))
      .slice(0, 8);
  }, [actualRestaurants]);

  const fastestNearYou = useMemo(() => {
    return actualRestaurants
      .filter(restaurant => {
        const timeStr = restaurant.time;
        const minutes = Number.parseInt(timeStr.match(/\d+/)?.[0] || '100');
        return minutes < 30 && hasValidLogo(restaurant.logo);
      })
      .sort((a, b) => {
        const timeA = Number.parseInt(a.time.match(/\d+/)?.[0] || '100');
        const timeB = Number.parseInt(b.time.match(/\d+/)?.[0] || '100');
        return timeA - timeB;
      })
      .slice(0, 8);
  }, [actualRestaurants]);

  // Fetch all deals to get restaurants with restaurant-specific deals
  const { data: allDeals } = useAllDeals();

  const dealsForYou = useMemo(() => {
    if (!allDeals || allDeals.length === 0) return [];

    // Get unique restaurant IDs that have restaurant-specific deals (excluding DashPass and common deals)
    const restaurantIdsWithDeals = new Set<string>(
      allDeals
        .filter((deal: Deal) => deal.restaurantId !== null && deal.id !== 'dashpass-delivery-fee')
        .map((deal: Deal) => deal.restaurantId!)
    );

    // Filter restaurants that have at least one restaurant-specific deal
    return actualRestaurants
      .filter(
        restaurant => restaurantIdsWithDeals.has(restaurant.id) && hasValidLogo(restaurant.logo)
      )
      .slice(0, 8);
  }, [actualRestaurants, allDeals]);

  const newOnDoorDash = useMemo(() => {
    return actualRestaurants
      .filter(restaurant => restaurant.new && hasValidLogo(restaurant.logo))
      .slice(0, 8);
  }, [actualRestaurants]);

  const allStores = useMemo(() => {
    return actualRestaurants; // Now only contains actual restaurants, not stores from other categories
  }, [actualRestaurants]);

  // Apply filters to all restaurants
  useEffect(() => {
    const applyFilters = (restaurantList: Restaurant[]): Restaurant[] => {
      let filtered = [...restaurantList];
      console.log('filtered', filtered);

      // Apply category filter (from FoodCategories component)
      if (selectedCategory) {
        filtered = filtered.filter(restaurant => {
          // Check if restaurant has categories array
          if (restaurant.categories && restaurant.categories.length > 0) {
            // Convert category name to ID for comparison (e.g., "Fast Food" -> "fast-food")
            const categoryId = selectedCategory.toLowerCase().replace(/\s+/g, '-');
            // Use "contains" match - check if any category contains the search term
            return restaurant.categories.some(cat => cat.toLowerCase().includes(categoryId));
          }
          return false;
        });
      }

      // Apply cuisine filter (from FilterOptions component)
      if (filters.cuisine && filters.cuisine.length > 0) {
        filtered = filtered.filter(restaurant => {
          if (restaurant.categories && restaurant.categories.length > 0) {
            // Check if any selected cuisine matches any restaurant category (contains match)
            return filters.cuisine!.some(selectedCuisine =>
              restaurant.categories!.some(cat =>
                cat.toLowerCase().includes(selectedCuisine.toLowerCase()) ||
                selectedCuisine.toLowerCase().includes(cat.toLowerCase())
              )
            );
          }
          return false;
        });
      }

      // Apply dietary preferences filter (from FilterOptions component)
      if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
        filtered = filtered.filter(restaurant => {
          if (restaurant.categories && restaurant.categories.length > 0) {
            // Check if any dietary preference matches any restaurant category (contains match)
            return filters.dietaryPreferences!.some(dietary =>
              restaurant.categories!.some(cat =>
                cat.toLowerCase().includes(dietary.toLowerCase()) ||
                dietary.toLowerCase().includes(cat.toLowerCase())
              )
            );
          }
          // Also check dietaryPreferences field if available
          if (restaurant.dietaryPreferences && restaurant.dietaryPreferences.length > 0) {
            return filters.dietaryPreferences!.some(dietary =>
              restaurant.dietaryPreferences!.some(pref =>
                pref.toLowerCase().includes(dietary.toLowerCase()) ||
                dietary.toLowerCase().includes(pref.toLowerCase())
              )
            );
          }
          return false;
        });
      }

      // Apply other filters
      if (filters.underThirtyMins) {
        filtered = filtered.filter(restaurant => {
          const timeStr = restaurant.time;
          const minutes = Number.parseInt(timeStr.match(/\d+/)?.[0] || '100');
          return minutes < 30;
        });
      }

      if (filters.overRating) {
        filtered = filtered.filter(
          restaurant => getDefaultRating(restaurant.rating) >= filters.overRating!
        );
      }

      if (filters.dashPass) {
        filtered = filtered.filter(restaurant => restaurant.dashPass);
      }

      if (filters.price && filters.price.length > 0) {
        filtered = filtered.filter(restaurant => filters.price!.includes(restaurant.priceRange));
      }

      // For demo purposes, we'll just simulate these filters
      if (filters.deals) {
        // Filter restaurants that have deals
        filtered = filtered.filter(restaurant => restaurant.discount);
      }

      return filtered;
    };

    // When filters are active, apply them to all restaurants
    if (hasActiveFilters()) {
      // Get unique restaurants from all sections
      const uniqueRestaurants = Array.from(
        new Map(
          [
            ...nationalFavorites,
            ...fastestNearYou,
            ...dealsForYou,
            ...newOnDoorDash,
            ...allStores,
          ].map(item => [item.id, item])
        ).values()
      );

      // Apply filters to all unique restaurants
      setAllFilteredRestaurants(applyFilters(uniqueRestaurants));
    } else {
      // Reset filtered restaurants when no filters are active
      setAllFilteredRestaurants([]);
      clearSearchResults();
    }
  }, [
    filters,
    nationalFavorites,
    fastestNearYou,
    dealsForYou,
    newOnDoorDash,
    allStores,
    selectedCategory,
  ]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Modify the handleReset function to avoid calling the child's resetFilters method
  const handleReset = () => {
    // Create a fresh filter state object
    const resetFilters = {
      underThirtyMins: false,
      deals: false,
      overRating: null,
      price: null,
      dashPass: false,
      cuisine: null,
      dietaryPreferences: null,
    };

    // Update the state with the reset filters
    setFilters(resetFilters);
    setSelectedCategory(null);
    clearSearchResults();
  };

  const hasActiveFilters = () => {
    return (
      selectedCategory !== null ||
      filters.underThirtyMins ||
      filters.deals ||
      filters.overRating !== null ||
      (filters.price !== null && filters.price.length > 0) ||
      filters.dashPass ||
      (filters.cuisine !== null && filters.cuisine !== undefined && filters.cuisine.length > 0) ||
      (filters.dietaryPreferences !== null && filters.dietaryPreferences !== undefined && filters.dietaryPreferences.length > 0)
    );
  };

  // Show loading skeleton while fetching restaurants
  if (isLoadingRestaurants) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="pt-16">
          <FoodCategories
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
        <FilterOptions
          ref={filterOptionsRef}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          filters={filters}
        />
        <div className="mt-8">
          <RestaurantsSkeleton count={12} />
        </div>
      </div>
    );
  }

  // Show address prompt if no address (neither default address for logged-in users nor temp address for guests)
  if (!activeAddress) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-3">Add Your Delivery Address</h2>
          <p className="text-gray-600 mb-4">
            We need your address to show restaurants that deliver to you.
          </p>
          <button className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700">
            Add Address
          </button>
        </div>
      </div>
    );
  }

  // Show error if fetch failed
  if (restaurantsError) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Restaurants</h2>
          <p className="text-red-600">{restaurantsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <div className="pt-16">
        <FoodCategories
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>
      {/* Pass the current filters to the FilterOptions component */}
      <FilterOptions
        ref={filterOptionsRef}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        filters={filters}
      />
      <div className="mt-4">
        {/* {!hasActiveFilters() && <PromoBanners />} */}

        {/* Show filtered results when filters are active */}
        {hasActiveFilters() ? (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {allFilteredRestaurants.length} results
              </h2>
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-900 font-medium text-sm rounded-full px-4 py-2"
              >
                Reset
              </button>
            </div>

            {allFilteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFilteredRestaurants.map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card">
                    <Link href={`/store/${restaurant.id}`} className="block" prefetch={false}>
                      <div className="relative h-[200px] bg-gray-100">
                        <Image
                          src={
                            restaurant.banner ||
                            `/placeholder.svg?height=200&width=400&query=${
                              restaurant.name || '/placeholder.svg'
                            } restaurant`
                          }
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                          onError={e => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {restaurant.new && (
                          <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{restaurant.name}</h3>
                          {restaurant.dashPass && (
                            <div className="text-teal-600">
                              <svg
                                width="20"
                                height="12"
                                viewBox="0 0 20 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M18.5 1.5L11.5 9.5L7.5 5.5L1.5 10.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Heart className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="flex items-center mt-1 text-sm text-gray-700 flex-wrap">
                        <div className="flex items-center">
                          {restaurant?.rating && restaurant.rating !== 0 && <span className="font-semibold">{restaurant.rating}</span>}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="ml-1"
                          >
                            <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                          </svg>
                        </div>
                        {restaurant?.reviews && restaurant.reviews !== '0 ratings' && <span className="mx-1">({restaurant.reviews})</span>}
                        <span className="mx-1">•</span>
                        <span>{restaurant.distance}</span>
                        <span className="mx-1">•</span>
                        <span>{restaurant.time}</span>
                      </div>

                      <div className="mt-1 text-sm text-gray-500">{restaurant.deliveryFee}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-10 py-16 text-center bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">
                  No restaurants match your filters
                </h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters to see more options</p>
                <button
                  onClick={handleReset}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          // Show dynamic sections from database
          <>
            {Object.entries(restaurantsBySection)
              .filter(([_, restaurants]) => restaurants.length > 0)
              .map(([sectionName, restaurants]) => (
                <RestaurantSection
                  key={sectionName}
                  title={sectionName}
                  restaurants={restaurants}
                />
              ))}

            {/* Fallback: Show all stores if no sections exist */}
            {Object.keys(restaurantsBySection).length === 0 && (
              <RestaurantSection title="All stores" restaurants={allStores} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
