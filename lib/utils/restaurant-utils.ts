import type { Restaurant } from "@/constants/restaurants"

/**
 * Get a restaurant by ID from an array of restaurants
 * @param restaurants - Array of restaurants to search
 * @param id - The restaurant ID to find
 * @returns The restaurant object or undefined if not found
 */
export function getRestaurantById(restaurants: Restaurant[] | undefined, id: string): Restaurant | undefined {
  if (!restaurants) return undefined;
  return restaurants.find(restaurant => restaurant.id === id);
} 