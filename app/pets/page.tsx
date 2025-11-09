"use client"

import { useState, useEffect, useRef } from "react"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import StoreGrid from "@/components/store/store-grid"
import ProductDisplay from "@/components/product/product-display"
import AllStores from "@/components/all-stores"
import CartSidebar from "@/components/cart-sidebar"
import { useCartStore } from "@/store/cart-store"
import { useAppStore } from "@/store/app-store"
import {
  getAllPetStores,
  getPetUiConfig,
  getFeaturedPetStores,
  getPetProductSections,
} from "@/app/pets/data/pet-response-mapper"
import { allPetStores } from "@/data/pet-data"
import { getDefaultRating } from "@/utils/rating-utils"
import { extractPrice } from "@/utils/price-filter-utils"

export default function Pets() {
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
  })
  
  const filterOptionsRef = useRef<FilterOptionsRef>(null)
  
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentStoreData, setCurrentStoreData] = useState<any>(null)
  const cartStore = useCartStore();
  const { clearCurrentStore } = useAppStore()
  
  // Set the category to pets when component mounts
  useEffect(() => {
    cartStore.setCategory("pets")
    
    // Get the first pet store to use as default store data
    const allStores = getAllPetStores()
    if (allStores.length > 0) {
      setCurrentStoreData(allStores[0])
    }

    clearCurrentStore();
  }, [])
  
  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidImage = (imageUrl: string | undefined): boolean => {
    if (!imageUrl || imageUrl.trim() === '') return false;
    if (imageUrl.includes('placeholder.svg')) return false;
    if (imageUrl.includes('placeholder.png')) return false;
    return true;
  };
  
  // Get the data from our pet response mapper
  const allPetStores = getAllPetStores();
  const uiConfig = getPetUiConfig();
  const featuredPetStoreIds = getFeaturedPetStores();
  const allProductSections = getPetProductSections();
  
  // Filter products in product sections based on price filter
  const filteredProductSections = allProductSections.map(section => {
    let filteredProducts = section.products || []
    
    // Apply price filter to products if min/max price is set
    if (activeFilters.minPrice != null || activeFilters.maxPrice != null) {
      filteredProducts = (section.products || []).filter(product => {
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
      ...section,
      products: filteredProducts
    }
  }).filter(section => section.products && section.products.length > 0) // Only show sections with products after filtering
  
  const productSections = filteredProductSections
  
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
  }

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
        
        const ftMatch = distanceStr.match(/(\d+)\s*ft/);
        const miMatch = distanceStr.match(/(\d+\.?\d*)\s*mi/);
        
        let distanceInMiles = 999;
        if (ftMatch) {
          distanceInMiles = parseFloat(ftMatch[1]) / 5280;
        } else if (miMatch) {
          distanceInMiles = parseFloat(miMatch[1]);
        }

        const maxDistance = activeFilters.location === "under-1mi" ? 1 
                          : activeFilters.location === "under-3mi" ? 3 
                          : activeFilters.location === "under-5mi" ? 5 
                          : 999;
        
        if (distanceInMiles > maxDistance) return false;
      }

      // Filter by cuisine (pet stores don't have cuisine)
      if (activeFilters.cuisine && activeFilters.cuisine.length > 0) {
        // Pet stores don't have cuisine, so skip this filter
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
        // TODO: Implement product-based price filtering for pet stores
        // For now, return true (don't filter) until product data is available
        // This ensures the filter UI works but doesn't break functionality
      }
      
      return true;
    });
  };
  
  // Apply filters to stores
  const filteredStores = filterStores(allPetStores);
  
  // Filter featured stores with valid images and convert to proper format
  const featuredStores = filterStores(allPetStores)
    .filter(store => hasValidImage(store.image))
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating,
      numRatings: store.ratingCount,
      distance: store.distance,
      time: store.time,
      delivery: "$0 delivery fee",
      image: store.image,
      open: true,
      openTime: "",
      inStorePrice: true,
      discount: "",
      isSnap: false,
      isDashPass: store.isDashPass,
    }));
  
  // Filter fastest stores with valid images (delivery time under 25 min)
  const fastestStores = filterStores(allPetStores)
    .filter(store => {
      const timeString = store.time || "";
      const minutes = parseInt(timeString.match(/\d+/)?.[0] || "100");
      return minutes < 25 && hasValidImage(store.image);
    })
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating,
      numRatings: store.ratingCount,
      distance: store.distance,
      time: store.time,
      delivery: "$0 delivery fee",
      image: store.image,
      open: true,
      openTime: "",
      inStorePrice: true,
      discount: "",
      isSnap: false,
      isDashPass: store.isDashPass,
    }));

  return (
    <>
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
          hideDietaryFilter={true}
        />

        {/* All Stores Section */}
        {filteredStores.length > 0 ? (
          <AllStores 
            title={uiConfig.allStoresTitle} 
            stores={filteredStores} 
            variant="all" 
            storeType="pets"
            showSeeAll={false}
          />
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
          <StoreGrid 
            title={uiConfig.nearbyTitle} 
            stores={featuredStores} 
            variant="favorites" 
            storeType="pets"
          />
        )}

        {/* Fastest Near You Section */}
        {fastestStores.length > 0 && (
          <StoreGrid 
            title="Fastest Near You" 
            stores={fastestStores} 
            variant="fastest" 
            storeType="pets"
          />
        )}

        {/* Product Sections */}
        {productSections.length > 0 ? (
          productSections.map((section, index) => (
            <ProductDisplay
              key={`section-${section.id || index}`}
              title={section.title}
              storeName={section.storeName}
              storeImage={section.storeImage}
              time={section.time}
              products={section.products}
              variant="carousel"
              isSnapEligible={section.isSnapEligible}
              storeId={allPetStores.length > 0 ? allPetStores[0].id : (section.id || index).toString()}
              category="pets"
            />
          ))
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
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      {/* Floating Cart Button */}
      {/* {cartStore.carts.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full px-6 py-3 flex items-center shadow-lg z-40"
        >
          <span className="font-medium mr-2">View Cart • {cartStore.getTotalItems()} items</span>
          <span>{cartStore.getTotalPrice()}</span>
        </button>
      )} */}
    </>
  )
}