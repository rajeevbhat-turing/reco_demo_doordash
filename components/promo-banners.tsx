'use client';

import { useRef, useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useUserStore } from '@/store/user-store';

interface PromoBanner {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  gradient: string;
  image: string;
  restaurantName: string;
  textColor?: string;
}

export default function PromoBanners() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's address for location-based filtering
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  );
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses?.find(a => a.default);

  // Get temp address for guest users
  const tempAddress = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().getTempAddress(),
    () => null // fallback for SSR
  );

  // Determine which address to use: logged-in user's default address or guest's temp address
  const activeAddress = isAuthenticated ? defaultAddress : tempAddress;

  // Fetch restaurants near user's address
  const { data: restaurants, isLoading: isLoadingRestaurants } = useRestaurants(
    activeAddress?.lat,
    activeAddress?.lng,
    10 // 10 mile radius
  );

  // Fetch promotional banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/promotionals');
        const result = await response.json();

        if (result.success && result.data) {
          // Transform API data to component format
          const transformedBanners = result.data.map((promo: any) => ({
            id: promo.id,
            restaurantId: promo.restaurantId,
            title: promo.title,
            description: promo.description,
            buttonText: promo.buttonText,
            buttonColor: promo.buttonColor,
            gradient: promo.gradient,
            image: promo.image,
            restaurantName: promo.restaurantName,
            // Determine text color based on gradient (if gradient is dark, use white text)
            textColor:
              promo.gradient.includes('green-600') || promo.gradient.includes('green-700')
                ? 'text-white'
                : undefined,
          }));
          setBanners(transformedBanners);
        } else {
          setError('Failed to load promotional banners');
        }
      } catch (err) {
        console.error('Error fetching promotional banners:', err);
        setError('Failed to load promotional banners');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Filter banners to only include restaurants in delivery area
  const filteredBanners = useMemo(() => {
    // If no address is set, loading restaurants, or no restaurants, don't show any banners
    if (!activeAddress || isLoadingRestaurants || !restaurants) {
      return [];
    }

    // Create a set of restaurant IDs that are in delivery area
    const restaurantIdsInDeliveryArea = new Set(restaurants.map(restaurant => restaurant.id));

    // Filter banners to only include those whose restaurant is in delivery area
    return banners.filter(banner => restaurantIdsInDeliveryArea.has(banner.restaurantId));
  }, [banners, restaurants, isLoadingRestaurants, activeAddress]);

  // Update currentIndex based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || filteredBanners.length === 0) return;

    const updateIndexFromScroll = () => {
      const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0;
      const gap = 16;
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // Check if we're at the end (within 5px tolerance)
      if (scrollLeft >= maxScroll - 5) {
        setCurrentIndex(filteredBanners.length - 1);
      } else if (scrollLeft <= 5) {
        // At the start
        setCurrentIndex(0);
      } else {
        // Calculate index based on scroll position
        const newIndex = Math.round(scrollLeft / (cardWidth + gap));
        setCurrentIndex(Math.min(Math.max(0, newIndex), filteredBanners.length - 1));
      }
    };

    container.addEventListener('scroll', updateIndexFromScroll);
    // Also check on resize
    window.addEventListener('resize', updateIndexFromScroll);

    // Initial check after a short delay to ensure layout is complete
    const timeoutId = setTimeout(updateIndexFromScroll, 100);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', updateIndexFromScroll);
      window.removeEventListener('resize', updateIndexFromScroll);
    };
  }, [filteredBanners.length]);

  const scrollBanners = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0;
    const gap = 16; // gap-4 = 16px
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(prev => Math.min(filteredBanners.length - 1, prev + 1));
    }

    // Pause auto-scroll when user manually navigates
    setIsAutoScrolling(false);
    // Clear existing timeout if any
    if (autoScrollResumeTimeoutRef.current) {
      clearTimeout(autoScrollResumeTimeoutRef.current);
    }
    autoScrollResumeTimeoutRef.current = setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || filteredBanners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev >= filteredBanners.length - 1 ? 0 : prev + 1;

        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0;
          const gap = 16;
          const scrollAmount = (cardWidth + gap) * nextIndex;

          if (nextIndex === 0) {
            // Reset to beginning
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
          }
        }

        return nextIndex;
      });
    }, 4000); // Change banner every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, filteredBanners.length]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (autoScrollResumeTimeoutRef.current) {
        clearTimeout(autoScrollResumeTimeoutRef.current);
      }
    },
    []
  );

  // Don't render if loading banners or restaurants, or if there's an error
  if (isLoading || isLoadingRestaurants) {
    return (
      <div className="relative mb-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-full max-w-xl bg-gray-200 animate-pulse rounded-lg h-32" />
        </div>
      </div>
    );
  }

  // Don't show anything if there's an error, no banners, or no address
  if (error || filteredBanners.length === 0 || !activeAddress) {
    return null;
  }

  return (
    <div className="relative mb-6">
      {/* Scrollable Banner Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        {filteredBanners.map(banner => (
          <Link
            key={banner.id}
            href={`/store/${banner.restaurantId}`}
            className={`promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r ${banner.gradient} overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-lg`}
            style={{ scrollSnapAlign: 'start' }}
            prefetch={false}
          >
            <div className="flex">
              <div className="p-6 flex-1">
                <h3 className={`text-xl font-bold ${banner.textColor || 'text-gray-900'}`}>
                  {banner.title}
                </h3>
                <p className={`text-sm mt-2 ${banner.textColor ? 'opacity-90' : 'text-gray-700'}`}>
                  {banner.description}
                </p>
                <div className="mt-4 inline-block">
                  <button
                    className={`${banner.buttonColor} ${
                      banner.buttonColor.includes('text-') ? '' : 'text-white'
                    } px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-shadow`}
                  >
                    {banner.buttonText}
                  </button>
                </div>
              </div>
              <div className="relative w-48 h-auto flex items-center justify-center">
                <img
                  src={banner.image}
                  alt={banner.restaurantName}
                  width={120}
                  height={120}
                  className="object-contain rounded-full"
                  onError={e => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <div className="absolute -left-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => scrollBanners('left')}
            className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {currentIndex < filteredBanners.length - 1 && (
        <div className="absolute -right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => scrollBanners('right')}
            className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Indicator dots
      <div className="flex justify-center space-x-2 mt-4">
        {filteredBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current
                const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0
                const gap = 16
                const scrollAmount = (cardWidth + gap) * index
                container.scrollTo({ left: scrollAmount, behavior: "smooth" })
              }
              setIsAutoScrolling(false)
              setTimeout(() => setIsAutoScrolling(true), 5000)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div> */}
    </div>
  );
}
