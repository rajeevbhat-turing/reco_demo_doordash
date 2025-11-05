"use client"

import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import StoreCard from "@/components/storeCard"
import GrocerySchedule from "@/components/grocery-schedule"
import { stores } from "@/constants/store"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useCartStore } from "@/store/cart-store"
import { useAppStore } from "@/store/app-store"
import { getDefaultRating } from "@/utils/rating-utils"

// Retail-specific banner data
const retailBanners = [
  {
    id: "1",
    title: "Home improvement and hardware essentials from Lowe's",
    description: "Find tools, appliances, garden supplies, and home improvement materials for every project.",
    buttonText: "Shop now",
    backgroundColor: "#f0f8ff",
    buttonColor: "bg-[#004990] hover:bg-[#003d7a]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e35cca4a-a694-4eed-823f-7253f72b8e6f-retina-large.jpg",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
    link: "/convenience/store/lowes?storeType=retail"
  },
  {
    id: "2",
    title: "Office supplies and electronics from Staples",
    description: "Browse office furniture, tech accessories, printing services, and business essentials.",
    buttonText: "Shop Staples",
    backgroundColor: "#fff5f5",
    buttonColor: "bg-[#cc0000] hover:bg-[#b30000]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d6338d1-1d18-4cb3-b146-232913b74923-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
    link: "/retail/store/staples"
  }
];

export default function Retail() {
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null, // DEPRECATED
    minPrice: null,
    maxPrice: null,
    dashPass: false,
    location: null,
    cuisine: null,
    dietaryPreferences: null,
  })
  
  const filterOptionsRef = useRef<FilterOptionsRef>(null)
  const { clearCurrentStore, updateSearchResults, clearSearchResults } = useAppStore()

  // Set category explicitly
  useEffect(() => {
    const cartStore = useCartStore.getState();
    cartStore.setCategory("retail");
    clearCurrentStore();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  // Handle reset
  const handleReset = () => {
    const resetFilters: FilterState = {
      underThirtyMins: false,
      deals: false,
      overRating: null,
      price: null, // DEPRECATED
      minPrice: null,
      maxPrice: null,
      dashPass: false,
      location: null,
      cuisine: null,
      dietaryPreferences: null,
    }
    setActiveFilters(resetFilters)
    if (filterOptionsRef.current) {
      filterOptionsRef.current.resetFilters()
    }
    clearSearchResults();
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      activeFilters.underThirtyMins ||
      activeFilters.deals ||
      activeFilters.overRating !== null ||
      (activeFilters.price !== null && activeFilters.price.length > 0) || // DEPRECATED
      (activeFilters.minPrice !== null && activeFilters.minPrice !== undefined) ||
      (activeFilters.maxPrice !== null && activeFilters.maxPrice !== undefined) ||
      activeFilters.dashPass ||
      activeFilters.location !== null ||
      (activeFilters.cuisine !== null && activeFilters.cuisine !== undefined && activeFilters.cuisine.length > 0) ||
      (activeFilters.dietaryPreferences !== null && activeFilters.dietaryPreferences !== undefined && activeFilters.dietaryPreferences.length > 0)
    )
  }

  // Filter stores based on active filters
  const filteredStores = stores.filter(store => {
    // Filter by under 30 min
    if (activeFilters.underThirtyMins) {
      const timeString = store.deliveryTime || "";
      const minutes = parseInt(timeString.match(/\d+/)?.[0] || "100");
      if (minutes >= 30) return false;
    }
    
    // Filter by rating (check tags for rating thresholds)
    if (activeFilters.overRating && activeFilters.overRating > 0) {
      // For retail stores, we check tags since they don't have direct rating field
      // Check if store has the rating tag matching the selected threshold
      const hasOverRatingTag = store.tags?.includes(`Over ${activeFilters.overRating}`) || 
                               // Fallback: check for "Over 4.5" tag if rating is 4.5 or higher (for backward compatibility)
                               (activeFilters.overRating >= 4.5 && store.tags?.includes("Over 4.5")) ||
                               // Fallback: check for "Over 4" tag if rating is 4 or higher
                               (activeFilters.overRating >= 4 && activeFilters.overRating < 4.5 && store.tags?.includes("Over 4")) ||
                               // Fallback: check for "Over 3.5" tag if rating is 3.5 or higher
                               (activeFilters.overRating >= 3.5 && activeFilters.overRating < 4 && store.tags?.includes("Over 3.5")) ||
                               // Fallback: check for "Over 3" tag if rating is 3 or higher
                               (activeFilters.overRating >= 3 && activeFilters.overRating < 3.5 && store.tags?.includes("Over 3"))
      if (!hasOverRatingTag) return false;
    }
    
    // Filter by DashPass
    if (activeFilters.dashPass && !store.isDashPass) {
      return false;
    }

    // Filter by deals (check if store has discount)
    if (activeFilters.deals && !store.discount) {
      return false;
    }

    // Filter by location (distance) - retail stores might not have distance field
    // We'll skip this filter for retail stores as they don't have distance data
    if (activeFilters.location) {
      // Retail stores don't typically have distance field, so skip this filter
      // or implement based on tags if available
    }

    // Filter by cuisine - retail stores don't have cuisine
    if (activeFilters.cuisine && activeFilters.cuisine.length > 0) {
      // Retail stores don't have cuisine, so skip this filter
    }

    // Filter by dietary preferences
    if (activeFilters.dietaryPreferences && activeFilters.dietaryPreferences.length > 0) {
      const storeDietary = (store as any).dietaryPreferences || [];
      const matchesDietary = activeFilters.dietaryPreferences!.some(pref =>
        storeDietary.includes(pref)
      );
      if (!matchesDietary) return false;
    }

    // Filter by min/max price (new implementation)
    // Note: For stores, we need product data to properly filter by price
    // For now, stores pass through this filter until product data is available
    if (activeFilters.minPrice != null || activeFilters.maxPrice != null) {
      // TODO: Implement product-based price filtering for retail stores
      // For now, return true (don't filter) until product data is available
      // This ensures the filter UI works but doesn't break functionality
    }
    
    return true;
  })

  const nearbyStores = filteredStores.filter(store => store.isNearYou)

  return (
    <main className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* Filter Options Bar */}
        <FilterOptions 
          ref={filterOptionsRef}
          isGrocery={false} 
          onFilterChange={handleFilterChange}
          filters={activeFilters}
          showPriceFilter={true}
          hideCuisineFilter={true}
          hideDietaryFilter={true}
        />

        {/* Promotional Banners */}
        <GrocerySchedule promos={retailBanners} />

        {hasActiveFilters() && (
          <div className="flex items-center justify-between mt-6 mb-2">
            <p className="text-gray-900 font-medium">{filteredStores.length} results</p>
            <button
              onClick={handleReset}
              className="bg-gray-100 text-gray-900 font-medium text-sm rounded-full px-4 py-2"
            >
              Reset
            </button>
          </div>
        )}
        {!hasActiveFilters() && (
          <>
            <h2 className="text-xl font-bold mt-8 mb-4">Stores Near You</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyStores.map((store) => (
                <StoreCard key={store.id} {...store} storeType="retail" />
              ))}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Popular Deals</h2>
              </div>
              <div
                className="border border-gray-200 rounded-lg p-4 max-w-[368px] cursor-pointer hover:bg-gray-50"
                onClick={() => window.location.href = '/convenience/store/lowes?storeType=retail'}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png"
                    alt="Lowe's"
                    width={36}
                    height={36}
                    className="rounded-full"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-gray-900">Lowe's</span>
                    <span className="text-sm text-gray-500">33 min</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>

                <div className="grid grid-cols-2 gap-x-24 gap-y-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e35cca4a-a694-4eed-823f-7253f72b8e6f-retina-large.jpg"
                      alt="Microwave"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$67.60</p>
                      <p className="text-sm text-gray-500 line-through">$169.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d6338d1-1d18-4cb3-b146-232913b74923-retina-large.png"
                      alt="Air Filter"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$2.42</p>
                      <p className="text-sm text-gray-500 line-through">$50.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e4bee36-6259-4606-9e83-6656e18cf869-retina-large.jpg"
                      alt="Fertilizer"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$2.00</p>
                      <p className="text-sm text-gray-500 line-through">$4.50</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5c392522-4380-4812-a664-814edfa3463d-retina-large.png"
                      alt="Vacuum"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$89.99</p>
                      <p className="text-sm text-gray-500 line-through">$99.99</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">All stores</h2>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} {...store} storeType="retail" />
          ))}
        </div>

        {/* Show "No products match your price" message when price filter is active (Retail page doesn't have products) */}
        {(activeFilters.minPrice != null || activeFilters.maxPrice != null) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No products match your price</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your price range or browse other products
            </p>
          </div>
        )}
      </main>
  )
}

