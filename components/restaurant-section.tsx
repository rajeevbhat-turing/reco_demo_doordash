'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Restaurant } from '@/constants/restaurants';
import { getDefaultRating } from '@/lib/utils/rating-utils';
import { useRestaurantsOpenStatus } from '@/lib/hooks/use-restaurant-open-status';

interface RestaurantSectionProps {
  title: string;
  restaurants: Restaurant[];
  seeAllLink?: string;
}

export default function RestaurantSection({
  title,
  restaurants,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seeAllLink = '/all-items',
}: RestaurantSectionProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [_cardWidth, setCardWidth] = useState(350);
  const [_visibleCards, setVisibleCards] = useState(3);
  const [_containerWidth, setContainerWidth] = useState(0);

  // Calculate open status based on user's local time
  const openStatusMap = useRestaurantsOpenStatus(restaurants);

  // Calculate how many cards can fit and their optimal width
  useEffect(() => {
    const updateCardLayout = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      setContainerWidth(containerWidth);

      // Base card width (350px) + gap (16px)
      const baseCardWidth = 350;
      const gap = 16;

      // Calculate how many whole cards can fit
      const cardsPerView = Math.floor(containerWidth / (baseCardWidth + gap));
      setVisibleCards(Math.max(1, cardsPerView));

      // Calculate the optimal card width to fill the container evenly
      // We subtract the total gap space and divide by number of cards
      const optimalCardWidth = (containerWidth - gap * (cardsPerView - 1)) / cardsPerView;
      setCardWidth(optimalCardWidth);
    };

    // Initial calculation
    updateCardLayout();

    // Recalculate on window resize
    window.addEventListener('resize', updateCardLayout);
    return () => window.removeEventListener('resize', updateCardLayout);
  }, []);

  return (
    <section className="py-6">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map(restaurant => (
          <Link
            href={`/store/${restaurant.id}`}
            key={restaurant.id}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            prefetch={true}
            onMouseEnter={() => {
              // Prefetch on hover for even faster navigation
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
                    // Fallback to placeholder if image fails to load
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

                {restaurant?.rating && restaurant.rating != 0 ? (
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
                  <span>
                    {openStatusMap.get(restaurant.id) ?? restaurant.isOpen
                      ? restaurant.time
                      : 'Closed'}
                  </span>
                </div>

                <div className="text-sm text-gray-500">{restaurant.deliveryFee}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
