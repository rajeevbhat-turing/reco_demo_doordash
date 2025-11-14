'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  X,
} from 'lucide-react';
import { useRestaurants } from "@/lib/hooks/use-restaurants";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useRestaurantMenu } from "@/lib/hooks/use-restaurant-menu";
import { useUserStore } from "@/store/user-store";
import { getRestaurantById } from "@/lib/utils/restaurant-utils";
import { useCartStore } from "@/store/cart-store";
import { useAppStore } from "@/store/app-store";
import { useVerifierStore } from "@/store/verifier-store";
import MenuItemDialog from "@/components/menu-item-dialog";
import GroupOrderDialog from "@/components/group-order-dialog";
import StoreDetailsDialog from "@/components/store-details-dialog";
import { Reviews } from "@/components/reviews";
import { type Deal } from '@/types/deal-types';
import { useDealsByRestaurantId } from '@/lib/hooks/use-deals';
import { Deals } from '@/components/deals';
import ServiceFeesInfo from '@/components/service-fees-info';
import { getDefaultRating } from '@/utils/rating-utils';

const menuTypes = [
  {
    id: 'overnight',
    name: 'Overnight Menu',
    hours: '12:00 AM - 3:59 AM',
  },
  {
    id: 'regular',
    name: 'Regular Menu',
    hours: '10:30 AM - 11:59 PM',
  },
  {
    id: 'breakfast',
    name: 'Breakfast Menu',
    hours: '4:00 AM - 10:29 AM',
  },
];

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
  const [familySharingItems, setFamilySharingItems] = useState<any[]>([]);
  const [beefItems, setBeefItems] = useState<any[]>([]);
  const [menuTopPosition, setMenuTopPosition] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // Get both setCategory and addItem from the cart store
  const cartStore = useCartStore();
  const { addItem } = useCartStore();
  const ticking = useRef(false);
  const featuredItemsRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);

  // Fetch restaurants near user's address
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses.find(a => a.default);
  const { data: restaurants } = useRestaurants(
    defaultAddress?.lat,
    defaultAddress?.lng,
    10 // 10 mile radius
  );

  // Check if restaurant is in nearby results
  const restaurantInNearby = restaurants ? getRestaurantById(restaurants, id) : null;
  
  // If not in nearby results, fetch this specific restaurant
  const { data: specificRestaurant, isLoading: isLoadingRestaurant } = useRestaurant(
    !restaurantInNearby && id ? id : undefined
  );

  // Fetch menu for this restaurant
  const { data: menuData, isLoading: isLoadingMenu, error: menuError } = useRestaurantMenu(id);

  // Set the category to restaurant when the page loads
  useEffect(() => {
    cartStore.setCategory('restaurant');
  }, []);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Dialog states
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [groupOrderDialogOpen, setGroupOrderDialogOpen] = useState(false);
  const [storeDetailsDialogOpen, setStoreDetailsDialogOpen] = useState(false);
  const [serviceFeesInfoOpen, setServiceFeesInfoOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState('Regular Menu');

  const { setCurrentStore, clearCurrentStore } = useAppStore();
  const { recordNavigationFromSearch } = useVerifierStore();

  // Check if user came from search and record navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer.includes('/search')) {
        console.log('[NAVIGATION] User came from search page, recording navigation');
        // Small delay to ensure search info is set before navigation
        setTimeout(() => {
          recordNavigationFromSearch();
        }, 100);
      }
    }
  }, [recordNavigationFromSearch]);

  // Set the cart category to restaurant when the component mounts
  useEffect(() => {
    // Set the category to restaurant
    cartStore.setCategory('restaurant');
  }, []);

  useEffect(() => {
    if (id && menuData) {
      // Use restaurant from nearby results if available, otherwise use specifically fetched one
      const restaurantData = restaurantInNearby || specificRestaurant;

      if (restaurantData) {
        setCurrentStore(restaurantData, 'restaurant');
      }
      setRestaurant(restaurantData);

      // Get featured items using the featured flag from database
      const featuredItemsData = menuData.menuItems.filter(item => item.featured === true);

      // Get most ordered items - prioritize popular flag, then sort by rating_count
      const mostOrderedItemsData = menuData.menuItems
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

      const familySharingItemsData = menuData.menuItems.filter(
        item => item.category === 'Family & Sharing'
      );
      const beefItemsData = menuData.menuItems.filter(item => item.category === 'Beef');

      // Transform categories to match expected format
      const menuCategoriesData = menuData.categories.map(cat => ({
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
  }, [id, restaurantInNearby, specificRestaurant, menuData]);

  // Save the initial position of the menu after the component mounts
  useEffect(() => {
    if (menuRef.current && menuContainerRef.current) {
      const rect = menuContainerRef.current.getBoundingClientRect();
      setMenuTopPosition(rect.top + window.scrollY);
    }
  }, [restaurant]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;

      requestAnimationFrame(() => {
        // Find which section is currently in view
        const sectionPositions = Object.entries(sectionRefs.current).map(([category, ref]) => {
          const position = ref?.getBoundingClientRect().top || 0;
          return { category, position };
        });

        const currentSection = sectionPositions
          .filter(section => section.position <= 200)
          .sort((a, b) => b.position - a.position)[0];

        if (currentSection && currentSection.category !== activeCategory) {
          setActiveCategory(currentSection.category);
        }

        ticking.current = false;
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (category: string) => {
    setActiveCategory(category);
    const section = sectionRefs.current[category];
    if (section) {
      const offset = 80;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
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

  if (!restaurant) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleAddToCart = (item: any) => {
    // Add to cart - will automatically find or create restaurant cart
    const cartItem = {
      id: item.id, // Use database ID directly
      itemName: item.name, // Use itemName instead of name
      price: item.price,
      image: item.image,
    };

    const restaurantId = item.restaurantId || id;
    addItem(cartItem, 'restaurant', restaurant?.name, restaurantId);
  };

  const scrollContainer = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!containerRef.current) return;

    const scrollAmount = 600; // Adjust this value based on how far you want to scroll
    const currentScroll = containerRef.current.scrollLeft;

    containerRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth',
    });
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

  const toggleMenuDropdown = () => {
    setMenuDropdownOpen(!menuDropdownOpen);
  };

  const selectMenuType = (menuType: string) => {
    setSelectedMenuType(menuType);
    setMenuDropdownOpen(false);
  };

  // Find the selected menu type object
  const selectedMenuTypeObj = menuTypes.find(menu => menu.name === selectedMenuType);

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
        <Image
          src={restaurant.detailsBanner}
          alt={`${restaurant.name}'s Banner`}
          fill
          className="object-cover"
        />
        {restaurant.logo && (
          <div className="absolute left-6 bottom-6 z-10">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-red-600">
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        )}
        {/* <div className="absolute top-4 right-4">
          <button
            className="bg-white rounded-full p-2 flex items-center gap-2 shadow-md hover:bg-gray-50 transition-colors"
            onClick={e => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="font-medium pr-1">Save</span>
          </button>
        </div> */}
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-between mt-6 mb-6">
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
            <div className="bg-white rounded-lg p-4 pl-0 pt-0">
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
                  {getDefaultRating(restaurant.rating)} ★{' '}
                  {restaurant.reviews ? `(${restaurant.reviews} ratings)` : '(0 ratings)'} •{' '}
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
                <button onClick={() => setServiceFeesInfoOpen(true)} className="ml-1">
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
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
            <div ref={menuContainerRef} className="relative mt-4">
              <div
                ref={menuRef}
                className="overflow-hidden"
                style={{
                  position: 'sticky',
                  top: '80px',
                  transition: 'none',
                  zIndex: 10,
                }}
              >
                <div className="p-4 relative" ref={menuDropdownRef}>
                  <button
                    className="w-full flex items-center justify-between font-medium"
                    onClick={toggleMenuDropdown}
                  >
                    <span>{selectedMenuType}</span>
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  <div className="text-sm text-gray-600 mt-1">{selectedMenuTypeObj?.hours}</div>

                  {/* Menu Type Dropdown */}
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
                </div>
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
                              <Image
                                src={item.image || '/placeholder.svg'}
                                alt={item.name}
                                fill
                                className="object-cover rounded-lg"
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
                        <p className="text-gray-500">No items found matching "{searchQuery}"</p>
                        <button className="mt-2 text-red-600" onClick={() => setSearchQuery('')}>
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
                        <span className="font-medium text-[#3d8f8f]">$0 delivery fee</span>
                        <div className="flex items-center text-gray-800 text-sm">
                          <span>pricing & fees</span>
                          <Info className="h-4 w-4 ml-1 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">21 min</div>
                      <div className="text-sm text-gray-600">delivery time</div>
                    </div>
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
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Featured Items</h2>
                    <div className="flex">
                      <button
                        className="p-2 rounded-full border border-gray-200 mr-2"
                        onClick={() => scrollContainer(featuredItemsRef, 'left')}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded-full border border-gray-200"
                        onClick={() => scrollContainer(featuredItemsRef, 'right')}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={featuredItemsRef}
                    className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar"
                  >
                    {featuredItems.map(item => (
                      <div
                        key={item.id}
                        className="min-w-[200px] border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => openItemDialog(item)}
                      >
                        <div className="relative h-40">
                          <Image
                            src={item.image || '/placeholder.svg?height=160&width=200&query=burger'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                            priority={false}
                            sizes="(max-width: 768px) 200px, 200px"
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

                {/* Reviews Section */}
                <Reviews vendorId={restaurant.id} vendorName={restaurant.name} />
              </>
            )}

            {!isSearching && (
              <>
                {/* Most Ordered */}
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
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            className="object-cover"
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
                          {item.rating && (
                            <div className="flex items-center mt-1">
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

                {/* Add refs for other menu categories */}
                {menuCategories
                  .filter(category => !['Featured Items', 'Most Ordered'].includes(category.name))
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
                                <Image
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-lg"
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
        onClose={() => setMenuItemDialogOpen(false)}
        item={selectedItem}
      />
      {/* Group Order Dialog */}
      <GroupOrderDialog
        isOpen={groupOrderDialogOpen}
        onClose={() => setGroupOrderDialogOpen(false)}
      />
      {/* Store Details Dialog */}
      <StoreDetailsDialog
        isOpen={storeDetailsDialogOpen}
        onClose={() => setStoreDetailsDialogOpen(false)}
        store={restaurant}
      />
      {/* Service Fees Info Dialog */}
      <ServiceFeesInfo isOpen={serviceFeesInfoOpen} onClose={() => setServiceFeesInfoOpen(false)} />

      {/* Deal Banner */}
      {firstDeal && (
        <div
          className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#fef0ed] px-4 py-2 flex items-center justify-center gap-3 z-40 
        border-t border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Image
                src="/offer-icon.svg"
                alt="Deal"
                width={24}
                height={24}
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
