/**
 * Skeleton loader for restaurant cards
 *
 * Shows loading placeholders while restaurants are being fetched
 */
export function RestaurantSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Restaurant name */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />

        {/* Rating and info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-1 w-1 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-1 w-1 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton loaders
 *
 * @param count - Number of skeleton cards to show (default: 12)
 */
export function RestaurantsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <RestaurantSkeleton key={index} />
      ))}
    </div>
  );
}
