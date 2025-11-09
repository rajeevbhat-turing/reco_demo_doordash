"use client"

import { useState, useRef, useEffect } from "react"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import GrocerySchedule from "@/components/grocery-schedule"
import StoreGrid from "@/components/store/store-grid"
import ProductDisplay from "@/components/product/product-display"
import { useCartStore } from "@/store/cart-store"
import {
  getFilterOptions,
  getAllStores,
  getGroceryScheduleData,
  getGroceryEssentialsData,
  getGroceryFavorites,
  getFastestNearYou,
  getProductCarouselData,
} from "@/app/grocery/data/retail-response-mapper"
import AllStores from "@/components/all-stores"
import { getDefaultRating } from "@/utils/rating-utils"
import { extractPrice } from "@/utils/price-filter-utils"

export default function Grocery() {
  // Filter state
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
  });
  
  const filterOptionsRef = useRef<FilterOptionsRef>(null);
  
  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidImage = (imageUrl: string | undefined): boolean => {
    if (!imageUrl || imageUrl.trim() === '') return false;
    if (imageUrl.includes('placeholder.svg')) return false;
    if (imageUrl.includes('placeholder.png')) return false;
    return true;
  };
  
  // Get the data from our retail response mapper
  const filterOptions = getFilterOptions()
  const allStores = getAllStores()
  const scheduleData = getGroceryScheduleData()
  const essentialsData = getGroceryEssentialsData()
  const allFavoriteStores = getGroceryFavorites().filter(store => hasValidImage(store.image))
  const allFastestStores = getFastestNearYou().filter(store => hasValidImage(store.image))
  const allProductCarousels = getProductCarouselData()
  
  // Handle filter changes
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

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
  };
  
  // Filter stores based on active filters
  const filterStores = (storeList: any[]) => {
    return storeList.filter(store => {
      // Filter by under 30 min
      if (activeFilters.underThirtyMins) {
        const timeString = store.time || "";
        const minutes = parseInt(timeString.match(/\d+/)?.[0] || "100");
        if (minutes >= 30) return false;
      }
      
      // Filter by rating
      if (activeFilters.overRating && store.rating) {
        const rating = getDefaultRating(store.rating)
        if (rating < activeFilters.overRating) return false;
      }
      
      // Filter by DashPass
      if (activeFilters.dashPass && !store.isDashPass) {
        return false;
      }

      // Filter by location (distance)
      if (activeFilters.location) {
        const distanceStr = store.distance || "";
        
        // Parse distance: "700 ft" -> 700/5280 = 0.13 mi, "2.5 mi" -> 2.5 mi
        const ftMatch = distanceStr.match(/(\d+)\s*ft/);
        const miMatch = distanceStr.match(/(\d+\.?\d*)\s*mi/);
        
        let distanceInMiles = 999; // Default to far away
        if (ftMatch) {
          distanceInMiles = parseFloat(ftMatch[1]) / 5280; // Convert feet to miles
        } else if (miMatch) {
          distanceInMiles = parseFloat(miMatch[1]);
        }

        const maxDistance = activeFilters.location === "under-1mi" ? 1 
                          : activeFilters.location === "under-3mi" ? 3 
                          : activeFilters.location === "under-5mi" ? 5 
                          : 999;
        
        if (distanceInMiles > maxDistance) return false;
      }

      // Filter by cuisine (for grocery stores, this might be store category/type)
      // Since grocery stores don't have cuisine, we can skip this filter for grocery page
      // But we'll keep the structure for consistency
      if (activeFilters.cuisine && activeFilters.cuisine.length > 0) {
        // Grocery stores don't have cuisine, so skip this filter
        // This filter won't affect grocery stores
      }

      // Filter by dietary preferences
      if (activeFilters.dietaryPreferences && activeFilters.dietaryPreferences.length > 0) {
        // Check if store has dietaryPreferences field
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
        // TODO: Implement product-based price filtering for grocery stores
        // For now, return true (don't filter) until product data is available
        // This ensures the filter UI works but doesn't break functionality
      }
      
      return true;
    });
  };
  
  // Apply filters to data
  const stores = filterStores(allStores);
  const favoriteStores = filterStores(allFavoriteStores);
  const fastestStores = filterStores(allFastestStores);
  
  // Filter products in product carousels based on price filter
  const productCarousels = allProductCarousels.map(carousel => {
    let filteredProducts = carousel.products || []
    
    // Apply price filter to products if min/max price is set
    if (activeFilters.minPrice != null || activeFilters.maxPrice != null) {
      filteredProducts = (carousel.products || []).filter(product => {
        const productPrice = extractPrice(product.price)
        const minPrice = activeFilters.minPrice != null ? activeFilters.minPrice : null
        const maxPrice = activeFilters.maxPrice != null ? activeFilters.maxPrice : null
        
        // Check if product price falls within range
        if (minPrice !== null && maxPrice !== null) {
          return productPrice >= minPrice && productPrice <= maxPrice
        } else if (minPrice !== null) {
          return productPrice >= minPrice
        } else if (maxPrice !== null) {
          return productPrice <= maxPrice
        }
        
        return true
      })
    }
    
    return {
      ...carousel,
      products: filteredProducts
    }
  }).filter(carousel => carousel.products && carousel.products.length > 0) // Only show carousels with products after filtering

  // Set category explicitly
  useEffect(() => {
    const cartStore = useCartStore.getState();
    cartStore.setCategory("grocery");
  }, []);
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* Filter Options Bar */}
      <FilterOptions 
        ref={filterOptionsRef}
        isGrocery={false} 
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        filters={activeFilters}
        showPriceFilter={true}
        hideCuisineFilter={true}
        hideDietaryFilter={false}
      />

      {/* Promotional Banners */}
      <GrocerySchedule data={scheduleData} />

      {/* All Stores Section */}
      {stores.length > 0 ? (
        <AllStores title="All Stores" stores={stores} storeType="grocery" showSeeAll={false} />
      ) : (
        <div className="py-10 text-center">
          <p className="text-lg text-gray-500">No stores match your filters</p>
        </div>
      )}

      {/* Pricing and Fees Link */}
      <div className="mt-4 text-sm text-gray-600">
        <a href="#" className="hover:underline">
          Pricing and Fees
        </a>
      </div>

      {/* Grocery Favorites Section */}
      {favoriteStores.length > 0 && (
        <StoreGrid title="Grocery Favorites" stores={favoriteStores} variant="favorites" storeType="grocery" />
      )}

      {/* Fastest Near You Section */}
      {fastestStores.length > 0 && (
        <StoreGrid title="Fastest Near You" stores={fastestStores} variant="fastest" storeType="grocery" />
      )}

      {/* Product Carousels */}
      {productCarousels.length > 0 ? (
        productCarousels.map((carousel, index: number) => {
          // Map carousel titles to correct store IDs
          let storeId = `${index}`; // fallback
          if (carousel.title === "Snacks & Drinks from Target") {
            storeId = "7"; // Target store ID
          } else if (carousel.title === "Market Favorites") {
            storeId = "4"; // DoorDash Market store ID
          } else if (carousel.storeName === "Target") {
            storeId = "7";
          } else if (carousel.storeName === "DoorDash Market") {
            storeId = "4";
          } else if (carousel.storeName === "Safeway") {
            storeId = "2";
          } else if (carousel.storeName === "DashMart") {
            storeId = "3";
          } else if (carousel.storeName === "Sprouts Farmers Market") {
            storeId = "1";
          }
          
          return (
            <ProductDisplay
              key={`carousel-${index}`}
              title={carousel.title}
              storeName={carousel.storeName}
              storeImage={carousel.storeImage}
              time={carousel.time}
              products={carousel.products}
              variant="carousel"
              storeId={storeId}
              category="grocery"
            />
          );
        })
      ) : (
        // Show message only if price filter is active and no products match
        (activeFilters.minPrice != null || activeFilters.maxPrice != null) && (
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
        )
      )}


    </div>
  )
}
