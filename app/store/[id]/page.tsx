'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Info, ChevronLeft, ChevronRight, Heart, Search, X, ThumbsUp } from 'lucide-react';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';
import { useUserStore } from '@/store/user-store';
import {
  getRestaurantById,
  calculateDeliveryTime,
  parseDistance,
} from '@/lib/utils/restaurant-utils';
import { useCartStore } from '@/store/cart-store';
import { useAppStore } from '@/store/app-store';
import { useVerifierStore } from '@/store/verifier-store';
import MenuItemDialog from '@/components/menu-item-dialog';
import GroupOrderDialog from '@/components/group-order-dialog';
import StoreDetailsDialog from '@/components/store-details-dialog';
import OutsideDeliveryAreaModal from '@/components/modals/outside-delivery-area-modal';
import { Reviews } from '@/components/reviews';
import { type Deal } from '@/types/deal-types';
import { useDealsByRestaurantId } from '@/lib/hooks/use-deals';
import { Deals } from '@/components/deals';
import ServiceFeesInfo from '@/components/service-fees-info';
import { getDefaultRating } from '@/utils/rating-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from '@/components/ui/tooltip';

// const menuTypes = [
//   {
//     id: 'overnight',
//     name: 'Overnight Menu',
//     hours: '12:00 AM - 3:59 AM',
//   },
//   {
//     id: 'regular',
//     name: 'Regular Menu',
//     hours: '10:30 AM - 11:59 PM',
//   },
//   {
//     id: 'breakfast',
//     name: 'Breakfast Menu',
//     hours: '4:00 AM - 10:29 AM',
//   },
// ];

function SearchBar({
  restaurantName,
  searchQuery,
  onSearchChange,
}: {
  restaurantName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder={`Search ${restaurantName}`}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-gray-100 rounded-full py-3 pl-10 pr-4 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const params = useParams();
  const rawId = params.id as string;
  const id = decodeURIComponent(rawId); // Decode URL-encoded characters like %26 to &
  const [restaurant, setRestaurant] = useState<any>(null);
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Featured Items');
  const [mostOrderedItems, setMostOrderedItems] = useState<any[]>([]);
  const [_familySharingItems, setFamilySharingItems] = useState<any[]>([]);
  const [_beefItems, setBeefItems] = useState<any[]>([]);
  const [menuTopPosition, setMenuTopPosition] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isProgrammaticScroll = useRef(false);
  // Get both setCategory and addItem from the cart store
  const cartStore = useCartStore();
  const { addItem } = useCartStore();
  const ticking = useRef(false);
  const featuredItemsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<{
    navigationRecord?: ReturnType<typeof setTimeout>;
    scrollReenable?: ReturnType<typeof setTimeout>;
  }>({});
  // const dealsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeftFeatured, setCanScrollLeftFeatured] = useState(false);
  const [canScrollRightFeatured, setCanScrollRightFeatured] = useState(true);

  // Fetch the specific restaurant directly (optimization: don't wait for nearby restaurants list)
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses?.find(a => a.default);

  // Fetch this specific restaurant immediately - we have the ID from URL
  const { data: specificRestaurant, isLoading: isLoadingRestaurant } = useRestaurant(id);

  // Fetch menu for this restaurant in parallel
  const { data: menuData, isLoading: isLoadingMenu, error: menuError } = useRestaurantMenu(id);

  // Optionally fetch nearby restaurants list (non-blocking, for delivery area check)
  // Only fetch if we have coordinates and want to check if restaurant is in delivery area
  const { data: restaurants } = useRestaurants(
    defaultAddress?.lat,
    defaultAddress?.lng,
    10 // 10 mile radius
  );

  // Check if restaurant is in nearby results (for delivery area validation)
  const restaurantInNearby = restaurants ? getRestaurantById(restaurants, id) : null;

  // Show modal when restaurant is outside delivery area
  useEffect(() => {
    if (restaurant && restaurants !== undefined && !restaurantInNearby) {
      setOutsideDeliveryAreaModalOpen(true);
    }
  }, [restaurant, restaurants, restaurantInNearby]);

  // const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Dialog states
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [groupOrderDialogOpen, setGroupOrderDialogOpen] = useState(false);
  const [storeDetailsDialogOpen, setStoreDetailsDialogOpen] = useState(false);
  const [serviceFeesInfoOpen, setServiceFeesInfoOpen] = useState(false);
  // const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [outsideDeliveryAreaModalOpen, setOutsideDeliveryAreaModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  // const [selectedMenuType, setSelectedMenuType] = useState('Regular Menu');
  const [isStickyHeader, setIsStickyHeader] = useState(false);
  const [isStickyMenu, setIsStickyMenu] = useState(false);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);
  const [menuContainerDimensions, setMenuContainerDimensions] = useState({
    width: 0,
    left: 0,
    height: 0,
  });
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  const { setCurrentStore, clearCurrentStore } = useAppStore();
  const { recordNavigationFromSearch } = useVerifierStore();

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (currentUser && id) {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          const favoritesObj: { [userId: string]: string[] } = JSON.parse(saved);
          const userFavorites = favoritesObj[currentUser.id] || [];
          if (userFavorites.includes(id)) {
            setIsSaved(true);
          }
        } catch (error) {
          console.error('Error parsing favorites from localStorage:', error);
        }
      }
    }
  }, [currentUser, id]);

  // Save to localStorage when isSaved changes
  useEffect(() => {
    if (currentUser && id) {
      const saved = localStorage.getItem('favorites');
      let favoritesObj: { [userId: string]: string[] } = {};

      if (saved) {
        try {
          favoritesObj = JSON.parse(saved);
          if (typeof favoritesObj !== 'object' || favoritesObj === null) {
            favoritesObj = {};
          }
        } catch (_error) {
          favoritesObj = {};
        }
      }

      let userFavorites = favoritesObj[currentUser.id] || [];

      if (isSaved) {
        // Add restaurant ID if not already in array
        if (!userFavorites.includes(id)) {
          userFavorites = [...userFavorites, id];
        }
      } else {
        // Remove restaurant ID from array
        userFavorites = userFavorites.filter(favId => favId !== id);
      }

      favoritesObj[currentUser.id] = userFavorites;
      localStorage.setItem('favorites', JSON.stringify(favoritesObj));
    }
  }, [isSaved, currentUser, id]);

  // Check if user came from search and record navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer.includes('/search')) {
        console.log('[NAVIGATION] User came from search page, recording navigation');
        // Small delay to ensure search info is set before navigation
        timeoutRef.current.navigationRecord = setTimeout(() => {
          recordNavigationFromSearch();
        }, 100);
      }
    }
    const timeout = timeoutRef.current.navigationRecord;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [recordNavigationFromSearch]);

  // Cleanup scrollReenable timeout on unmount
  useEffect(() => {
    const timeouts = timeoutRef.current;
    return () => {
      if (timeouts.scrollReenable) {
        clearTimeout(timeouts.scrollReenable);
      }
    };
  }, []);

  // Set the cart category to restaurant when the component mounts
  useEffect(() => {
    // Set the category to restaurant
    cartStore.setCategory('restaurant');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id && menuData) {
      // Use restaurant from nearby results if available (for distance info), otherwise use specifically fetched one
      // This allows the page to render immediately with specificRestaurant, then update if nearby list loads
      const restaurantData = restaurantInNearby || specificRestaurant;

      if (restaurantData) {
        setCurrentStore(restaurantData, 'restaurant');
      }
      setRestaurant(restaurantData);

      // Safely access menuItems and categories with null checks to prevent crashes
      const menuItems = menuData?.menuItems || [];
      const categories = menuData?.categories || [];

      // Get featured items using the featured flag from database
      const featuredItemsData = menuItems.filter(item => item.featured === true);

      // Get most ordered items - prioritize popular flag, then sort by rating_count
      const mostOrderedItemsData = menuItems
        .filter(item => item.popular === true || (item.ratingCount && item.ratingCount > 0))
        .sort((a, b) => {
          // First prioritize items with popular flag
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          // Then sort by rating count (descending)
          const aCount = a.ratingCount || 0;
          const bCount = b.ratingCount || 0;
          return bCount - aCount;
        })
        .slice(0, 5); // Take top 5

      const familySharingItemsData = menuItems.filter(item => item.category === 'Family & Sharing');
      const beefItemsData = menuItems.filter(item => item.category === 'Beef');

      // Transform categories to match expected format
      const menuCategoriesData = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      }));

      setFeaturedItems(featuredItemsData);
      setMenuCategories(menuCategoriesData);
      setMostOrderedItems(mostOrderedItemsData);
      setFamilySharingItems(familySharingItemsData);
      setBeefItems(beefItemsData);
    }

    return () => {
      clearCurrentStore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, restaurantInNearby, specificRestaurant, menuData]);

  // Use restaurant.time (already calculated by API using calculateDeliveryTime) or calculate from distance
  const deliveryTime = useMemo(() => {
    if (!restaurant) return '21-31 min'; // Fallback with range

    // If restaurant already has calculated time from API, use it (should be in range format)
    if (restaurant.time) {
      return restaurant.time;
    }

    // If restaurant has distance but no time, calculate it using calculateDeliveryTime
    if (restaurant.distance) {
      const distance = parseDistance(restaurant.distance);
      if (distance > 0) {
        return calculateDeliveryTime(distance, 'standard');
      }
    }

    return '21-31 min'; // Final fallback with range
  }, [restaurant]);

  // Save the initial position of the menu after the component mounts
  useEffect(() => {
    if (menuRef.current && menuContainerRef.current) {
      const rect = menuContainerRef.current.getBoundingClientRect();
      setMenuTopPosition(rect.top + window.scrollY);

      // Check initial sticky state
      const containerRect = menuContainerRef.current.getBoundingClientRect();
      const shouldBeSticky = containerRect.top <= 0;
      setIsStickyHeader(shouldBeSticky);
      setIsStickyMenu(shouldBeSticky);

      // Measure menu container dimensions when not sticky
      if (!shouldBeSticky) {
        setMenuContainerDimensions({
          width: rect.width,
          left: rect.left,
          height: rect.height,
        });
      }
    }
  }, [restaurant]);

  // Measure sticky header height when it appears
  useEffect(() => {
    if (isStickyHeader && stickyHeaderRef.current) {
      const height = stickyHeaderRef.current.offsetHeight;
      setStickyHeaderHeight(height);
    }
  }, [isStickyHeader]);

  // Measure menu container dimensions when not sticky
  useEffect(() => {
    const updateMenuDimensions = () => {
      if (!isStickyMenu && menuContainerRef.current) {
        const rect = menuContainerRef.current.getBoundingClientRect();
        setMenuContainerDimensions({
          width: rect.width,
          left: rect.left,
          height: rect.height,
        });
      }
    };

    updateMenuDimensions();
    window.addEventListener('resize', updateMenuDimensions);
    return () => window.removeEventListener('resize', updateMenuDimensions);
  }, [isStickyMenu]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;

      requestAnimationFrame(() => {
        // Use stable reference point (menuTopPosition) to determine sticky state
        // This prevents flickering when menu becomes fixed positioned
        const scrollY = window.scrollY;
        const headerOffset = 64; // Main header height
        const stickyThreshold = menuTopPosition - headerOffset;

        // Add small threshold to prevent rapid toggling (hysteresis)
        const shouldBeSticky = scrollY >= stickyThreshold && menuTopPosition > 0;

        setIsStickyHeader(shouldBeSticky);
        setIsStickyMenu(shouldBeSticky);

        // Measure dimensions when not sticky (only when transitioning or already not sticky)
        if (!shouldBeSticky && menuContainerRef.current) {
          const containerRect = menuContainerRef.current.getBoundingClientRect();
          if (containerRect.width > 0) {
            setMenuContainerDimensions({
              width: containerRect.width,
              left: containerRect.left,
              height: containerRect.height,
            });
          }
        }

        // Find which section is currently in view
        const sectionPositions = Object.entries(sectionRefs.current)
          .filter(([_, ref]) => ref !== null)
          .map(([category, ref]) => {
            const rect = ref!.getBoundingClientRect();
            const position = rect.top;
            const bottom = rect.bottom;
            return { category, position, bottom, ref: ref! };
          });

        // Check if we're near the bottom of the page
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const isNearBottom = scrollTop + windowHeight >= documentHeight - 100; // 100px threshold

        let currentSection;

        if (isNearBottom && sectionPositions.length > 0) {
          // If near bottom, prioritize the last section
          const sortedSections = sectionPositions.sort((a, b) => {
            const aTop = a.ref.offsetTop;
            const bTop = b.ref.offsetTop;
            return bTop - aTop; // Sort by position descending (last section first)
          });
          currentSection = sortedSections[0];
        } else {
          // Normal logic: find section that's in view near the top
          const visibleSections = sectionPositions.filter(section => section.position <= 200);
          if (visibleSections.length > 0) {
            // Sort by position descending and pick the one closest to top
            currentSection = visibleSections.sort((a, b) => b.position - a.position)[0];
          }
        }

        // Only update active category if not programmatically scrolling
        if (
          !isProgrammaticScroll.current &&
          currentSection &&
          currentSection.category !== activeCategory
        ) {
          setActiveCategory(currentSection.category);
        }

        ticking.current = false;
      });
    }
  }, [activeCategory, menuTopPosition]);

  // Updates arrow button states based on scroll position for featured items
  const updateFeaturedItemsScrollButtons = useCallback(() => {
    if (featuredItemsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuredItemsRef.current;
      setCanScrollLeftFeatured(scrollLeft > 0);
      setCanScrollRightFeatured(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  }, []);

  // Scrolls featured items left by one card width smoothly
  const handleFeaturedItemsPrevious = useCallback(() => {
    if (featuredItemsRef.current && canScrollLeftFeatured) {
      const cardWidth = 200 + 16; // card width + gap
      featuredItemsRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth',
      });
    }
  }, [canScrollLeftFeatured]);

  // Scrolls featured items right by one card width smoothly
  const handleFeaturedItemsNext = useCallback(() => {
    if (featuredItemsRef.current && canScrollRightFeatured) {
      const cardWidth = 200 + 16; // card width + gap
      featuredItemsRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth',
      });
    }
  }, [canScrollRightFeatured]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Update featured items scroll button states on mount and when featured items change
  useEffect(() => {
    updateFeaturedItemsScrollButtons();
  }, [featuredItems, updateFeaturedItemsScrollButtons]);

  // Add scroll event listener to featured items container
  useEffect(() => {
    const scrollContainer = featuredItemsRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateFeaturedItemsScrollButtons);
      window.addEventListener('resize', updateFeaturedItemsScrollButtons);
      return () => {
        scrollContainer.removeEventListener('scroll', updateFeaturedItemsScrollButtons);
        window.removeEventListener('resize', updateFeaturedItemsScrollButtons);
      };
    }
  }, [featuredItems, updateFeaturedItemsScrollButtons]);

  const scrollToSection = (category: string) => {
    setActiveCategory(category);
    const section = sectionRefs.current[category];
    if (section) {
      // Disable scroll-based highlight changes during programmatic scroll
      isProgrammaticScroll.current = true;

      // Use smaller offset for Featured Items, larger offset for other sections to prevent title from being hidden due to sticky header
      const offset = category === 'Featured Items' ? 100 : 140;
      // Use getBoundingClientRect for accurate position relative to viewport
      const rect = section.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - offset;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

      // Clear existing timeout if any
      if (timeoutRef.current.scrollReenable) {
        clearTimeout(timeoutRef.current.scrollReenable);
      }

      // Re-enable scroll-based highlight changes after scroll animation completes
      // Smooth scroll typically takes ~500-1000ms, using 1200ms to be safe
      timeoutRef.current.scrollReenable = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1200);
    }
  };

  // Get deals from API
  const { restaurantDeals } = useDealsByRestaurantId(id || '');

  // Get first deal (excluding dashpass)
  const firstDeal = useMemo(() => {
    return restaurantDeals.length > 0 ? restaurantDeals[0] : null;
  }, [restaurantDeals]);

  // Format deal banner text
  const getDealBannerText = (deal: Deal) => {
    if (
      deal.discountType === 'percentage' &&
      deal.minimumPurchase &&
      deal.discountValue &&
      deal.maximumDiscount
    ) {
      return `Spend $${deal.minimumPurchase}, get ${deal.discountValue}% off up to $${deal.maximumDiscount}`;
    } else if (deal.discountType === 'percentage' && deal.minimumPurchase && deal.discountValue) {
      return `Spend $${deal.minimumPurchase}, get ${deal.discountValue}% off`;
    } else if (deal.discountType === 'fixed' && deal.minimumPurchase && deal.discountValue) {
      return `Spend $${deal.minimumPurchase}, get $${deal.discountValue} off`;
    } else if (deal.freeItems && deal.freeItems.length > 0 && deal.minimumPurchase) {
      // If single free item, show its name; otherwise show "free items"
      if (deal.freeItems.length === 1) {
        return `Spend $${deal.minimumPurchase}, get ${deal.freeItems[0].name} free`;
      } else {
        return `Spend $${deal.minimumPurchase}, get free items`;
      }
    }
    return deal.title;
  };

  // Handle close menu item dialog
  const handleCloseMenuItemDialog = useCallback(() => {
    setMenuItemDialogOpen(false);
  }, []);

  // Handle close group order dialog
  const handleCloseGroupOrderDialog = useCallback(() => {
    setGroupOrderDialogOpen(false);
  }, []);

  // Handle close store details dialog
  const handleCloseStoreDetailsDialog = useCallback(() => {
    setStoreDetailsDialogOpen(false);
  }, []);

  // Handle close service fees info dialog
  const handleCloseServiceFeesInfo = useCallback(() => {
    setServiceFeesInfoOpen(false);
  }, []);

  if (!restaurant) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleAddToCart = (item: any) => {
    // Check if item has modifications
    if (item.modifications && item.modifications.length > 0) {
      // Item has modifications - open dialog instead
      const itemWithRestaurantId = {
        ...item,
        restaurantId: item.restaurantId || id,
      };
      setSelectedItem(itemWithRestaurantId);
      setMenuItemDialogOpen(true);
      return;
    }

    // No modifications - add directly to cart
    const cartItem = {
      id: item.id, // Use database ID directly
      itemName: item.name, // Use itemName instead of name
      price: item.price,
      image: item.image,
    };

    const restaurantId = item.restaurantId || id;
    addItem(cartItem, 'restaurant', restaurant?.name, restaurantId);
  };

  const openItemDialog = (item: any) => {
    // Ensure the item has the restaurantId property
    const itemWithRestaurantId = {
      ...item,
      restaurantId: id,
    };
    setSelectedItem(itemWithRestaurantId);
    setMenuItemDialogOpen(true);
  };

  const openGroupOrderDialog = () => {
    setGroupOrderDialogOpen(true);
  };

  // const toggleMenuDropdown = () => {
  //   setMenuDropdownOpen(!menuDropdownOpen);
  // };

  // const selectMenuType = (menuType: string) => {
  //   setSelectedMenuType(menuType);
  //   setMenuDropdownOpen(false);
  // };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Find the selected menu type object
  // const selectedMenuTypeObj = menuTypes.find(menu => menu.name === selectedMenuType);

  // Show loading state
  if (isLoadingMenu || isLoadingRestaurant || !restaurant) {
    return (
      <div className="px-8 py-16">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="animate-pulse">
            <div className="h-[220px] bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (menuError) {
    return (
      <div className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Menu</h2>
            <p className="text-red-600">{menuError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-16">
      {/* Banner Image */}
      <div className="relative w-full h-[220px] rounded-bl-xl rounded-br-xl overflow-hidden">
        <img
          src={restaurant.detailsBanner}
          alt={`${restaurant.name}'s Banner`}
          className="w-full h-full object-cover"
        />
        {restaurant.logo && (
          <div className="absolute left-6 bottom-6 z-10">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-red-600">
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        )}
        {currentUser && (
          <div className="absolute top-4 right-4">
            <button
              className="bg-white rounded-full py-2 px-3 text-sm flex items-center gap-2 shadow-md hover:bg-gray-50 transition-colors"
              onClick={e => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="font-medium pr-1">Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Sticky Header - appears when scrolling past menuContainerRef */}
        {isStickyHeader && (
          <div
            ref={stickyHeaderRef}
            className="fixed top-[64px] left-[220px] right-4 bg-white z-30 border-b border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex-1">
                  <h1
                    style={{
                      fontFamily:
                        'TT Norms -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
                    }}
                    className="text-2xl font-bold"
                  >
                    {restaurant.name}
                  </h1>
                  <div className="flex items-center text-sm text-gray-700 mt-1">
                    {restaurant?.rating && restaurant.rating != 0 && (
                      <>
                        <span className="font-semibold mr-0.5">
                          {getDefaultRating(restaurant.rating)}
                        </span>
                        <span className="text-gray-500 mr-1">★</span>
                        {restaurant.reviews && restaurant.reviews != 0 && (
                          <span className="mr-1">({restaurant.reviews})</span>
                        )}
                      </>
                    )}
                    {restaurant.cuisine && (
                      <>
                        {restaurant?.rating && restaurant.rating != 0 && (
                          <span className="text-gray-400 mx-1">•</span>
                        )}
                        <span>{restaurant.cuisine}</span>
                      </>
                    )}
                    {restaurant.distance && (
                      <>
                        {((restaurant?.rating && restaurant.rating != 0) || restaurant.cuisine) && (
                          <span className="text-gray-400 mx-1">•</span>
                        )}
                        <span>{restaurant.distance}</span>
                      </>
                    )}
                  </div>
                </div>
                <SearchBar
                  restaurantName={restaurant.name}
                  searchQuery={searchQuery}
                  onSearchChange={query => {
                    setSearchQuery(query);
                    setIsSearching(query.trim().length > 0);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Original Header */}
        <div
          className={`flex flex-wrap justify-between mt-6 mb-6 ${
            isStickyHeader ? 'opacity-0' : ''
          }`}
        >
          <h1
            style={{
              fontFamily:
                'TT Norms -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
            }}
            className="text-2xl font-bold"
          >
            {restaurant.name}
          </h1>
          <SearchBar
            restaurantName={restaurant.name}
            searchQuery={searchQuery}
            onSearchChange={query => {
              setSearchQuery(query);
              setIsSearching(query.trim().length > 0);
            }}
          />
        </div>

        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <div className="bg-white p-4 pl-0 pt-0 border-b border-gray-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="styles__StyledInlineSvg-sc-12l8vvi-0 iIiQzo fetched-icon"
              >
                <path
                  d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                  fill="var(--usage-color-brand-dashpass)"
                ></path>
              </svg>
              <h2 className="font-bold text-lg mb-2">Store Info</h2>
              {restaurant.dashPass && (
                <div className="flex items-center text-[#00838a] mb-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="mr-1"
                  >
                    <path
                      d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                      fill="#00838a"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">DashPass</span>
                </div>
              )}
              <div className="flex items-center mb-1">
                <span className="text-sm">
                  {restaurant?.rating && restaurant.rating != 0 ? (
                    <span className="font-semibold mr-0.5">
                      {getDefaultRating(restaurant.rating)} ★
                    </span>
                  ) : null}
                  {restaurant.reviews && restaurant.reviews != 0
                    ? `(${restaurant.reviews} ratings) • `
                    : ''}
                  {restaurant.distance || 'Distance unavailable'}
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-sm">
                  {restaurant.priceRange} • {restaurant.cuisine}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span>Service fees apply</span>
                {/* <button onClick={() => setServiceFeesInfoOpen(true)} className="ml-1">
                  <Info className="h-4 w-4 text-gray-500" />
                </button> */}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  className="text-gray-600 font-medium text-sm border border-gray-300 rounded-full px-6 py-1"
                  onClick={() => setStoreDetailsDialogOpen(true)}
                >
                  See More
                </button>
              </div>
            </div>
            <div
              ref={menuContainerRef}
              className={`mt-4 ${
                isStickyMenu ? 'fixed bg-white z-40 border-r border-gray-200' : 'relative'
              }`}
              style={
                isStickyMenu && stickyHeaderHeight > 0 && menuContainerDimensions.width > 0
                  ? {
                      top: `${64 + stickyHeaderHeight}px`,
                      left: `${menuContainerDimensions.left}px`,
                      width: `${menuContainerDimensions.width}px`,
                      maxHeight: `calc(100vh - ${64 + stickyHeaderHeight}px)`,
                      overflowY: 'auto',
                    }
                  : undefined
              }
            >
              <div ref={menuRef} className="overflow-hidden">
                {/* <div className="p-4 relative" ref={menuDropdownRef}>
                  <button
                    className="w-full flex items-center justify-between font-medium"
                    onClick={toggleMenuDropdown}
                  >
                    <span>{selectedMenuType}</span>
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  <div className="text-sm text-gray-600 mt-1">{selectedMenuTypeObj?.hours}</div>

                  {menuDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-[350px] bg-white rounded-lg shadow-lg z-20 py-2">
                      {menuTypes.map(menuType => (
                        <button
                          key={menuType.id}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50"
                          onClick={() => selectMenuType(menuType.name)}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                              selectedMenuType === menuType.name
                                ? 'border-black bg-black'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {selectedMenuType === menuType.name && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{menuType.name}</div>
                            <div className="text-gray-500">{menuType.hours}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* Displaying full menu since time based menu is not available */}
                <p className="text-lg font-bold text-[#191919ff]">Full Menu</p>
                <p className="text-sm font-medium text-[#191919ff] lowercase mb-2">
                  {restaurant?.openingHours}
                </p>

                <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <ul className="space-y-1">
                    {/* Featured Items section */}
                    {featuredItems.length > 0 && (
                      <li>
                        <button
                          className={`w-full text-left px-2 py-2 rounded-md ${
                            activeCategory === 'Featured Items' ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => scrollToSection('Featured Items')}
                        >
                          Featured Items
                        </button>
                      </li>
                    )}

                    {/* Most Ordered section */}
                    {mostOrderedItems.length > 0 && (
                      <li>
                        <button
                          className={`w-full text-left px-2 py-2 rounded-md ${
                            activeCategory === 'Most Ordered' ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => scrollToSection('Most Ordered')}
                        >
                          Most Ordered
                        </button>
                      </li>
                    )}

                    {/* Regular menu categories */}
                    {menuCategories.map(category => (
                      <li key={category.id}>
                        <button
                          className={`w-full text-left px-2 py-2 rounded-md ${
                            activeCategory === category.name ? 'bg-gray-100 font-medium' : ''
                          }`}
                          onClick={() => scrollToSection(category.name)}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Spacer to prevent layout shift when menu becomes sticky */}
            {isStickyMenu &&
              menuContainerDimensions.height > 0 &&
              menuContainerDimensions.width > 0 && (
                <div
                  style={{
                    width: `${menuContainerDimensions.width}px`,
                    height: `${menuContainerDimensions.height}px`,
                    marginTop: '1rem',
                  }}
                />
              )}
          </div>

          <div className="w-full md:w-3/4 md:pl-4">
            {isSearching ? (
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-4">Search Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filter all menu items across categories */}
                  {(() => {
                    const filteredItems =
                      menuData?.menuItems.filter(
                        item =>
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description &&
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      ) || [];

                    return filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => openItemDialog(item)}
                        >
                          <div className="p-3 flex justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              {item.calories && (
                                <p className="text-sm text-gray-500">({item.calories})</p>
                              )}
                              <p className="text-gray-900 mt-1">{item.price}</p>
                            </div>
                            <div className="relative w-24 h-24">
                              <img
                                src={item.image || '/placeholder.svg'}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                              />
                              <button
                                className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                                onClick={e => {
                                  e.stopPropagation(); // Prevent opening the dialog
                                  handleAddToCart(item);
                                }}
                                aria-label="Add to cart"
                              >
                                <span className="text-lg font-bold text-gray-900">+</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center">
                        <p className="text-gray-500">
                          No items found matching &quot;{searchQuery}&quot;
                        </p>
                        <button className="mt-2 text-red-600" onClick={handleClearSearch}>
                          Clear search
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 border border-gray-200 rounded-lg p-4">
                  <div>
                    <button
                      className="border border-gray-200 px-4 py-2 flex items-center rounded-full"
                      style={{ background: '#f1f1f1' }}
                      onClick={openGroupOrderDialog}
                    >
                      <span className="mr-1">Group Order</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#e8f7f7] rounded-lg p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#3d8f8f]">
                          {restaurant.isFreeDelivery
                            ? '$0 delivery fee'
                            : `$${(restaurant.minDeliveryFee / 100).toFixed(
                                2
                              )} minimum delivery fee`}
                        </span>
                        {/* <div className="flex items-center text-gray-800 text-sm">
                          <span>pricing & fees</span>
                          <Info className="h-4 w-4 ml-1 text-gray-500" />
                        </div> */}
                      </div>
                    </div>
                    {restaurantInNearby ? (
                      <div className="text-right">
                        <div className="font-medium">{deliveryTime}</div>
                        <div className="text-sm text-gray-600">delivery time</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="font-medium text-[#191919ff] text-sm">Unavailable</div>
                        <div className="text-sm text-[#606060ff] font-medium flex items-center gap-1 justify-center">
                          <span>Too far away</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-[#191919ff] text-white p-3 max-w-[250px] text-left rounded-lg"
                              >
                                <TooltipArrow className="fill-[#191919ff]" />
                                <p className="text-sm">
                                  Your address is not in the store&apos;s delivery area
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DashPass Promo Banner */}
              </>
            )}

            {!isSearching && (
              <>
                {/* Deals & Benefits Section */}
                <Deals restaurantId={id} />

                {/* Featured Items */}
                {featuredItems.length > 0 && (
                  <div
                    ref={el => {
                      sectionRefs.current['Featured Items'] = el;
                    }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Featured Items</h2>
                      <div className="flex gap-1">
                        <button
                          onClick={handleFeaturedItemsPrevious}
                          disabled={!canScrollLeftFeatured}
                          className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
                          disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
                        >
                          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
                        </button>
                        <button
                          onClick={handleFeaturedItemsNext}
                          disabled={!canScrollRightFeatured}
                          className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
                          disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
                        >
                          <ChevronRight className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                    <div
                      ref={featuredItemsRef}
                      className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar"
                      onScroll={updateFeaturedItemsScrollButtons}
                    >
                      {featuredItems.map(item => (
                        <div
                          key={item.id}
                          className="min-w-[200px] border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => openItemDialog(item)}
                        >
                          <div className="relative h-40">
                            <img
                              src={
                                item.image || '/placeholder.svg?height=160&width=200&query=burger'
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <button
                              className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                              onClick={e => {
                                e.stopPropagation(); // Prevent opening the dialog
                                handleAddToCart(item);
                              }}
                              aria-label="Add to cart"
                            >
                              <span className="text-lg font-bold text-gray-900">+</span>
                            </button>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-gray-900 mt-1">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <Reviews vendorId={restaurant.id} vendorName={restaurant.name} />
              </>
            )}

            {!isSearching && (
              <>
                {/* Most Ordered */}
                {mostOrderedItems.length > 0 && (
                  <div
                    ref={el => {
                      sectionRefs.current['Most Ordered'] = el;
                    }}
                    className="mt-8 pt-4"
                    id="most-ordered"
                  >
                    <h2 className="text-xl font-bold mb-4">Most Ordered</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mostOrderedItems.map(item => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => openItemDialog(item)}
                        >
                          <div className="relative h-40">
                            <img
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <button
                              className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                              onClick={e => {
                                e.stopPropagation(); // Prevent opening the dialog
                                handleAddToCart(item);
                              }}
                              aria-label="Add to cart"
                            >
                              <span className="text-lg font-bold text-gray-900">+</span>
                            </button>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.calories && (
                              <p className="text-sm text-gray-500">({item.calories})</p>
                            )}
                            <p className="text-gray-900 mt-1">{item.price}</p>
                            {item.rating && item.rating != 0 && (
                              <div className="flex items-center mt-1">
                                <ThumbsUp className="w-4 h-4 text-gray-500 mr-1" strokeWidth={2} />
                                <span className="text-sm">
                                  {Math.round(getDefaultRating(item.rating) * 20)}%
                                </span>
                                {item.ratingCount && (
                                  <span className="text-sm text-gray-500 ml-1">
                                    ({item.ratingCount})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add refs for other menu categories */}
                {menuCategories
                  .filter(category => !['Featured Items', 'Most Ordered'].includes(category.name))
                  .filter(category => {
                    // Only show categories that have items
                    const categoryItems =
                      menuData?.menuItems.filter(item => item.category === category.name) || [];
                    return categoryItems.length > 0;
                  })
                  .map(category => (
                    <div
                      key={category.id}
                      ref={el => {
                        sectionRefs.current[category.name] = el;
                      }}
                      className="mt-8 pt-4"
                      id={category.name.toLowerCase().replace(/\s+/g, '-')}
                    >
                      <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(
                          menuData?.menuItems.filter(item => item.category === category.name) || []
                        ).map(item => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => openItemDialog(item)}
                          >
                            <div className="p-3 flex justify-between">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                {item.calories && (
                                  <p className="text-sm text-gray-500">({item.calories})</p>
                                )}
                                <p className="text-gray-900 mt-1">{item.price}</p>
                              </div>
                              <div className="relative w-24 h-24">
                                <img
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                                  onClick={e => {
                                    e.stopPropagation(); // Prevent opening the dialog
                                    handleAddToCart(item);
                                  }}
                                  aria-label="Add to cart"
                                >
                                  <span className="text-lg font-bold text-gray-900">+</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Menu Item Dialog */}
      <MenuItemDialog
        isOpen={menuItemDialogOpen}
        onClose={handleCloseMenuItemDialog}
        item={selectedItem}
      />
      {/* Group Order Dialog */}
      <GroupOrderDialog isOpen={groupOrderDialogOpen} onClose={handleCloseGroupOrderDialog} />
      {/* Store Details Dialog */}
      <StoreDetailsDialog
        isOpen={storeDetailsDialogOpen}
        onClose={handleCloseStoreDetailsDialog}
        store={restaurant}
      />
      {/* Service Fees Info Dialog */}
      <ServiceFeesInfo isOpen={serviceFeesInfoOpen} onClose={handleCloseServiceFeesInfo} />
      {/* Outside Delivery Area Modal */}
      <OutsideDeliveryAreaModal
        isOpen={outsideDeliveryAreaModalOpen}
        onClose={() => setOutsideDeliveryAreaModalOpen(false)}
      />

      {/* Deal Banner */}
      {firstDeal && (
        <div
          className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#fef0ed] px-4 py-2 flex items-center justify-center gap-3 z-40 
        border-t border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img
                src="/offer-icon.svg"
                alt="Deal"
                width={24}
                height={24}
                loading="lazy"
                className="object-contain"
              />
            </div>
            <span className="text-base font-bold text-[#eb1700ff]">
              {getDealBannerText(firstDeal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
