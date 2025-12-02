import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterOptions } from './use-filter-options';

describe('useFilterOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useFilterOptions({}));

    expect(result.current.filters).toEqual({
      underThirtyMins: false,
      deals: false,
      overRating: null,
      price: null,
      minPrice: null,
      maxPrice: null,
      dashPass: false,
      location: null,
      cuisine: null,
      dietaryPreferences: null,
    });
  });

  it('should update filters when externalFilters prop changes', () => {
    const externalFilters = {
      underThirtyMins: true,
      deals: true,
      overRating: 4,
      price: ['$', '$$'],
      minPrice: null,
      maxPrice: null,
      dashPass: false,
      location: 'under-1mi',
      cuisine: ['Italian'],
      dietaryPreferences: ['Vegetarian'],
    };

    const { result, rerender } = renderHook(
      ({ filters }: { filters?: typeof externalFilters | undefined }) =>
        useFilterOptions({ externalFilters: filters }),
      {
        initialProps: { filters: undefined as typeof externalFilters | undefined },
      }
    );

    rerender({ filters: externalFilters });

    expect(result.current.filters).toEqual(externalFilters);
  });

  describe('toggleFilter', () => {
    it('should toggle boolean filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.toggleFilter('underThirtyMins');
      });

      expect(result.current.filters.underThirtyMins).toBe(true);

      act(() => {
        result.current.toggleFilter('underThirtyMins');
      });

      expect(result.current.filters.underThirtyMins).toBe(false);
    });

    it('should set filter value when provided', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.toggleFilter('overRating', 4);
      });

      expect(result.current.filters.overRating).toBe(4);
    });

    it('should call onFilterChange callback when provided', () => {
      const onFilterChange = vi.fn();
      const { result } = renderHook(() =>
        useFilterOptions({
          onFilterChange,
        })
      );

      act(() => {
        result.current.toggleFilter('underThirtyMins');
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          underThirtyMins: true,
        })
      );
    });
  });

  describe('rating filter', () => {
    it('should handle rating selection', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleRatingSelect(4);
      });

      expect(result.current.selectedRating).toBe(4);
    });

    it('should apply rating filter', async () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleRatingSelect(4);
      });

      expect(result.current.selectedRating).toBe(4);

      act(() => {
        result.current.applyRatingFilter();
      });

      expect(result.current.filters.overRating).toBe(4);
      expect(result.current.ratingDropdownOpen).toBe(false);
    });

    it('should reset rating filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleRatingSelect(4);
        result.current.applyRatingFilter();
        result.current.resetRatingFilter();
      });

      expect(result.current.filters.overRating).toBe(null);
      expect(result.current.selectedRating).toBe(null);
    });

    it('should return correct rating label', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      // Default label when no filter applied
      expect(result.current.getRatingLabel()).toBe('Over 1★');

      act(() => {
        result.current.handleRatingSelect(4);
      });

      expect(result.current.selectedRating).toBe(4);

      act(() => {
        result.current.applyRatingFilter();
      });

      // After applying, the filter should be set and label should reflect it
      expect(result.current.filters.overRating).toBe(4);
      expect(result.current.getRatingLabel()).toBe('Over 4★');
    });
  });

  describe('price filter', () => {
    it('should toggle price selection', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handlePriceToggle('$');
      });

      expect(result.current.selectedPrices).toContain('$');

      act(() => {
        result.current.handlePriceToggle('$');
      });

      expect(result.current.selectedPrices).not.toContain('$');
    });

    it('should apply price filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handlePriceToggle('$');
      });

      act(() => {
        result.current.handlePriceToggle('$$');
      });

      expect(result.current.selectedPrices).toEqual(['$', '$$']);

      act(() => {
        result.current.applyPriceFilter();
      });

      // Verify the filter is applied
      expect(result.current.filters.price).toEqual(['$', '$$']);
      expect(result.current.priceDropdownOpen).toBe(false);
    });

    it('should reset price filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handlePriceToggle('$');
        result.current.applyPriceFilter();
        result.current.resetPriceFilter();
      });

      expect(result.current.filters.price).toBe(null);
      expect(result.current.selectedPrices).toEqual([]);
    });

    it('should return correct price label', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      expect(result.current.getPriceLabel()).toBe('Price');

      act(() => {
        result.current.handlePriceToggle('$');
      });

      act(() => {
        result.current.applyPriceFilter();
      });

      // After applying, the filter should be set and label should reflect it
      expect(result.current.filters.price).toEqual(['$']);
      expect(result.current.getPriceLabel()).toBe('$');

      act(() => {
        result.current.handlePriceToggle('$$');
      });

      act(() => {
        result.current.applyPriceFilter();
      });

      expect(result.current.filters.price).toEqual(['$', '$$']);
      expect(result.current.getPriceLabel()).toContain('$');
    });
  });

  describe('location filter', () => {
    it('should handle location selection', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleLocationSelect('under-1mi');
      });

      expect(result.current.selectedLocation).toBe('under-1mi');
    });

    it('should apply location filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleLocationSelect('under-1mi');
      });

      expect(result.current.selectedLocation).toBe('under-1mi');

      act(() => {
        result.current.applyLocationFilter();
      });

      expect(result.current.filters.location).toBe('under-1mi');
      expect(result.current.locationDropdownOpen).toBe(false);
    });

    it('should reset location filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleLocationSelect('under-1mi');
        result.current.applyLocationFilter();
        result.current.resetLocationFilter();
      });

      expect(result.current.filters.location).toBe(null);
      expect(result.current.selectedLocation).toBe(null);
    });

    it('should return correct location label', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      expect(result.current.getLocationLabel()).toBe('Location');

      act(() => {
        result.current.handleLocationSelect('under-1mi');
      });

      expect(result.current.selectedLocation).toBe('under-1mi');

      act(() => {
        result.current.applyLocationFilter();
      });

      // After applying, the filter should be set and label should reflect it
      expect(result.current.filters.location).toBe('under-1mi');
      expect(result.current.getLocationLabel()).toBe('Under 1 mi');
    });
  });

  describe('cuisine filter', () => {
    it('should toggle cuisine selection', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleCuisineToggle('Italian');
      });

      expect(result.current.selectedCuisines).toContain('Italian');

      act(() => {
        result.current.handleCuisineToggle('Italian');
      });

      expect(result.current.selectedCuisines).not.toContain('Italian');
    });

    it('should apply cuisine filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleCuisineToggle('Italian');
      });

      act(() => {
        result.current.handleCuisineToggle('Mexican');
      });

      expect(result.current.selectedCuisines).toEqual(['Italian', 'Mexican']);

      act(() => {
        result.current.applyCuisineFilter();
      });

      // Verify the filter is applied
      expect(result.current.filters.cuisine).toEqual(['Italian', 'Mexican']);
      expect(result.current.cuisineDropdownOpen).toBe(false);
      // When there are 2 cuisines, label shows first two
      expect(result.current.getCuisineLabel()).toBe('Italian, Mexican');
    });

    it('should reset cuisine filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleCuisineToggle('Italian');
        result.current.applyCuisineFilter();
        result.current.resetCuisineFilter();
      });

      expect(result.current.filters.cuisine).toBe(null);
      expect(result.current.selectedCuisines).toEqual([]);
    });

    it('should return correct cuisine label', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      expect(result.current.getCuisineLabel()).toBe('Cuisine');

      act(() => {
        result.current.handleCuisineToggle('Italian');
      });

      expect(result.current.selectedCuisines).toContain('Italian');

      act(() => {
        result.current.applyCuisineFilter();
      });

      // After applying, the filter should be set and label should reflect it
      expect(result.current.filters.cuisine).toEqual(['Italian']);
      expect(result.current.getCuisineLabel()).toBe('Italian');
    });
  });

  describe('dietary filter', () => {
    it('should toggle dietary preference selection', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleDietaryToggle('Vegetarian');
      });

      expect(result.current.selectedDietaryPreferences).toContain('Vegetarian');

      act(() => {
        result.current.handleDietaryToggle('Vegetarian');
      });

      expect(result.current.selectedDietaryPreferences).not.toContain('Vegetarian');
    });

    it('should apply dietary filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleDietaryToggle('Vegetarian');
      });

      expect(result.current.selectedDietaryPreferences).toEqual(['Vegetarian']);

      act(() => {
        result.current.applyDietaryFilter();
      });

      expect(result.current.filters.dietaryPreferences).toEqual(['Vegetarian']);
      expect(result.current.dietaryDropdownOpen).toBe(false);
    });

    it('should reset dietary filter', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.handleDietaryToggle('Vegetarian');
        result.current.applyDietaryFilter();
        result.current.resetDietaryFilter();
      });

      expect(result.current.filters.dietaryPreferences).toBe(null);
      expect(result.current.selectedDietaryPreferences).toEqual([]);
    });

    it('should return correct dietary label', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      expect(result.current.getDietaryLabel()).toBe('Dietary');

      act(() => {
        result.current.handleDietaryToggle('Vegetarian');
      });

      expect(result.current.selectedDietaryPreferences).toContain('Vegetarian');

      act(() => {
        result.current.applyDietaryFilter();
      });

      // After applying, the filter should be set and label should reflect it
      expect(result.current.filters.dietaryPreferences).toEqual(['Vegetarian']);
      expect(result.current.getDietaryLabel()).toBe('Vegetarian');
    });
  });

  describe('resetAllFilters', () => {
    it('should reset all filters to default state', () => {
      const onReset = vi.fn();
      const { result } = renderHook(() =>
        useFilterOptions({
          onReset,
        })
      );

      act(() => {
        result.current.toggleFilter('underThirtyMins');
        result.current.handleRatingSelect(4);
        result.current.applyRatingFilter();
        result.current.resetAllFilters();
      });

      expect(result.current.filters).toEqual({
        underThirtyMins: false,
        deals: false,
        overRating: null,
        price: null,
        minPrice: null,
        maxPrice: null,
        dashPass: false,
        location: null,
        cuisine: null,
        dietaryPreferences: null,
      });
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('dropdown state', () => {
    it('should toggle dropdown open state', () => {
      const { result } = renderHook(() => useFilterOptions({}));

      act(() => {
        result.current.setRatingDropdownOpen(true);
      });

      expect(result.current.ratingDropdownOpen).toBe(true);

      act(() => {
        result.current.setRatingDropdownOpen(false);
      });

      expect(result.current.ratingDropdownOpen).toBe(false);
    });
  });
});
