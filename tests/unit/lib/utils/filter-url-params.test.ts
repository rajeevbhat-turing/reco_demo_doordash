import { describe, it, expect } from 'vitest';
import {
  parseFiltersFromUrl,
  parseCategoryFromUrl,
  serializeFiltersToUrl,
  buildUrlWithFilters,
  hasActiveFilters,
  getDefaultFilterState,
  FILTER_PARAMS,
} from '@/lib/utils/filter-url-params';
import type { FilterState } from '@/components/filter-options';

describe('filter-url-params', () => {
  describe('parseFiltersFromUrl', () => {
    it('should return default filters for empty params', () => {
      const params = new URLSearchParams();
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.underThirtyMins).toBe(false);
      expect(filters.deals).toBe(false);
      expect(filters.overRating).toBeNull();
      expect(filters.price).toBeNull();
      expect(filters.dashPass).toBe(false);
      expect(filters.cuisine).toBeNull();
      expect(filters.dietaryPreferences).toBeNull();
    });

    it('should parse boolean filters', () => {
      const params = new URLSearchParams('under30=true&deals=true&dashpass=true');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.underThirtyMins).toBe(true);
      expect(filters.deals).toBe(true);
      expect(filters.dashPass).toBe(true);
    });

    it('should parse rating filter', () => {
      const params = new URLSearchParams('rating=4');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.overRating).toBe(4);
    });

    it('should ignore invalid rating values', () => {
      const params = new URLSearchParams('rating=invalid');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.overRating).toBeNull();
    });

    it('should parse price filter', () => {
      const params = new URLSearchParams('price=$,$$,$$$');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.price).toEqual(['$', '$$', '$$$']);
    });

    it('should filter out invalid price values', () => {
      const params = new URLSearchParams('price=$,invalid,$$$');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.price).toEqual(['$', '$$$']);
    });

    it('should parse cuisine filter', () => {
      const params = new URLSearchParams('cuisine=Italian,Mexican,Thai');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.cuisine).toEqual(['Italian', 'Mexican', 'Thai']);
    });

    it('should parse dietary filter', () => {
      const params = new URLSearchParams('dietary=Vegetarian,Vegan');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.dietaryPreferences).toEqual(['Vegetarian', 'Vegan']);
    });

    it('should handle URL-encoded values', () => {
      const params = new URLSearchParams('cuisine=Fast%20Food,Fine%20Dining');
      const filters = parseFiltersFromUrl(params);
      
      expect(filters.cuisine).toEqual(['Fast Food', 'Fine Dining']);
    });
  });

  describe('parseCategoryFromUrl', () => {
    it('should return null for missing category', () => {
      const params = new URLSearchParams();
      const category = parseCategoryFromUrl(params);
      
      expect(category).toBeNull();
    });

    it('should parse category', () => {
      const params = new URLSearchParams('category=Pizza');
      const category = parseCategoryFromUrl(params);
      
      expect(category).toBe('Pizza');
    });

    it('should decode URL-encoded category', () => {
      const params = new URLSearchParams('category=Fast%20Food');
      const category = parseCategoryFromUrl(params);
      
      expect(category).toBe('Fast Food');
    });
  });

  describe('serializeFiltersToUrl', () => {
    it('should return empty params for default filters and no category', () => {
      const filters = getDefaultFilterState();
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.toString()).toBe('');
    });

    it('should serialize category', () => {
      const filters = getDefaultFilterState();
      const params = serializeFiltersToUrl(filters, 'Pizza');
      
      expect(params.get('category')).toBe('Pizza');
    });

    it('should serialize boolean filters', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        underThirtyMins: true,
        deals: true,
        dashPass: true,
      };
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.get('under30')).toBe('true');
      expect(params.get('deals')).toBe('true');
      expect(params.get('dashpass')).toBe('true');
    });

    it('should serialize rating', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        overRating: 4,
      };
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.get('rating')).toBe('4');
    });

    it('should serialize price array', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        price: ['$', '$$'],
      };
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.get('price')).toBe('$,$$');
    });

    it('should serialize cuisine array', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        cuisine: ['Italian', 'Mexican'],
      };
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.get('cuisine')).toBe('Italian,Mexican');
    });

    it('should serialize dietary preferences array', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        dietaryPreferences: ['Vegetarian', 'Vegan'],
      };
      const params = serializeFiltersToUrl(filters, null);
      
      expect(params.get('dietary')).toBe('Vegetarian,Vegan');
    });
  });

  describe('buildUrlWithFilters', () => {
    it('should return pathname only for default filters', () => {
      const filters = getDefaultFilterState();
      const url = buildUrlWithFilters('/home', filters, null);
      
      expect(url).toBe('/home');
    });

    it('should build URL with category', () => {
      const filters = getDefaultFilterState();
      const url = buildUrlWithFilters('/home', filters, 'Pizza');
      
      expect(url).toBe('/home?category=Pizza');
    });

    it('should build URL with multiple filters', () => {
      const filters: FilterState = {
        ...getDefaultFilterState(),
        underThirtyMins: true,
        overRating: 4,
      };
      const url = buildUrlWithFilters('/home', filters, 'Pizza');
      
      expect(url).toContain('category=Pizza');
      expect(url).toContain('under30=true');
      expect(url).toContain('rating=4');
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false for default filters and no category', () => {
      const filters = getDefaultFilterState();
      expect(hasActiveFilters(filters, null)).toBe(false);
    });

    it('should return true when category is set', () => {
      const filters = getDefaultFilterState();
      expect(hasActiveFilters(filters, 'Pizza')).toBe(true);
    });

    it('should return true when any filter is active', () => {
      expect(hasActiveFilters({ ...getDefaultFilterState(), underThirtyMins: true }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), deals: true }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), dashPass: true }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), overRating: 4 }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), price: ['$'] }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), cuisine: ['Italian'] }, null)).toBe(true);
      expect(hasActiveFilters({ ...getDefaultFilterState(), dietaryPreferences: ['Vegan'] }, null)).toBe(true);
    });
  });

  describe('getDefaultFilterState', () => {
    it('should return correct default state', () => {
      const defaultState = getDefaultFilterState();
      
      expect(defaultState).toEqual({
        underThirtyMins: false,
        deals: false,
        overRating: null,
        price: null,
        dashPass: false,
        cuisine: null,
        dietaryPreferences: null,
      });
    });
  });

  describe('FILTER_PARAMS constants', () => {
    it('should have correct param names', () => {
      expect(FILTER_PARAMS.CATEGORY).toBe('category');
      expect(FILTER_PARAMS.UNDER_30_MINS).toBe('under30');
      expect(FILTER_PARAMS.DEALS).toBe('deals');
      expect(FILTER_PARAMS.RATING).toBe('rating');
      expect(FILTER_PARAMS.PRICE).toBe('price');
      expect(FILTER_PARAMS.DASHPASS).toBe('dashpass');
      expect(FILTER_PARAMS.CUISINE).toBe('cuisine');
      expect(FILTER_PARAMS.DIETARY).toBe('dietary');
    });
  });
});

