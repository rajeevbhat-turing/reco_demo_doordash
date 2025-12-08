import type { FilterState } from '@/components/filter-options';
import { getDefaultRating } from './rating-utils';
import { restaurantHasItemsInPriceRange } from './price-filter-utils';
import type { SearchResultRestaurant } from './search-utils';
import { parseDistance, calculateDeliveryTime } from './restaurant-utils';

/**
 * Apply all filters to search results
 * @param results - Search results to filter
 * @param filters - Filter state
 * @param restaurantMenuItems - Optional map of restaurant ID to menu items for price filtering
 */
export function applySearchFilters(
  results: SearchResultRestaurant[],
  filters: FilterState,
  restaurantMenuItems?: Map<string, Array<{ price: string | number }>>
): SearchResultRestaurant[] {
  let filteredResults = results;

  console.log(`[SEARCH] Original results: ${results.length}`);
  console.log(`[SEARCH] Active filters:`, filters);

  // Filter by under 30 min
  if (filters.underThirtyMins) {
    filteredResults = filteredResults.filter(restaurant => {
      // Use the same delivery time calculation as checkout to ensure consistency
      const distance = parseDistance(restaurant.distance);
      const deliveryTimeStr = calculateDeliveryTime(distance, 'standard');
      
      // Extract max time from "min-max min" format
      const maxTimeMatch = deliveryTimeStr.match(/-(\d+)\s*min/);
      const maxMinutes = maxTimeMatch ? parseInt(maxTimeMatch[1]) : 100;
      const isUnder30 = maxMinutes <= 30;
      
      console.log(
        `[SEARCH] ${restaurant.name}: calculated delivery ${deliveryTimeStr} (max ${maxMinutes} min) - Under 30: ${isUnder30}`
      );
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
      console.log(
        `[SEARCH] ${restaurant.name}: rating ${rating} >= ${filters.overRating}: ${meetsRating}`
      );
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

  // Filter by price (old priceRange filter)
  if (filters.price && filters.price.length > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      const restaurantPrice = restaurant.priceRange;
      const isInSelectedPriceRange = filters.price!.includes(restaurantPrice);
      console.log(
        `[SEARCH] ${restaurant.name}: price ${restaurantPrice} in selected ranges ${filters.price}: ${isInSelectedPriceRange}`
      );
      return isInSelectedPriceRange;
    });
    console.log(`[SEARCH] After price filter: ${filteredResults.length} results`);
  }

  // Filter by min/max price (new implementation)
  if ((filters.minPrice != null || filters.maxPrice != null) && restaurantMenuItems) {
    filteredResults = filteredResults.filter(result => {
      const minPrice = filters.minPrice != null ? filters.minPrice : null;
      const maxPrice = filters.maxPrice != null ? filters.maxPrice : null;

      // Get menu items for this restaurant
      const menuItems = restaurantMenuItems.get(result.id) || [];

      // Check if restaurant has menu items within price range
      return restaurantHasItemsInPriceRange(result.id, minPrice, maxPrice, menuItems);
    });
    console.log(`[SEARCH] After min/max price filter: ${filteredResults.length} results`);
  }

  // Filter by deals
  if (filters.deals) {
    filteredResults = filteredResults.filter(restaurant => {
      const hasDeals = restaurant.discount && restaurant.discount.length > 0;
      console.log(
        `[SEARCH] ${restaurant.name}: deals ${restaurant.discount} - Has deals: ${hasDeals}`
      );
      return hasDeals;
    });
    console.log(`[SEARCH] After deals filter: ${filteredResults.length} results`);
  }

  // Filter by location (distance)
  if (filters.location) {
    filteredResults = filteredResults.filter(restaurant => {
      const distanceStr = restaurant.distance || '';

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
      const maxDistance =
        filters.location === 'under-1mi'
          ? 1
          : filters.location === 'under-3mi'
            ? 3
            : filters.location === 'under-5mi'
              ? 5
              : 999;

      meetsLocation = distanceInMiles <= maxDistance;

      console.log(
        `[SEARCH] ${restaurant.name}: distance ${distanceStr} (${distanceInMiles.toFixed(2)} mi) <= ${maxDistance} mi: ${meetsLocation}`
      );
      return meetsLocation;
    });
    console.log(`[SEARCH] After location filter: ${filteredResults.length} results`);
  }

  // Filter by cuisine
  if (filters.cuisine && filters.cuisine.length > 0) {
    filteredResults = filteredResults.filter(restaurant => {
      const matchesCuisine = filters.cuisine!.includes(restaurant.cuisine);
      console.log(
        `[SEARCH] ${restaurant.name}: cuisine ${restaurant.cuisine} in selected: ${matchesCuisine}`
      );
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
      console.log(
        `[SEARCH] ${restaurant.name}: dietary ${JSON.stringify(restaurantDietary)} matches selected: ${matchesDietary}`
      );
      return matchesDietary;
    });
    console.log(`[SEARCH] After dietary preferences filter: ${filteredResults.length} results`);
  }

  console.log(`[SEARCH] Final filtered results: ${filteredResults.length}`);
  console.log(
    '[SEARCH] Results details:',
    filteredResults.map(r => r.name)
  );

  return filteredResults;
}

/**
 * Determine search context based on results to hide irrelevant filters
 */
export function determineSearchContext(_results: SearchResultRestaurant[]): {
  hideCuisine: boolean;
  hideDietary: boolean;
} {
  // For restaurants only, we never hide cuisine or dietary filters
  return { hideCuisine: false, hideDietary: false };
}

/**
 * Detect available categories from search results
 */
export function detectAvailableCategories(results: SearchResultRestaurant[]): string[] {
  const categories: string[] = ['All']; // "All" is always available

  if (results.length > 0) {
    categories.push('Restaurants');
  }

  return categories;
}

/**
 * Filter results by selected category
 */
export function filterByCategory(
  results: SearchResultRestaurant[],
  _category: string
): SearchResultRestaurant[] {
  // Since we only have restaurants now, just return all results
  return results;
}
