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
 * @param distance - Distance in miles
 * @param deliveryType - Optional: 'express' for faster delivery, 'standard' for regular delivery (default)
 */
export function calculateDeliveryTime(distance: number, deliveryType: 'express' | 'standard' = 'standard'): string {
  // Express delivery: faster base time and less time per mile
  const baseTime = deliveryType === 'express' ? 10 : 15; // Base prep time in minutes
  const timePerMile = deliveryType === 'express' ? 2 : 3; // Minutes per mile
  const buffer = deliveryType === 'express' ? 5 : 10; // Buffer time in minutes
  
  const minTime = Math.round(baseTime + (distance * timePerMile));
  const maxTime = Math.round(minTime + buffer);
  
  return `${minTime}-${maxTime} min`;
}

/**
 * Parse distance from string format (e.g., "2.5 mi" -> 2.5)
 * @param distanceStr - Distance string like "2.5 mi" or "0.7 mi"
 * @returns Distance in miles as a number, or 0 if parsing fails
 */
export function parseDistance(distanceStr: string | undefined | null): number {
  if (!distanceStr) return 0;
  
  // Extract number from string like "2.5 mi" or "0.7 mi"
  const match = distanceStr.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

/**
 * Parse hour from either integer or ISO date string
 */
function parseHour(hourValue: number | string | null | undefined): number {
  if (hourValue === null || hourValue === undefined) {
    return 0;
  }
  
  // If it's already a number, return it
  if (typeof hourValue === 'number') {
    return hourValue;
  }
  
  // If it's a string, try to parse it
  if (typeof hourValue === 'string') {
    // Try parsing as ISO date string (e.g., "2025-11-12T08:44:00-07:30")
    try {
      const date = new Date(hourValue);
      if (!isNaN(date.getTime())) {
        // Extract hour from the parsed date (in UTC, but we want the local hour from the ISO string)
        // For ISO strings like "2025-11-12T08:44:00-07:30", we want to get the hour (08)
        // The Date object will parse this correctly, but we need to get the hour from the original timezone
        // Actually, let's extract it directly from the string if it's in ISO format
        const isoTimeMatch = hourValue.match(/T(\d{2}):/);
        if (isoTimeMatch) {
          const hour = parseInt(isoTimeMatch[1], 10);
          if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            return hour;
          }
        }
        // Fallback to Date.getHours() if regex doesn't match
        return date.getHours();
      }
    } catch (e) {
      // If parsing fails, try parsing as integer string
      const parsed = parseInt(hourValue, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  return 0;
}

/**
 * Check if restaurant is currently open
 */
export function checkIfOpen(openingHour: number | string | null | undefined, closingHour: number | string | null | undefined, currentHour: number): boolean {
  const opening = parseHour(openingHour);
  const closing = parseHour(closingHour);
  
  if (closing < opening) {
    // Handles cases like 10 PM - 2 AM (22 - 2)
    return currentHour >= opening || currentHour < closing;
  }
  return currentHour >= opening && currentHour < closing;
}

/**
 * Format opening hours for display
 */
export function formatHours(openingHour: number | string | null | undefined, closingHour: number | string | null | undefined): string {
  const opening = parseHour(openingHour);
  const closing = parseHour(closingHour);
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };
  
  return `${formatHour(opening)} - ${formatHour(closing)}`;
} 