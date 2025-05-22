"use client"

import { useState, useRef } from "react"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import StoreGrid from "@/components/store/store-grid"
import ProductDisplay from "@/components/product/product-display"
import AllStores from "@/components/all-stores"
import { CartProvider } from "@/context/cart-context"
import {
  getFilterOptions,
  getAllPetStores,
  getPetUiConfig,
  getFeaturedPetStores,
  getFeaturedPetDealsStore,
  getFeaturedPetDeals,
  getPetProductSections
} from "@/app/pets/data/pet-response-mapper"

export default function Pets() {
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
  
  // Get the data from our pet response mapper
  const filterOptions = getFilterOptions();
  const allPetStores = getAllPetStores();
  const uiConfig = getPetUiConfig();
  const featuredPetStoreIds = getFeaturedPetStores();
  const productSections = getPetProductSections();
  
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
  const filteredStores = filterStores(allPetStores);
  
  // Split stores into different categories
  const featuredStores = allPetStores.filter(store => 
    featuredPetStoreIds.includes(store.id)
  );
  
  // Create a "fastest near you" category - take the first 5 stores that have delivery time < 30 min
  const fastestStores = allPetStores
    .filter(store => {
      const timeString = store.time || "";
      const minutes = parseInt(timeString.match(/\d+/)?.[0] || "100");
      return minutes < 30;
    })
    .slice(0, 5);

  return (
    <CartProvider>
      <div className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* Filter Options Bar */}
      <FilterOptions 
        ref={filterOptionsRef}
        isGrocery={false} 
        onFilterChange={handleFilterChange}
        filters={activeFilters}
        filterData={filterOptions}
      />

      {/* All Stores Section */}
      {filteredStores.length > 0 ? (
        <AllStores title={uiConfig.allStoresTitle} stores={filteredStores} />
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

      {/* Pet Stores Near You Section */}
      {featuredStores.length > 0 && (
        <StoreGrid title={uiConfig.nearbyTitle} stores={featuredStores} variant="favorites" />
      )}

      {/* Fastest Near You Section */}
      {fastestStores.length > 0 && (
        <StoreGrid title="Fastest Near You" stores={fastestStores} variant="fastest" />
      )}

      {/* Product Sections */}
      {productSections.length > 0 && productSections.map((section, index) => (
        <ProductDisplay
          key={`section-${section.id || index}`}
          title={section.title}
          storeName={section.storeName}
          storeImage={section.storeImage}
          time={section.time}
          products={section.products}
          variant="carousel"
          isSnapEligible={section.isSnapEligible}
          storeId={(section.id || index).toString()}
        />
      ))}
    </div>
    </CartProvider>
  )
}