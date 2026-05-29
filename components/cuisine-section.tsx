'use client';

import Link from 'next/link';
import type { ExpectedSection } from '@/lib/reco/types';
import type { Restaurant } from '@/constants/restaurants';
import { getDefaultRating } from '@/utils/rating-utils';

type Props = {
  section: ExpectedSection;
  restaurants: Restaurant[];
};

export default function CuisineSection({ section, restaurants }: Props) {
  if (restaurants.length === 0) return null;

  return (
    <section className="py-4 px-4 rounded-xl bg-orange-50 mb-2">
      <div className="flex items-center gap-2 mb-4 pt-2">
        <h2 className="text-2xl font-bold">{section.label}</h2>
        <span className="text-xs font-semibold bg-orange-500 text-white rounded-full px-2 py-0.5">
          For you
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {restaurants.map((restaurant, idx) => {
          const isNovel = idx === section.novelty_index;
          const rating = getDefaultRating(restaurant.rating);
          return (
            <Link
              key={restaurant.id}
              href={`/store/${restaurant.id}`}
              className="relative block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              {isNovel && (
                <span className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Try something new
                </span>
              )}
              <div className="h-28 bg-gray-100 overflow-hidden">
                {restaurant.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{restaurant.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rating > 0 ? `${rating.toFixed(1)} ★` : ''}
                  {restaurant.time ? ` · ${restaurant.time}` : ''}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="pb-2" />
    </section>
  );
}
