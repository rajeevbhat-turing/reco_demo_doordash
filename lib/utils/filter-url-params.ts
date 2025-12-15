import type { FilterState } from '@/components/filter-options';

/**
 * URL parameter names for filters
 */
export const FILTER_PARAMS = {
  CATEGORY: 'category',
  UNDER_30_MINS: 'under30',
  DEALS: 'deals',
  RATING: 'rating',
  PRICE: 'price',
  DASHPASS: 'dashpass',
  CUISINE: 'cuisine',
  DIETARY: 'dietary',
} as const;

/**
 * Default filter state - used to determine which params to include in URL
 */
const DEFAULT_FILTER_STATE: FilterState = {
  underThirtyMins: false,
  deals: false,
  overRating: null,
  price: null,
  dashPass: false,
  cuisine: null,
  dietaryPreferences: null,
};

/**
 * Parse filter state from URL search params
 */
export function parseFiltersFromUrl(searchParams: URLSearchParams): FilterState {
  const filters: FilterState = { ...DEFAULT_FILTER_STATE };

  // Parse boolean filters
  const under30 = searchParams.get(FILTER_PARAMS.UNDER_30_MINS);
  if (under30 === 'true') {
    filters.underThirtyMins = true;
  }

  const deals = searchParams.get(FILTER_PARAMS.DEALS);
  if (deals === 'true') {
    filters.deals = true;
  }

  const dashpass = searchParams.get(FILTER_PARAMS.DASHPASS);
  if (dashpass === 'true') {
    filters.dashPass = true;
  }

  // Parse rating (number)
  const rating = searchParams.get(FILTER_PARAMS.RATING);
  if (rating) {
    const ratingNum = parseInt(rating, 10);
    if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
      filters.overRating = ratingNum;
    }
  }

  // Parse price (comma-separated array)
  const price = searchParams.get(FILTER_PARAMS.PRICE);
  if (price) {
    const priceArray = price.split(',').filter(p => ['$', '$$', '$$$', '$$$$'].includes(p));
    if (priceArray.length > 0) {
      filters.price = priceArray;
    }
  }

  // Parse cuisine (comma-separated array)
  const cuisine = searchParams.get(FILTER_PARAMS.CUISINE);
  if (cuisine) {
    const cuisineArray = cuisine.split(',').map(c => decodeURIComponent(c)).filter(Boolean);
    if (cuisineArray.length > 0) {
      filters.cuisine = cuisineArray;
    }
  }

  // Parse dietary preferences (comma-separated array)
  const dietary = searchParams.get(FILTER_PARAMS.DIETARY);
  if (dietary) {
    const dietaryArray = dietary.split(',').map(d => decodeURIComponent(d)).filter(Boolean);
    if (dietaryArray.length > 0) {
      filters.dietaryPreferences = dietaryArray;
    }
  }

  return filters;
}

/**
 * Parse selected category from URL search params
 */
export function parseCategoryFromUrl(searchParams: URLSearchParams): string | null {
  const category = searchParams.get(FILTER_PARAMS.CATEGORY);
  return category ? decodeURIComponent(category) : null;
}

/**
 * Serialize filters and category to URL search params
 * Only includes non-default values for cleaner URLs
 */
export function serializeFiltersToUrl(
  filters: FilterState,
  category: string | null
): URLSearchParams {
  const params = new URLSearchParams();

  // Add category if set
  if (category) {
    params.set(FILTER_PARAMS.CATEGORY, category);
  }

  // Add boolean filters only if true
  if (filters.underThirtyMins) {
    params.set(FILTER_PARAMS.UNDER_30_MINS, 'true');
  }

  if (filters.deals) {
    params.set(FILTER_PARAMS.DEALS, 'true');
  }

  if (filters.dashPass) {
    params.set(FILTER_PARAMS.DASHPASS, 'true');
  }

  // Add rating if set
  if (filters.overRating !== null && filters.overRating > 0) {
    params.set(FILTER_PARAMS.RATING, filters.overRating.toString());
  }

  // Add price array if set
  if (filters.price && filters.price.length > 0) {
    params.set(FILTER_PARAMS.PRICE, filters.price.join(','));
  }

  // Add cuisine array if set
  if (filters.cuisine && filters.cuisine.length > 0) {
    params.set(FILTER_PARAMS.CUISINE, filters.cuisine.map(c => encodeURIComponent(c)).join(','));
  }

  // Add dietary preferences array if set
  if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
    params.set(FILTER_PARAMS.DIETARY, filters.dietaryPreferences.map(d => encodeURIComponent(d)).join(','));
  }

  return params;
}

/**
 * Build URL string with filters
 */
export function buildUrlWithFilters(
  pathname: string,
  filters: FilterState,
  category: string | null
): string {
  const params = serializeFiltersToUrl(filters, category);
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterState, category: string | null): boolean {
  return (
    category !== null ||
    filters.underThirtyMins ||
    filters.deals ||
    filters.dashPass ||
    filters.overRating !== null ||
    (filters.price !== null && filters.price.length > 0) ||
    (filters.cuisine !== null && filters.cuisine.length > 0) ||
    (filters.dietaryPreferences !== null && filters.dietaryPreferences.length > 0)
  );
}

/**
 * Get default filter state
 */
export function getDefaultFilterState(): FilterState {
  return { ...DEFAULT_FILTER_STATE };
}

