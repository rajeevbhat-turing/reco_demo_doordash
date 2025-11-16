'use client';

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useUserStore } from '@/store/user-store';
import { useCartStore } from '@/store/cart-store';
import FilterOptions, {
  type FilterOptionsRef,
  type FilterState,
} from '@/components/filter-options';
import type { Restaurant } from '@/constants/restaurants';
import type { MenuItem } from '@/constants/menu-items';
import { getDefaultRating } from '@/utils/rating-utils';
import { RestaurantsSkeleton } from '@/components/skeletons/restaurant-skeleton';

interface MenuItemWithRestaurant extends MenuItem {
  restaurant_id: string;
  restaurantName?: string;
  restaurantLogo?: string;
  category_name?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const router = useRouter();
  
  const [filters, setFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null,
    dashPass: false,
    cuisine: null,
    dietaryPreferences: null,
  });
  const filterOptionsRef = useRef<FilterOptionsRef>(null);
  const [allMenuItems, setAllMenuItems] = useState<MenuItemWithRestaurant[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const favoritesLoadedRef = useRef(false);
  const loadedFavoritesRef = useRef<string[]>([]);
  const isInitializingRef = useRef(true);
  const dishesScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Get cart store to set category and add items
  const cartStore = useCartStore();
  const { addItem } = useCartStore();

  // Get authentication status
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false
  );

  // Get user's address for location-based filtering
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses.find(a => a.default);

  // Get temp address for guest users
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().getTempAddress(),
    () => null
  );

  // Determine which address to use
  const activeAddress = isAuthenticated ? defaultAddress : tempAddress;

  // Fetch restaurants near user's address
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
  } = useRestaurants(
    activeAddress?.lat,
    activeAddress?.lng,
    10
  );

  // Set the category to restaurant when component mounts
  useEffect(() => {
    cartStore.setCategory('restaurant');
  }, []);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      isInitializingRef.current = true;
      favoritesLoadedRef.current = false; // Reset when user changes
      const saved = localStorage.getItem('favorites');
      let userFavorites: string[] = [];
      
      if (saved) {
        try {
          const favoritesObj: { [userId: string]: string[] } = JSON.parse(saved);
          userFavorites = favoritesObj[currentUser.id] || [];
          if (!Array.isArray(userFavorites)) {
            userFavorites = [];
          }
        } catch (error) {
          console.error('Error parsing favorites from localStorage:', error);
          userFavorites = [];
        }
      }
      
      loadedFavoritesRef.current = [...userFavorites];
      isInitializingRef.current = true; // Prevent save during load
      setFavorites(userFavorites);
      favoritesLoadedRef.current = true;
      
      // Allow saves after load completes (next tick)
      requestAnimationFrame(() => {
        isInitializingRef.current = false;
      });
    } else {
      // If no user, clear favorites
      isInitializingRef.current = true;
      favoritesLoadedRef.current = false;
      loadedFavoritesRef.current = [];
      setFavorites([]);
      requestAnimationFrame(() => {
        isInitializingRef.current = false;
      });
    }
  }, [currentUser]);

  // Save favorites to localStorage when they change (only after initial load and only if actually changed)
  useEffect(() => {
    // Don't save during initialization
    if (isInitializingRef.current) {
      return;
    }
    
    if (currentUser && favoritesLoadedRef.current) {
      // Only save if favorites have actually changed from what was loaded
      const currentFavsStr = JSON.stringify([...favorites].sort());
      const loadedFavsStr = JSON.stringify([...loadedFavoritesRef.current].sort());
      
      if (currentFavsStr !== loadedFavsStr) {
        const saved = localStorage.getItem('favorites');
        let favoritesObj: { [userId: string]: string[] } = {};
        
        if (saved) {
          try {
            favoritesObj = JSON.parse(saved);
            if (typeof favoritesObj !== 'object' || favoritesObj === null) {
              favoritesObj = {};
            }
          } catch (error) {
            favoritesObj = {};
          }
        }

        favoritesObj[currentUser.id] = favorites;
        localStorage.setItem('favorites', JSON.stringify(favoritesObj));
        loadedFavoritesRef.current = [...favorites];
      }
    }
  }, [favorites, currentUser]);

  // Reset filters when search query changes
  useEffect(() => {
    if (searchQuery) {
      setFilters({
        underThirtyMins: false,
        deals: false,
        overRating: null,
        price: null,
        dashPass: false,
        cuisine: null,
        dietaryPreferences: null,
      });
    }
  }, [searchQuery]);

  // Fetch menu items for all restaurants
  useEffect(() => {
    const fetchAllMenuItems = async () => {
      if (!restaurants || restaurants.length === 0) return;

      try {
        const menuPromises = restaurants.map(restaurant =>
          fetch(`/api/restaurants/${restaurant.id}/menu`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data.menuItems) {
                return data.data.menuItems.map((item: any) => ({
                  ...item,
                  restaurant_id: restaurant.id, // Ensure restaurant_id is set correctly
                  restaurantId: restaurant.id, // Also set restaurantId for consistency
                  restaurantName: restaurant.name,
                  restaurantLogo: restaurant.logo,
                }));
              }
              return [];
            })
            .catch(() => [])
        );

        const allMenus = await Promise.all(menuPromises);
        const flattenedMenuItems = allMenus.flat();
        console.log('Fetched menu items:', flattenedMenuItems.length);
        setAllMenuItems(flattenedMenuItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchAllMenuItems();
  }, [restaurants]);

  // Function to check if an image URL is valid
  const hasValidLogo = (logoUrl: string | undefined): boolean => {
    if (!logoUrl || logoUrl.trim() === '') return false;
    if (logoUrl.includes('placeholder.svg')) return false;
    if (logoUrl.includes('placeholder.png')) return false;
    return true;
  };

  // Filter restaurants based on search query and filters
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    let filtered = restaurants.filter(restaurant => hasValidLogo(restaurant.logo));

    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      
      // Find restaurants that match by name, cuisine, or categories
      const directMatches = filtered.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(lowerQuery) ||
          restaurant.cuisine.toLowerCase().includes(lowerQuery) ||
          (restaurant.categories &&
            restaurant.categories.some(cat => cat.toLowerCase().includes(lowerQuery)))
      );

      // Find restaurants that have menu items matching the search query
      const restaurantIdsWithMatchingItems = new Set<string>();
      
      if (allMenuItems.length > 0) {
        allMenuItems.forEach(item => {
          if (item.name.toLowerCase().includes(lowerQuery)) {
            // Check both possible ID fields
            const restaurantId = item.restaurant_id || item.restaurantId;
            if (restaurantId) {
              restaurantIdsWithMatchingItems.add(restaurantId);
            }
          }
        });
      }

      console.log('Search query:', lowerQuery);
      console.log('Direct matches:', directMatches.length);
      console.log('Restaurant IDs with matching menu items:', restaurantIdsWithMatchingItems.size);

      // Find restaurant objects for menu item matches
      const menuItemMatches = filtered.filter(restaurant =>
        restaurantIdsWithMatchingItems.has(restaurant.id)
      );

      // Combine both types of matches, removing duplicates
      const allMatches = [...directMatches];
      menuItemMatches.forEach(restaurant => {
        if (!allMatches.find(r => r.id === restaurant.id)) {
          allMatches.push(restaurant);
        }
      });

      console.log('Total matches (direct + menu items):', allMatches.length);

      filtered = allMatches;
    }

    // Apply filters
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

    if (filters.deals) {
      filtered = filtered.filter(restaurant => restaurant.discount);
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      filtered = filtered.filter(restaurant => {
        if (restaurant.categories && restaurant.categories.length > 0) {
          return filters.cuisine!.some(selectedCuisine =>
            restaurant.categories!.some(
              cat =>
                cat.toLowerCase().includes(selectedCuisine.toLowerCase()) ||
                selectedCuisine.toLowerCase().includes(cat.toLowerCase())
            )
          );
        }
        return false;
      });
    }

    if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
      filtered = filtered.filter(restaurant => {
        if (restaurant.categories && restaurant.categories.length > 0) {
          return filters.dietaryPreferences!.some(dietary =>
            restaurant.categories!.some(
              cat =>
                cat.toLowerCase().includes(dietary.toLowerCase()) ||
                dietary.toLowerCase().includes(cat.toLowerCase())
            )
          );
        }
        return false;
      });
    }

    return filtered;
  }, [restaurants, searchQuery, filters, allMenuItems]);

  // Get popular restaurants (first 2-3)
  // Popularity score = rating × log(reviews + 1)
  // This balances high ratings with high review volume
  const popularRestaurants = useMemo(() => {
    return filteredRestaurants
      .map(restaurant => {
        const rating = getDefaultRating(restaurant.rating);
        const reviewCount = parseInt(restaurant.reviews?.replace(/[^0-9]/g, '') || '0');
        const popularityScore = rating * Math.log(reviewCount + 1);
        return { ...restaurant, popularityScore };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 3); // Max 3 popular restaurants
  }, [filteredRestaurants]);

  // Filter menu items based on search query or show popular items
  const matchedMenuItems = useMemo(() => {
    if (!allMenuItems.length) return [];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return allMenuItems
        .filter(item => item.name.toLowerCase().includes(lowerQuery))
        .slice(0, 20);
    }

    // If no search query, show popular menu items
    return allMenuItems
      .filter(item => item.popular || item.featured)
      .slice(0, 20);
  }, [allMenuItems, searchQuery]);

  // Remaining restaurants (after popular, shown below dishes)
  const remainingRestaurants = useMemo(() => {
    // Get IDs of popular restaurants to exclude them
    const popularIds = new Set(popularRestaurants.map(r => r.id));
    return filteredRestaurants.filter(r => !popularIds.has(r.id));
  }, [filteredRestaurants, popularRestaurants]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({
      underThirtyMins: false,
      deals: false,
      overRating: null,
      price: null,
      dashPass: false,
      cuisine: null,
      dietaryPreferences: null,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.underThirtyMins ||
      filters.deals ||
      filters.overRating !== null ||
      (filters.price !== null && filters.price.length > 0) ||
      filters.dashPass ||
      (filters.cuisine !== null && filters.cuisine !== undefined && filters.cuisine.length > 0) ||
      (filters.dietaryPreferences !== null && filters.dietaryPreferences !== undefined && filters.dietaryPreferences.length > 0)
    );
  };

  const toggleFavorite = (restaurantId: string) => {
    isInitializingRef.current = false; // Mark as user-initiated change
    setFavorites(prev => {
      if (prev.includes(restaurantId)) {
        return prev.filter(id => id !== restaurantId);
      } else {
        return [...prev, restaurantId];
      }
    });
  };

  // Check scroll position for arrows
  useEffect(() => {
    const checkScroll = () => {
      if (dishesScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = dishesScrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollContainer = dishesScrollRef.current;
    if (scrollContainer) {
      checkScroll();
      scrollContainer.addEventListener('scroll', checkScroll);
      return () => scrollContainer.removeEventListener('scroll', checkScroll);
    }
  }, [matchedMenuItems]);

  const scrollDishes = (direction: 'left' | 'right') => {
    if (dishesScrollRef.current) {
      const scrollAmount = 300;
      dishesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Show loading skeleton
  if (isLoadingRestaurants) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4">
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

  // Show address prompt if no address
  if (!activeAddress) {
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
    <div className="w-full mx-auto px-4">
      {/* Filters */}
      <FilterOptions
        ref={filterOptionsRef}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        filters={filters}
      />

      <div className="mt-4">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Results for "{searchQuery}"
            </h1>
          </div>
        )}

        {!searchQuery && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              All Restaurants
            </h1>
          </div>
        )}

        {/* Popular Restaurants - First Row (2-3 restaurants) */}
        {!hasActiveFilters() && popularRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRestaurants.map(restaurant => (
                <Link
                  key={restaurant.id}
                  href={`/store/${restaurant.id}`}
                  className="block"
                  prefetch={false}
                >
                  <div className="restaurant-card">
                    <div className="relative h-[140px] bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={
                          restaurant.banner ||
                          `/placeholder.svg?height=160&width=300&query=${restaurant.name} restaurant`
                        }
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      {restaurant.new && (
                        <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate">{restaurant.name}</h3>
                          {restaurant.dashPass && (
                            <div className="text-teal-600 flex-shrink-0">
                              <svg
                                width="16"
                                height="10"
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
                        <button
                          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                          onClick={e => {
                            e.preventDefault();
                            toggleFavorite(restaurant.id);
                          }}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(restaurant.id) ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center mt-1 text-xs text-gray-700">
                        <span className="font-semibold">{getDefaultRating(restaurant.rating)}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="ml-1"
                        >
                          <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                        </svg>
                        <span className="mx-1">({restaurant.reviews})</span>
                        <span className="mx-1">•</span>
                        <span>{restaurant.distance}</span>
                        <span className="mx-1">•</span>
                        <span>{restaurant.time}</span>
                      </div>

                      <div className="mt-1 text-xs text-gray-500">{restaurant.deliveryFee}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Dishes Carousel */}
        {!hasActiveFilters() && matchedMenuItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Popular Dishes</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollDishes('left')}
                  disabled={!showLeftArrow}
                  className={`bg-gray-100 rounded-full p-2 transition-colors ${
                    showLeftArrow ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollDishes('right')}
                  disabled={!showRightArrow}
                  className={`bg-gray-100 rounded-full p-2 transition-colors ${
                    showRightArrow ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div
                ref={dishesScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {matchedMenuItems.map(item => {
                  const handleAddToCart = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Parse price to number
                    const priceStr = item.price.startsWith('$') ? item.price.slice(1) : item.price;
                    const price = parseFloat(priceStr);
                    
                    // Add item to cart
                    addItem(
                      {
                        id: item.id,
                        itemName: item.name,
                        price: price,
                        image: item.image || '/placeholder.svg',
                      },
                      'restaurant',
                      item.restaurantName || 'Restaurant',
                      item.restaurant_id || item.restaurantId || ''
                    );
                    
                    // Navigate to restaurant page
                    router.push(`/store/${item.restaurant_id || item.restaurantId}`);
                  };

                  return (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-[180px] cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/store/${item.restaurant_id || item.restaurantId}`)}
                    >
                      <div className="relative h-[180px] bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <Image
                          src={item.image || '/placeholder.svg?height=180&width=180'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="px-1">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{item.restaurantName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">
                            {item.price.startsWith('$') ? item.price : `$${item.price}`}
                          </span>
                          <button
                            onClick={handleAddToCart}
                            className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-semibold hover:bg-gray-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* All Restaurants (when filters active) or Remaining Restaurants */}
        {hasActiveFilters() ? (
          // Show all restaurants in one section when filters are active
          filteredRestaurants.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredRestaurants.map(restaurant => (
                  <Link
                    key={restaurant.id}
                    href={`/store/${restaurant.id}`}
                    className="block"
                    prefetch={false}
                  >
                    <div className="restaurant-card">
                      <div className="relative h-[140px] bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={
                            restaurant.banner ||
                            `/placeholder.svg?height=140&width=300&query=${restaurant.name} restaurant`
                          }
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                        />
                        {restaurant.new && (
                          <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                            NEW
                          </div>
                        )}
                      </div>
                      <div className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className="font-bold text-base truncate">{restaurant.name}</h3>
                            {restaurant.dashPass && (
                              <div className="text-teal-600 flex-shrink-0">
                                <svg
                                  width="16"
                                  height="10"
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
                          <button
                            className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                            onClick={e => {
                              e.preventDefault();
                              toggleFavorite(restaurant.id);
                            }}
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                favorites.includes(restaurant.id) ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center mt-1 text-xs text-gray-700">
                          <span className="font-semibold">{getDefaultRating(restaurant.rating)}</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="ml-1"
                          >
                            <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                          </svg>
                          <span className="mx-1">({restaurant.reviews})</span>
                          <span className="mx-1">•</span>
                          <span>{restaurant.distance}</span>
                          <span className="mx-1">•</span>
                          <span>{restaurant.time}</span>
                        </div>

                        <div className="mt-1 text-xs text-gray-500">{restaurant.deliveryFee}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          // Show remaining restaurants when no filters are active
          remainingRestaurants.length > 0 && (
            <div className="mb-8">
              <hr className="mb-6 border-t border-gray-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {remainingRestaurants.map(restaurant => (
                <Link
                  key={restaurant.id}
                  href={`/store/${restaurant.id}`}
                  className="block"
                  prefetch={false}
                >
                  <div className="restaurant-card">
                    <div className="relative h-[140px] bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={
                          restaurant.banner ||
                          `/placeholder.svg?height=200&width=400&query=${restaurant.name} restaurant`
                        }
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      {restaurant.new && (
                        <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate">{restaurant.name}</h3>
                          {restaurant.dashPass && (
                            <div className="text-teal-600 flex-shrink-0">
                              <svg
                                width="16"
                                height="10"
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
                        <button
                          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                          onClick={e => {
                            e.preventDefault();
                            toggleFavorite(restaurant.id);
                          }}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(restaurant.id) ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center mt-1 text-xs text-gray-700">
                        <span className="font-semibold">{getDefaultRating(restaurant.rating)}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="ml-1"
                        >
                          <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                        </svg>
                        <span className="mx-1">({restaurant.reviews})</span>
                        <span className="mx-1">•</span>
                        <span>{restaurant.distance}</span>
                        <span className="mx-1">•</span>
                        <span>{restaurant.time}</span>
                      </div>

                      <div className="mt-1 text-xs text-gray-500">{restaurant.deliveryFee}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          )
        )}

        {/* No Results */}
        {filteredRestaurants.length === 0 && !isLoadingRestaurants && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h2>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

