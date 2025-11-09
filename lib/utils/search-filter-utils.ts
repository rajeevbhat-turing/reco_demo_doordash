import type { FilterState } from "@/components/filter-options"
import { getDefaultRating } from "@/utils/rating-utils"
import { restaurantHasItemsInPriceRange, extractPrice } from "@/utils/price-filter-utils"
import type { SearchResultRestaurant } from "./search-utils"

/**
 * Apply all filters to search results
 */
export function applySearchFilters(
  results: SearchResultRestaurant[],
  filters: FilterState
): SearchResultRestaurant[] {
  let filteredResults = results;
  
  console.log(`[SEARCH] Original results: ${results.length}`);
  console.log(`[SEARCH] Active filters:`, filters);
  
  // Filter by under 30 min
  if (filters.underThirtyMins) {
    filteredResults = filteredResults.filter(restaurant => {
      const timeString = restaurant.time || "";
      // Handle different time formats: "18 min", "Express 56 min", "Fast 33 min"
      const timeMatch = timeString.match(/(\d+)\s*min/);
      const minutes = timeMatch ? parseInt(timeMatch[1]) : 100;
      const isUnder30 = minutes < 30;
      console.log(`[SEARCH] ${restaurant.name}: ${timeString} (${minutes} min) - Under 30: ${isUnder30}`);
      return isUnder30;
    });
    console.log(`[SEARCH] After under 30 min filter: ${filteredResults.length} results`);
  }
  
  // Filter by rating
  if (filters.overRating && filters.overRating > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      if (!restaurant.rating) return false;
      const rating = getDefaultRating(restaurant.rating);
      const meetsRating = rating >= filters.overRating!;
      console.log(`[SEARCH] ${restaurant.name}: rating ${rating} >= ${filters.overRating}: ${meetsRating}`);
      return meetsRating;
    });
    console.log(`[SEARCH] After rating filter: ${filteredResults.length} results`);
  }
  
  // Filter by DashPass
  if (filters.dashPass) {
    filteredResults = filteredResults.filter(restaurant => {
      const hasDashPass = restaurant.dashPass;
      console.log(`[SEARCH] ${restaurant.name}: DashPass: ${hasDashPass}`);
      return hasDashPass;
    });
    console.log(`[SEARCH] After DashPass filter: ${filteredResults.length} results`);
  }
  
  // Filter by price (old priceRange filter - DEPRECATED but kept for backward compatibility)
  if (filters.price && filters.price.length > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      const restaurantPrice = restaurant.priceRange;
      const isInSelectedPriceRange = filters.price!.includes(restaurantPrice);
      console.log(`[SEARCH] ${restaurant.name}: price ${restaurantPrice} in selected ranges ${filters.price}: ${isInSelectedPriceRange}`);
      return isInSelectedPriceRange;
    });
    console.log(`[SEARCH] After price filter: ${filteredResults.length} results`);
  }

  // Filter by min/max price (new implementation)
  if (filters.minPrice != null || filters.maxPrice != null) {
    filteredResults = filteredResults.filter(result => {
      const minPrice = filters.minPrice != null ? filters.minPrice : null
      const maxPrice = filters.maxPrice != null ? filters.maxPrice : null
      
      // Check if it's a product (pet-product, convenience-product, retail-product, grocery-product)
      // Products have IDs like "pet-product-123", "convenience-product-456", etc.
      const isProduct = result.id.includes("-product-")
      
      if (isProduct) {
        // It's a product - extract price from priceRange and filter
        // For products, priceRange contains the actual product price (stored as number or string)
        const productPrice = extractPrice(result.priceRange || 0)
        
        console.log(`[SEARCH] Product ${result.name}: price ${productPrice}, min ${minPrice}, max ${maxPrice}`)
        
        // Check if price is within range
        if (minPrice !== null && maxPrice !== null) {
          const inRange = productPrice >= minPrice && productPrice <= maxPrice
          console.log(`[SEARCH] Product ${result.name}: ${inRange ? 'IN' : 'OUT'} of range`)
          return inRange
        } else if (minPrice !== null) {
          return productPrice >= minPrice
        } else if (maxPrice !== null) {
          return productPrice <= maxPrice
        }
        
        return true
      }
      
      // Check if it's a restaurant (restaurant match type, or menu-item but not a product)
      // Products are already handled above, so menu-item here refers to restaurant menu items
      const isRestaurant = !result.storeType || 
                          result.matchType === "restaurant" || 
                          (result.matchType === "menu-item" && !isProduct)
      
      if (isRestaurant) {
        // It's a restaurant - check if it has menu items within price range
        return restaurantHasItemsInPriceRange(result.id, minPrice, maxPrice)
      }
      
      // It's a store (grocery, pets, retail, convenience) without specific products
      // For stores, we don't have product data in search results, so pass through
      // Note: Individual products are already filtered above
      return true
    });
    console.log(`[SEARCH] After min/max price filter: ${filteredResults.length} results`);
  }
  
  // Filter by deals
  if (filters.deals) {
    filteredResults = filteredResults.filter(restaurant => {
      const hasDeals = restaurant.discount && restaurant.discount.length > 0;
      console.log(`[SEARCH] ${restaurant.name}: deals ${restaurant.discount} - Has deals: ${hasDeals}`);
      return hasDeals;
    });
    console.log(`[SEARCH] After deals filter: ${filteredResults.length} results`);
  }

  // Filter by location (distance)
  if (filters.location) {
    filteredResults = filteredResults.filter(restaurant => {
      const distanceStr = restaurant.distance || "";
      
      // Parse distance: "700 ft" -> 700/5280 = 0.13 mi, "2.5 mi" -> 2.5 mi
      const ftMatch = distanceStr.match(/(\d+)\s*ft/);
      const miMatch = distanceStr.match(/(\d+\.?\d*)\s*mi/);
      
      let distanceInMiles = 999; // Default to far away
      if (ftMatch) {
        distanceInMiles = parseFloat(ftMatch[1]) / 5280; // Convert feet to miles
      } else if (miMatch) {
        distanceInMiles = parseFloat(miMatch[1]);
      }

      let meetsLocation = false;
      const maxDistance = filters.location === "under-1mi" ? 1 
                        : filters.location === "under-3mi" ? 3 
                        : filters.location === "under-5mi" ? 5 
                        : 999;
      
      meetsLocation = distanceInMiles <= maxDistance;
      
      console.log(`[SEARCH] ${restaurant.name}: distance ${distanceStr} (${distanceInMiles.toFixed(2)} mi) <= ${maxDistance} mi: ${meetsLocation}`);
      return meetsLocation;
    });
    console.log(`[SEARCH] After location filter: ${filteredResults.length} results`);
  }

  // Filter by cuisine
  if (filters.cuisine && filters.cuisine.length > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      const matchesCuisine = filters.cuisine!.includes(restaurant.cuisine);
      console.log(`[SEARCH] ${restaurant.name}: cuisine ${restaurant.cuisine} in selected: ${matchesCuisine}`);
      return matchesCuisine;
    });
    console.log(`[SEARCH] After cuisine filter: ${filteredResults.length} results`);
  }

  // Filter by dietary preferences
  if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      // Check if restaurant has dietaryPreferences field and matches any selected preference
      const restaurantDietary = (restaurant as any).dietaryPreferences || [];
      const matchesDietary = filters.dietaryPreferences!.some(pref =>
        restaurantDietary.includes(pref)
      );
      console.log(`[SEARCH] ${restaurant.name}: dietary ${JSON.stringify(restaurantDietary)} matches selected: ${matchesDietary}`);
      return matchesDietary;
    });
    console.log(`[SEARCH] After dietary preferences filter: ${filteredResults.length} results`);
  }

  console.log(`[SEARCH] Final filtered results: ${filteredResults.length}`);
  console.log('[SEARCH] Results details:', filteredResults.map(r => r.name));
  
  return filteredResults
}

/**
 * Determine search context based on results to hide irrelevant filters
 */
export function determineSearchContext(results: SearchResultRestaurant[]): { hideCuisine: boolean; hideDietary: boolean } {
  if (results.length === 0) {
    return { hideCuisine: false, hideDietary: false }
  }
  
  let petsCount = 0
  let groceryCount = 0
  let retailCount = 0
  let restaurantCount = 0
  let convenienceCount = 0
  
  results.forEach(result => {
    const storeType = result.storeType
    const matchType = result.matchType
    
    // Count by store type
    if (storeType === "pets" || storeType === "pet-product") {
      petsCount++
    } else if (storeType === "grocery") {
      groceryCount++
    } else if (storeType === "retail") {
      retailCount++
    } else if (storeType === "convenience") {
      convenienceCount++
    } else if (matchType === "restaurant" || matchType === "menu-item" || !storeType) {
      restaurantCount++
    }
  })
  
  const total = results.length
  const petsRatio = petsCount / total
  const groceryRatio = groceryCount / total
  const retailRatio = retailCount / total
  
  // If more than 50% are pets → hide Cuisine & Dietary
  // If more than 50% are grocery → hide Cuisine only
  // If more than 50% are retail → hide Cuisine & Dietary
  
  let hideCuisine = false
  let hideDietary = false
  
  if (petsRatio > 0.5) {
    hideCuisine = true
    hideDietary = true
  } else if (groceryRatio > 0.5) {
    hideCuisine = true
    hideDietary = false
  } else if (retailRatio > 0.5) {
    hideCuisine = true
    hideDietary = true
  }
  
  console.log(`[SEARCH] Context detection (from original results):`, {
    pets: petsCount,
    grocery: groceryCount,
    retail: retailCount,
    restaurants: restaurantCount,
    convenience: convenienceCount,
    hideCuisine,
    hideDietary
  })
  
  return { hideCuisine, hideDietary }
}

/**
 * Detect available categories from search results
 */
export function detectAvailableCategories(results: SearchResultRestaurant[]): string[] {
  const categories: string[] = ["All"] // "All" is always available
  
  let hasRestaurants = false
  let hasGrocery = false
  let hasPets = false
  let hasRetail = false
  let hasConvenience = false
  
  results.forEach(result => {
    const isProduct = result.id.includes("-product-")
    const storeType = result.storeType
    const matchType = result.matchType
    
    // Check for restaurants
    if (!hasRestaurants && (
      matchType === "restaurant" || 
      (matchType === "menu-item" && !isProduct) ||
      (!storeType && !isProduct)
    )) {
      hasRestaurants = true
    }
    
    // Check for grocery
    if (!hasGrocery && storeType === "grocery") {
      hasGrocery = true
    }
    
    // Check for pets
    if (!hasPets && (storeType === "pets" || storeType === "pet-product")) {
      hasPets = true
    }
    
    // Check for retail
    if (!hasRetail && storeType === "retail") {
      hasRetail = true
    }
    
    // Check for convenience
    if (!hasConvenience && storeType === "convenience") {
      hasConvenience = true
    }
  })
  
  if (hasRestaurants) categories.push("Restaurants")
  if (hasGrocery) categories.push("Grocery")
  if (hasPets) categories.push("Pet stores")
  if (hasRetail) categories.push("Retail")
  if (hasConvenience) categories.push("Convenience")
  
  return categories
}

/**
 * Filter results by selected category
 */
export function filterByCategory(
  results: SearchResultRestaurant[],
  category: string
): SearchResultRestaurant[] {
  if (category === "All") {
    return results
  }
  
  return results.filter(result => {
    const isProduct = result.id.includes("-product-")
    const storeType = result.storeType
    const matchType = result.matchType
    
    switch (category) {
      case "Restaurants":
        // Include restaurants that match the search query:
        // 1. Restaurants with query in their name (matchType === "restaurant")
        // 2. Restaurants with query in their menu items (matchType === "menu-item" && !isProduct)
        // 3. Regular restaurants without storeType (not stores like grocery, pets, etc.)
        const isRestaurantByName = matchType === "restaurant" && !isProduct
        const isRestaurantByMenu = matchType === "menu-item" && !isProduct
        const isRegularRestaurant = !storeType && !isProduct && matchType !== "grocery" && matchType !== "pets" && matchType !== "convenience" && matchType !== "retail"
        
        return isRestaurantByName || isRestaurantByMenu || isRegularRestaurant
      
      case "Grocery":
        return storeType === "grocery"
      
      case "Pet stores":
        return storeType === "pets" || storeType === "pet-product"
      
      case "Retail":
        return storeType === "retail"
      
      case "Convenience":
        return storeType === "convenience"
      
      default:
        return true
    }
  })
}

