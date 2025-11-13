import { restaurants } from "@/constants/restaurants"
import { menuItems } from "@/constants/menu-items"
import { filterRestaurantsWithMenuItems } from "@/utils/restaurant-utils"
import type { Restaurant } from "@/constants/restaurants"

export interface SearchResultRestaurant extends Restaurant {
  matchType: "restaurant" | "menu-item"
  matchedItems?: string[]
}

/**
 * Clean query by removing special characters, keeping only alphanumeric and spaces
 */
export function cleanQuery(query: string): string {
  return query.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

/**
 * Check if query contains only special characters
 */
export function isOnlySpecialCharacters(query: string): boolean {
  const cleaned = cleanQuery(query);
  return cleaned.length === 0 && query.trim().length > 0;
}

/**
 * Search for restaurants that serve specific menu items
 */
export function searchByMenuItem(searchTerm: string): SearchResultRestaurant[] {
  const lowerSearchTerm = searchTerm.toLowerCase()
  const matchingItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
      item.category.toLowerCase().includes(lowerSearchTerm),
  )

  const restaurantMatches = new Map<string, { restaurant: Restaurant; items: string[] }>()

  // Only consider restaurants that have menu items
  const restaurantsWithMenus = filterRestaurantsWithMenuItems(restaurants);
  
  matchingItems.forEach((item) => {
    const restaurant = restaurantsWithMenus.find((r) => r.id === item.restaurantId)
    if (restaurant) {
      if (!restaurantMatches.has(restaurant.id)) {
        restaurantMatches.set(restaurant.id, { restaurant, items: [] })
      }
      restaurantMatches.get(restaurant.id)!.items.push(item.name)
    }
  })

  return Array.from(restaurantMatches.values()).map(({ restaurant, items }) => ({
    ...restaurant,
    matchType: "menu-item" as const,
    matchedItems: items,
  }))
}

/**
 * Perform complete search across all data sources
 */
export function performSearch(query: string): SearchResultRestaurant[] {
  // Handle special characters: if query contains only special characters, return empty
  if (isOnlySpecialCharacters(query)) {
    return []
  }
  
  // Clean the query to remove special characters while keeping alphanumeric and spaces
  const cleanedQuery = cleanQuery(query);
  const queryLower = cleanedQuery.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const firstWord = queryWords.length > 0 ? queryWords[0] : queryLower;
  
  // Early return for empty or numeric-only queries
  if (queryLower.length === 0 || /^\d+$/.test(queryLower)) {
    return []
  }
  
  // First, try exact match with full query
  let restaurantResults = filterRestaurantsWithMenuItems(restaurants)
    .filter((restaurant) => {
      // Check if name or cuisine contains the full query
      const nameMatch = restaurant.name.toLowerCase().includes(queryLower);
      const cuisineMatch = restaurant.cuisine.toLowerCase().includes(queryLower);
      
      // For categories, use more precise matching - check if any category contains the query
      // For dessert specifically, we want exact matches or word boundaries
      const categoryMatch = restaurant.categories && restaurant.categories.some(category => {
        const categoryLower = category.toLowerCase();
        // For dessert search, be more precise
        if (queryLower === 'dessert') {
          return categoryLower === 'desserts' || categoryLower === 'dessert';
        }
        return categoryLower.includes(queryLower);
      });
      
      // For dessert search, only return restaurants that actually have dessert categories
      if (queryLower === 'dessert') {
        return categoryMatch; // Only return if it has dessert category
      }
      
      return nameMatch || cuisineMatch || categoryMatch;
    })
    .map((restaurant) => ({
      ...restaurant,
      matchType: "restaurant" as const,
    }));
  
  // If query has multiple words, also search by first word
  // This handles cases like "Burger King" -> also search for "burger" in restaurant names
  // Only do this if we have multiple words and first word is meaningful (length > 2)
  if (queryWords.length > 1 && firstWord.length > 2) {
    const firstWordResults = filterRestaurantsWithMenuItems(restaurants)
      .filter((restaurant) => {
        // Check if name contains the first word
        const nameMatch = restaurant.name.toLowerCase().includes(firstWord);
        const cuisineMatch = restaurant.cuisine.toLowerCase().includes(firstWord);
        
        // For categories, check if any category contains the first word
        const categoryMatch = restaurant.categories && restaurant.categories.some(category => {
          return category.toLowerCase().includes(firstWord);
        });
        
        return nameMatch || cuisineMatch || categoryMatch;
      })
      .map((restaurant) => ({
        ...restaurant,
        matchType: "restaurant" as const,
      }));
    
    // Combine results, avoiding duplicates
    const existingIds = new Set(restaurantResults.map(r => r.id));
    const newResults = firstWordResults.filter(r => !existingIds.has(r.id));
    restaurantResults = [...restaurantResults, ...newResults];
  }

  // Search restaurants by menu items - try full query first, then first word if query has multiple words
  // Use cleaned query instead of original query
  let menuItemResults = searchByMenuItem(cleanedQuery);
  
  // If query has multiple words, also search by first word in menu items
  // This handles cases like "Burger King" -> also search for "burger" in menu items
  // Only do this if we have multiple words and first word is meaningful (length > 2)
  if (queryWords.length > 1 && firstWord.length > 2) {
    const firstWordMenuResults = searchByMenuItem(firstWord);
    
    // Combine results, avoiding duplicates
    const existingIds = new Set(menuItemResults.map(r => r.id));
    const newResults = firstWordMenuResults.filter(r => !existingIds.has(r.id));
    menuItemResults = [...menuItemResults, ...newResults];
  }

  // Combine results, removing duplicates (prioritize restaurant matches)
  const combinedResults: SearchResultRestaurant[] = []
  const addedRestaurantIds = new Set<string>()

  // Add restaurant matches first
  restaurantResults.forEach((restaurant) => {
    if (!addedRestaurantIds.has(restaurant.id)) {
      combinedResults.push(restaurant)
      addedRestaurantIds.add(restaurant.id)
    }
  })

  // Add menu item matches that aren't already included
  menuItemResults.forEach((restaurant) => {
    if (!addedRestaurantIds.has(restaurant.id)) {
      combinedResults.push(restaurant)
      addedRestaurantIds.add(restaurant.id)
    }
  })

  return combinedResults
}
