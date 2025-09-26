import { menuItems } from "@/constants/menu-items"
import type { Restaurant } from "@/constants/restaurants"

/**
 * Check if a restaurant has any menu items
 * @param restaurantId - The restaurant ID to check
 * @returns true if restaurant has menu items, false otherwise
 */
export function hasMenuItems(restaurantId: string): boolean {
  return menuItems.some(item => item.restaurantId === restaurantId)
}

/**
 * Filter restaurants to only include those with menu items
 * @param restaurants - Array of restaurants to filter
 * @returns Array of restaurants that have menu items
 */
export function filterRestaurantsWithMenuItems(restaurants: Restaurant[]): Restaurant[] {
  return restaurants.filter(restaurant => hasMenuItems(restaurant.id))
} 