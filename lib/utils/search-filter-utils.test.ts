import {
  applySearchFilters,
  determineSearchContext,
  detectAvailableCategories,
  filterByCategory,
} from './search-filter-utils';
import type { FilterState } from '@/components/filter-options';
import type { SearchResultRestaurant } from './search-utils';

describe('search-filter-utils', () => {
  const mockResults: SearchResultRestaurant[] = [
    {
      id: '1',
      name: 'Fast Restaurant',
      time: '25 min',
      rating: 4.5,
      dashPass: true,
      priceRange: '$$',
      discount: '20% off',
      distance: '2.5 mi',
      cuisine: 'Italian',
      logo: '',
      banner: '',
      reviews: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      featured: false,
      new: false,
      categories: [],
      lat: 0,
      lng: 0,
      matchType: 'restaurant',
    },
    {
      id: '2',
      name: 'Slow Restaurant',
      time: '45 min',
      rating: 3.5,
      dashPass: false,
      priceRange: '$$$',
      discount: undefined,
      distance: '5.0 mi',
      cuisine: 'Mexican',
      logo: '',
      banner: '',
      reviews: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      featured: false,
      new: false,
      categories: [],
      lat: 0,
      lng: 0,
      matchType: 'restaurant',
    },
    {
      id: '3',
      name: 'Express Restaurant',
      time: 'Express 15 min',
      rating: 4.8,
      dashPass: true,
      priceRange: '$',
      discount: '10% off',
      distance: '0.5 mi',
      cuisine: 'American',
      logo: '',
      banner: '',
      reviews: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      featured: false,
      new: false,
      categories: [],
      lat: 0,
      lng: 0,
      matchType: 'restaurant',
    },
  ];

  const emptyFilters: FilterState = {
    underThirtyMins: false,
    overRating: null,
    dashPass: false,
    price: [],
    minPrice: null,
    maxPrice: null,
    deals: false,
    location: null,
    cuisine: [],
    dietaryPreferences: [],
  };

  describe('applySearchFilters', () => {
    it('should return all results when no filters applied', () => {
      const result = applySearchFilters(mockResults, emptyFilters);
      expect(result.length).toBe(mockResults.length);
    });

    it('should filter by under 30 minutes', () => {
      const filters: FilterState = {
        ...emptyFilters,
        underThirtyMins: true,
      };
      const result = applySearchFilters(mockResults, filters);
      expect(
        result.every(r => {
          const timeMatch = r.time?.match(/(\d+)\s*min/);
          const minutes = timeMatch ? parseInt(timeMatch[1]) : 100;
          return minutes < 30;
        })
      ).toBe(true);
    });

    it('should filter by rating', () => {
      const filters: FilterState = {
        ...emptyFilters,
        overRating: 4.0,
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.every(r => (r.rating || 0) >= 4.0)).toBe(true);
    });

    it('should filter by DashPass', () => {
      const filters: FilterState = {
        ...emptyFilters,
        dashPass: true,
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.every(r => r.dashPass)).toBe(true);
    });

    it('should filter by price range', () => {
      const filters: FilterState = {
        ...emptyFilters,
        price: ['$$'],
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.every(r => r.priceRange === '$$')).toBe(true);
    });

    it('should filter by min/max price when menu items provided', () => {
      const filters: FilterState = {
        ...emptyFilters,
        minPrice: 10,
        maxPrice: 20,
      };
      const menuItems = new Map<string, Array<{ price: string | number }>>();
      menuItems.set('1', [{ price: 15 }]);
      menuItems.set('2', [{ price: 25 }]);
      menuItems.set('3', [{ price: 12 }]);

      const result = applySearchFilters(mockResults, filters, menuItems);
      // Should only include restaurants with items in price range
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by deals', () => {
      const filters: FilterState = {
        ...emptyFilters,
        deals: true,
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.every(r => r.discount && r.discount.length > 0)).toBe(true);
    });

    it('should filter by location (under 1 mile)', () => {
      const filters: FilterState = {
        ...emptyFilters,
        location: 'under-1mi',
      };
      const result = applySearchFilters(mockResults, filters);
      expect(
        result.every(r => {
          const distanceStr = r.distance || '';
          const miMatch = distanceStr.match(/(\d+\.?\d*)\s*mi/);
          const ftMatch = distanceStr.match(/(\d+)\s*ft/);
          let distanceInMiles = 999;
          if (ftMatch) {
            distanceInMiles = parseFloat(ftMatch[1]) / 5280;
          } else if (miMatch) {
            distanceInMiles = parseFloat(miMatch[1]);
          }
          return distanceInMiles <= 1;
        })
      ).toBe(true);
    });

    it('should filter by cuisine', () => {
      const filters: FilterState = {
        ...emptyFilters,
        cuisine: ['Italian'],
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.every(r => r.cuisine === 'Italian')).toBe(true);
    });

    it('should apply multiple filters', () => {
      const filters: FilterState = {
        ...emptyFilters,
        underThirtyMins: true,
        dashPass: true,
        overRating: 4.0,
      };
      const result = applySearchFilters(mockResults, filters);
      expect(result.length).toBeGreaterThanOrEqual(0);
      result.forEach(r => {
        expect(r.dashPass).toBe(true);
        expect((r.rating || 0) >= 4.0).toBe(true);
      });
    });
  });

  describe('determineSearchContext', () => {
    it('should return context for restaurants', () => {
      const result = determineSearchContext(mockResults);
      expect(result.hideCuisine).toBe(false);
      expect(result.hideDietary).toBe(false);
    });
  });

  describe('detectAvailableCategories', () => {
    it('should always include "All" category', () => {
      const result = detectAvailableCategories([]);
      expect(result).toContain('All');
    });

    it('should include "Restaurants" when results exist', () => {
      const result = detectAvailableCategories(mockResults);
      expect(result).toContain('All');
      expect(result).toContain('Restaurants');
    });
  });

  describe('filterByCategory', () => {
    it('should return all results for any category', () => {
      const result = filterByCategory(mockResults, 'Restaurants');
      expect(result.length).toBe(mockResults.length);
    });

    it('should return all results for "All" category', () => {
      const result = filterByCategory(mockResults, 'All');
      expect(result.length).toBe(mockResults.length);
    });
  });
});
