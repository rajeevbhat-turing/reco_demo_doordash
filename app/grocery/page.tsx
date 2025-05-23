"use client"

import { useState, useRef, useEffect } from "react"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import GrocerySchedule from "@/components/grocery-schedule"
import StoreGrid from "@/components/store/store-grid"
import LocalGrocers from "@/components/local-grocers"
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
import AllStores from "@/components/all-stores";

export default function Grocery() {
  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    schedule: false,
    scheduledTime: null,
    deals: false,
    pickup: false,
    overRating: null,
    price: null,
    dashPass: false,
  });
  
  const filterOptionsRef = useRef<FilterOptionsRef>(null);
  
  // Get the data from our retail response mapper
  const filterOptions = getFilterOptions()
  const allStores = getAllStores()
  const scheduleData = getGroceryScheduleData()
  const essentialsData = getGroceryEssentialsData()
  const allFavoriteStores = getGroceryFavorites()
  const allFastestStores = getFastestNearYou()
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
        const rating = parseFloat(store.rating);
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
  
  // Filter product carousels (keep the carousel if any products match)
  const productCarousels = allProductCarousels.map(carousel => {
    // Apply price filter to products if needed
    if (activeFilters.price && activeFilters.price.length > 0) {
      const priceRanges = {
        '$': [0, 10],
        '$$': [10, 25],
        '$$$': [25, 45],
        '$$$$': [45, 999]
      };
      
      // Only keep products in the selected price ranges
      const filteredProducts = carousel.products.filter(product => {
        const price = parseFloat(typeof product.price === 'string' ? 
          product.price.replace('$', '') : product.price.toString());
        
        return activeFilters.price!.some(range => {
          const [min, max] = priceRanges[range as keyof typeof priceRanges];
          return price >= min && price <= max;
        });
      });
      
      return {
        ...carousel,
        products: filteredProducts
      };
    }
    
    return carousel;
  }).filter(carousel => carousel.products.length > 0); // Only keep carousels with products

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
      />

      {/* Promotional Banners */}
      <GrocerySchedule data={scheduleData} />

      {/* All Stores Section */}
      {stores.length > 0 ? (
        <AllStores title="All Stores" stores={stores} />
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
        <StoreGrid title="Grocery Favorites" stores={favoriteStores} variant="favorites" />
      )}

      {/* Fastest Near You Section */}
      {fastestStores.length > 0 && (
        <StoreGrid title="Fastest Near You" stores={fastestStores} variant="fastest" />
      )}

      {/* Product Carousels */}
      {productCarousels.length > 0 ? (
        productCarousels.map((carousel, index) => (
          <ProductDisplay
            key={`carousel-${index}`}
            title={carousel.title}
            storeName={carousel.storeName}
            storeImage={carousel.storeImage}
            time={carousel.time}
            products={carousel.products}
            variant="carousel"
            storeId={(carousel.id || index).toString()}
          />
        ))
      ) : (
        activeFilters.price && activeFilters.price.length > 0 && (
          <div className="py-10 text-center">
            <p className="text-lg text-gray-500">No products match your price filter</p>
          </div>
        )
      )}

      {/* Local Grocers Section */}
      <LocalGrocers />
    </div>
    </CartProvider>
  )
}
