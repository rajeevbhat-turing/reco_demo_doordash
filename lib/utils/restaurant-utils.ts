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

/**
 * Calculate estimated delivery time based on distance
 * Formula: base time + (distance * time per mile)
 */
export function calculateDeliveryTime(distance: number): string {
  const baseTime = 15; // Base prep time in minutes
  const timePerMile = 3; // Minutes per mile
  
  const minTime = Math.round(baseTime + (distance * timePerMile));
  const maxTime = Math.round(minTime + 10); // Add 10 min buffer
  
  return `${minTime}-${maxTime} min`;
}

/**
 * Check if restaurant is currently open
 */
export function checkIfOpen(openingHour: number, closingHour: number, currentHour: number): boolean {
  if (closingHour < openingHour) {
    // Handles cases like 10 PM - 2 AM (22 - 2)
    return currentHour >= openingHour || currentHour < closingHour;
  }
  return currentHour >= openingHour && currentHour < closingHour;
}

/**
 * Format opening hours for display
 */
export function formatHours(openingHour: number, closingHour: number): string {
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };
  
  return `${formatHour(openingHour)} - ${formatHour(closingHour)}`;
} 