"use client"

import { useState, useRef, useEffect } from "react"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import GrocerySchedule from "@/components/grocery-schedule"
import StoreGrid from "@/components/store/store-grid"
import ProductDisplay from "@/components/product/product-display"
import { CartProvider } from "@/context/cart-context"
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

export default function Grocery() {
  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null, // Keep this but won't be used
    dashPass: false,
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
      
      return true;
    });
  };
  
  // Apply filters to data
  const stores = filterStores(allStores);
  const favoriteStores = filterStores(allFavoriteStores);
  const fastestStores = filterStores(allFastestStores);
  
  // Use all product carousels (no price filtering)
  const productCarousels = allProductCarousels;

  // Set category explicitly
  useEffect(() => {
    const cartStore = useCartStore.getState();
    cartStore.setCategory("grocery");
  }, []);
  
  return (
    <CartProvider category="grocery">
      <div className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* Filter Options Bar */}
      <FilterOptions 
        ref={filterOptionsRef}
        isGrocery={true} 
        onFilterChange={handleFilterChange}
        filters={activeFilters}
        filterData={filterOptions}
        showPriceFilter={false}
      />

      {/* Promotional Banners */}
      <GrocerySchedule data={scheduleData} />

      {/* All Stores Section */}
      {stores.length > 0 ? (
        <AllStores title="All Stores" stores={stores} storeType="grocery" />
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
      {productCarousels.length > 0 && (
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
      )}


    </div>
    </CartProvider>
  )
}
