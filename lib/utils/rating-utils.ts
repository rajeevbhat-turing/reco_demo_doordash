/**
 * Utility function to ensure stores/restaurants always have a rating
 * Returns 4.5 as default if rating is null, undefined, or falsy
 */
export function getDefaultRating(rating: number | string | null | undefined): number {
  if (rating === null || rating === undefined || rating === "") {
    return 4.5;
  }
  
  // Handle string ratings (like "4.7" or percentages like "85%")
  if (typeof rating === 'string') {
    // If it's a percentage, convert to a 5-star scale
    if (rating.includes('%')) {
      const percentage = parseFloat(rating.replace('%', ''));
      return Math.round((percentage / 100) * 5 * 10) / 10; // Convert to 5-star scale with 1 decimal
    }
    // If it's a regular string number
    const parsed = parseFloat(rating);
    return isNaN(parsed) ? 4.5 : parsed;
  }
  
  // If it's already a number
  return typeof rating === 'number' ? rating : 4.5;
}

/**
 * Ensures an object with rating property has a valid rating
 */
export function withDefaultRating<T extends { rating?: number | string | null }>(item: T): T & { rating: number } {
  return {
    ...item,
    rating: getDefaultRating(item.rating)
  };
} 