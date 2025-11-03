"use client"

import { useState, useEffect, useRef } from "react"
import FilterOptions, { FilterOptionsRef, FilterState } from "@/components/filter-options"
import GrocerySchedule from "@/components/grocery-schedule"
import StoreGrid from "@/components/store/store-grid"
import LocalGrocers from "@/components/local-grocers"
import ProductDisplay from "@/components/product/product-display"
import { useCartStore } from "@/store/cart-store"
import { convenienceStores } from "@/data/convenience-store-data"
import {
  getFilterOptions,
  getConvenienceScheduleData,
  getProductCarouselData,
} from "./data/convenience-response-mapper"
import AllStores from "@/components/all-stores"
import { getDefaultRating } from "@/utils/rating-utils"
import { extractPrice } from "@/utils/price-filter-utils"

export default function Convenience() {
  // Filter state using the correct FilterState interface
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
  
  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidImage = (imageUrl: string | undefined): boolean => {
    if (!imageUrl || imageUrl.trim() === '') return false;
    if (imageUrl.includes('placeholder.svg')) return false;
    if (imageUrl.includes('placeholder.png')) return false;
    return true;
  };
  
  // Get all convenience stores and convert to the format expected by the UI
  const allConvenienceStores = Object.values(convenienceStores)
    .filter(store => store.name && store.id) // Filter out empty entries
    .map(store => ({
      id: store.id,
      name: store.name,
      time: store.deliveryTime.includes('min') ? store.deliveryTime : `${store.deliveryTime}`,
      delivery: "$0 delivery fee",
      open: store.open ?? true,
      openTime: store.openTime || store.deliveryTime,
      image: store.logo || "/placeholder-logo.svg",
      inStorePrice: true,
      discount: store.discount || "",
      rating: store.rating,
      numRatings: store.reviewCount?.toLocaleString() || "",
      isSnap: store.isSnap || false,
      isDashPass: store.isDashPass,
      distance: store.distance || "",
      priceLevel: store.priceLevel || "$",
    }))
  
  // Get other data
  const filterOptions = getFilterOptions()
  const scheduleData = getConvenienceScheduleData()
  const allProductCarousels = getProductCarouselData()
  
  // Filter products in product carousels based on price filter
  const productCarousels = allProductCarousels.map(carousel => {
    let filteredProducts = carousel.products || []
    
    // Apply price filter to products if min/max price is set
    if (activeFilters.minPrice !== null && activeFilters.minPrice !== undefined || 
        activeFilters.maxPrice !== null && activeFilters.maxPrice !== undefined) {
      filteredProducts = (carousel.products || []).filter(product => {
        const productPrice = extractPrice(product.price)
        const minPrice = activeFilters.minPrice ?? null
        const maxPrice = activeFilters.maxPrice ?? null
        
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
  
  // Filter stores based on active filters
  const filteredStores = allConvenienceStores.filter(store => {
    // Time filter (under 30 min)
    if (activeFilters.underThirtyMins) {
      const timeMatch = store.time.match(/(\d+)\s*min/)
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        if (minutes >= 30) return false
      }
    }
    
    // Rating filter
    if (activeFilters.overRating && store.rating) {
      const rating = getDefaultRating(store.rating)
      if (rating < activeFilters.overRating) return false
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

    // Filter by cuisine (convenience stores don't have cuisine, so skip this)
    if (activeFilters.cuisine && activeFilters.cuisine.length > 0) {
      // Convenience stores don't have cuisine, so skip this filter
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
    if (activeFilters.minPrice !== null && activeFilters.minPrice !== undefined || activeFilters.maxPrice !== null && activeFilters.maxPrice !== undefined) {
      // TODO: Implement product-based price filtering for convenience stores
      // For now, return true (don't filter) until product data is available
      // This ensures the filter UI works but doesn't break functionality
    }

    return true
  })
  
  // Get featured stores (exclude 7-Eleven and Walgreens, add other stores)
  const favoriteStores = allConvenienceStores
    .filter(store => {
      // Exclude 7-Eleven and Walgreens
      if (store.id === "1" || store.id === "2") {
        return false;
      }
      // Include specific stores we want to feature and filter by valid images
      return ["cvs", "dashmart", "speedway", "extramile"].includes(store.id) && hasValidImage(store.image);
    })
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating, // Keep original rating value
      numRatings: store.numRatings || "1,200+", // Default rating count
      distance: store.distance || "0.5 mi", // Default distance
      time: store.time,
      image: store.image,
    }));
  
  // Get fastest stores (delivery time under 25 min)
  const fastestStores = allConvenienceStores
    .filter(store => {
      const timeMatch = store.time.match(/(\d+)\s*min/)
      return timeMatch && parseInt(timeMatch[1]) <= 25 && hasValidImage(store.image)
    })
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating, // Keep original rating value
      numRatings: store.numRatings,
      distance: store.distance,
      time: store.time,
      image: store.image,
    }))
  
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
  
  // Set category explicitly
  useEffect(() => {
    const cartStore = useCartStore.getState()
    cartStore.setCategory("convenience")
  }, [])
  
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
        />

        {/* Promotional Banners */}
        <GrocerySchedule data={scheduleData} promos={scheduleData.promos} />

        {/* All Stores Section */}
        {filteredStores.length > 0 ? (
          <AllStores title="All Stores" stores={filteredStores} storeType="convenience" showSeeAll={false} />
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

        {/* Convenience Favorites Section */}
        {favoriteStores.length > 0 && (
          <StoreGrid title="Convenience Favorites" stores={favoriteStores} variant="favorites" storeType="convenience" />
        )}

        {/* Fastest Near You Section */}
        {fastestStores.length > 0 && (
          <StoreGrid title="Fastest Near You" stores={fastestStores} variant="fastest" storeType="convenience" />
        )}

        {/* Product Carousels */}
        {productCarousels.length > 0 && (
          productCarousels.map((carousel, index: number) => {
            // Map carousel titles to correct store IDs
            let storeId = `${index + 1}`; // fallback
            if (carousel.title === "Snacks & Drinks from CVS") {
              storeId = "cvs"; // CVS store ID
            } else if (carousel.title === "Household Essentials from DashMart") {
              storeId = "dashmart"; // DashMart store ID
            } else if (carousel.storeName === "CVS") {
              storeId = "cvs";
            } else if (carousel.storeName === "DashMart") {
              storeId = "dashmart";
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
                category="convenience"
              />
            )
          })
        )}



      </div>
  )
} 