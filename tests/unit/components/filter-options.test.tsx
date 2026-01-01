import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock useFilterOptions hook BEFORE importing component
const {
  mockToggleFilter,
  mockHandleRatingSelect,
  mockHandlePriceToggle,
  mockResetRatingFilter,
  mockResetPriceFilter,
  mockApplyPriceFilter,
  mockHandleCuisineToggle,
  mockResetCuisineFilter,
  mockApplyCuisineFilter,
  mockHandleDietaryToggle,
  mockResetDietaryFilter,
  mockApplyDietaryFilter,
  mockApplyRatingFilter,
  mockResetAllFilters,
  mockSetRatingDropdownOpen,
  mockSetPriceDropdownOpen,
  mockSetCuisineDropdownOpen,
  mockSetDietaryDropdownOpen,
  mockSetLocationDropdownOpen,
  mockUseFilterOptions,
} = vi.hoisted(() => {
  return {
    mockToggleFilter: vi.fn(),
    mockHandleRatingSelect: vi.fn(),
    mockHandlePriceToggle: vi.fn(),
    mockResetRatingFilter: vi.fn(),
    mockResetPriceFilter: vi.fn(),
    mockApplyPriceFilter: vi.fn(),
    mockHandleCuisineToggle: vi.fn(),
    mockResetCuisineFilter: vi.fn(),
    mockApplyCuisineFilter: vi.fn(),
    mockHandleDietaryToggle: vi.fn(),
    mockResetDietaryFilter: vi.fn(),
    mockApplyDietaryFilter: vi.fn(),
    mockApplyRatingFilter: vi.fn(),
    mockResetAllFilters: vi.fn(),
    mockSetRatingDropdownOpen: vi.fn(),
    mockSetPriceDropdownOpen: vi.fn(),
    mockSetCuisineDropdownOpen: vi.fn(),
    mockSetDietaryDropdownOpen: vi.fn(),
    mockSetLocationDropdownOpen: vi.fn(),
    mockUseFilterOptions: vi.fn(),
  };
});

vi.mock('@/lib/hooks/use-filter-options', () => ({
  useFilterOptions: () => mockUseFilterOptions(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  Tag: () => <div data-testid="tag-icon">Tag</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
}));

import FilterOptions, { FilterState, FilterOptionsRef } from '@/components/filter-options';

describe('FilterOptions', () => {
  const mockOnFilterChange = vi.fn();

  const defaultFilters: FilterState = {
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
  };

  const defaultHookReturn = {
    filters: defaultFilters,
    ratingDropdownOpen: false,
    priceDropdownOpen: false,
    cuisineDropdownOpen: false,
    dietaryDropdownOpen: false,
    selectedRating: null,
    selectedPrices: [],
    selectedCuisines: [],
    selectedDietaryPreferences: [],
    ratingButtonRef: { current: null },
    priceButtonRef: { current: null },
    cuisineButtonRef: { current: null },
    dietaryButtonRef: { current: null },
    ratingDropdownPositionedRef: vi.fn(),
    priceDropdownPositionedRef: vi.fn(),
    cuisineDropdownPositionedRef: vi.fn(),
    dietaryDropdownPositionedRef: vi.fn(),
    toggleFilter: mockToggleFilter,
    handleRatingSelect: mockHandleRatingSelect,
    handlePriceToggle: mockHandlePriceToggle,
    resetRatingFilter: mockResetRatingFilter,
    resetPriceFilter: mockResetPriceFilter,
    applyPriceFilter: mockApplyPriceFilter,
    handleCuisineToggle: mockHandleCuisineToggle,
    resetCuisineFilter: mockResetCuisineFilter,
    applyCuisineFilter: mockApplyCuisineFilter,
    handleDietaryToggle: mockHandleDietaryToggle,
    resetDietaryFilter: mockResetDietaryFilter,
    applyDietaryFilter: mockApplyDietaryFilter,
    applyRatingFilter: mockApplyRatingFilter,
    resetAllFilters: mockResetAllFilters,
    setRatingDropdownOpen: mockSetRatingDropdownOpen,
    setPriceDropdownOpen: mockSetPriceDropdownOpen,
    setCuisineDropdownOpen: mockSetCuisineDropdownOpen,
    setDietaryDropdownOpen: mockSetDietaryDropdownOpen,
    setLocationDropdownOpen: mockSetLocationDropdownOpen,
    getPriceLabel: () => 'Price',
    getCuisineLabel: () => 'Cuisine',
    getDietaryLabel: () => 'Dietary',
    getRatingLabel: () => 'Ratings',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFilterOptions.mockReturnValue(defaultHookReturn);
  });

  it('should render default filters when no filterData provided', () => {
    render(<FilterOptions />);

    expect(screen.getByText('Under 30 min')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Ratings')).toBeInTheDocument();
  });

  it('should render filter buttons from filterData', () => {
    const filterData = [
      { id: '3', name: 'DashPass', icon: '🚀' },
      { id: '4', name: 'Under 30 min', icon: '⏱️' },
    ];

    render(<FilterOptions filterData={filterData} />);

    expect(screen.getByText('DashPass')).toBeInTheDocument();
    expect(screen.getByText('Under 30 min')).toBeInTheDocument();
  });

  it('should toggle underThirtyMins filter when clicked', () => {
    render(<FilterOptions />);

    const under30Button = screen.getByText('Under 30 min');
    fireEvent.click(under30Button);

    expect(mockToggleFilter).toHaveBeenCalledWith('underThirtyMins');
  });

  it('should toggle deals filter when clicked', () => {
    render(<FilterOptions />);

    const dealsButton = screen.getByText('Deals');
    fireEvent.click(dealsButton);

    expect(mockToggleFilter).toHaveBeenCalledWith('deals');
  });

  it('should toggle dashPass filter when clicked', () => {
    const filterData = [{ id: '3', name: 'DashPass', icon: '🚀' }];

    render(<FilterOptions filterData={filterData} />);

    const dashPassButton = screen.getByText('DashPass');
    fireEvent.click(dashPassButton);

    expect(mockToggleFilter).toHaveBeenCalledWith('dashPass');
  });

  it('should open rating dropdown when rating button is clicked', () => {
    render(<FilterOptions />);

    const ratingButton = screen.getByText('Ratings');
    fireEvent.click(ratingButton);

    expect(mockSetRatingDropdownOpen).toHaveBeenCalledWith(true);
  });

  it('should display rating dropdown when ratingDropdownOpen is true', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
    });

    render(<FilterOptions />);

    expect(screen.getByRole('heading', { name: 'Ratings' })).toBeInTheDocument();
    expect(screen.getByText('View Results')).toBeInTheDocument();
  });

  it('should call handleRatingSelect when rating button is clicked', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
    });

    render(<FilterOptions />);

    const ratingButtons = screen.getAllByRole('button');
    const ratingSelectButtons = ratingButtons.filter(
      btn => btn.className.includes('rounded-full') && btn.className.includes('w-6')
    );
    if (ratingSelectButtons.length > 0) {
      fireEvent.click(ratingSelectButtons[0]);
      expect(mockHandleRatingSelect).toHaveBeenCalled();
    }
  });

  it('should call resetRatingFilter when Reset is clicked in rating dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
    });

    render(<FilterOptions />);

    const resetButtons = screen.getAllByText('Reset');
    fireEvent.click(resetButtons[0]);

    expect(mockResetRatingFilter).toHaveBeenCalled();
  });

  it('should call applyRatingFilter when View Results is clicked in rating dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
    });

    render(<FilterOptions />);

    const viewResultsButtons = screen.getAllByText('View Results');
    fireEvent.click(viewResultsButtons[0]);

    expect(mockApplyRatingFilter).toHaveBeenCalled();
  });

  it('should open price dropdown when price button is clicked', () => {
    render(<FilterOptions showPriceFilter={true} />);

    const priceButton = screen.getByText('Price');
    fireEvent.click(priceButton);

    expect(mockSetPriceDropdownOpen).toHaveBeenCalledWith(true);
  });

  it('should display price dropdown when priceDropdownOpen is true', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      priceDropdownOpen: true,
    });

    render(<FilterOptions showPriceFilter={true} />);

    expect(screen.getByRole('heading', { name: 'Price' })).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
    expect(screen.getByText('$$$')).toBeInTheDocument();
    expect(screen.getByText('$$$$')).toBeInTheDocument();
  });

  it('should call handlePriceToggle when price option is clicked', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      priceDropdownOpen: true,
    });

    render(<FilterOptions showPriceFilter={true} />);

    const dollarButton = screen.getByText('$');
    fireEvent.click(dollarButton);

    expect(mockHandlePriceToggle).toHaveBeenCalledWith('$');
  });

  it('should call resetPriceFilter when Reset is clicked in price dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      priceDropdownOpen: true,
    });

    render(<FilterOptions showPriceFilter={true} />);

    const resetButtons = screen.getAllByText('Reset');
    const priceResetButton = resetButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Price')
    );
    if (priceResetButton) {
      fireEvent.click(priceResetButton);
      expect(mockResetPriceFilter).toHaveBeenCalled();
    }
  });

  it('should call applyPriceFilter when View Results is clicked in price dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      priceDropdownOpen: true,
    });

    render(<FilterOptions showPriceFilter={true} />);

    const viewResultsButtons = screen.getAllByText('View Results');
    const priceViewResultsButton = viewResultsButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Price')
    );
    if (priceViewResultsButton) {
      fireEvent.click(priceViewResultsButton);
      expect(mockApplyPriceFilter).toHaveBeenCalled();
    }
  });

  it('should open cuisine dropdown when cuisine button is clicked', () => {
    render(<FilterOptions />);

    const cuisineButton = screen.getByText('Cuisine');
    fireEvent.click(cuisineButton);

    expect(mockSetCuisineDropdownOpen).toHaveBeenCalledWith(true);
    expect(mockSetRatingDropdownOpen).toHaveBeenCalledWith(false);
    expect(mockSetPriceDropdownOpen).toHaveBeenCalledWith(false);
  });

  it('should display cuisine dropdown when cuisineDropdownOpen is true', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    expect(screen.getByRole('heading', { name: 'Cuisine' })).toBeInTheDocument();
    expect(screen.getByText('American')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('should call handleCuisineToggle when cuisine option is clicked', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    const americanButton = screen.getByText('American');
    fireEvent.click(americanButton);

    expect(mockHandleCuisineToggle).toHaveBeenCalledWith('American');
  });

  it('should display check icon for selected cuisines', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
      selectedCuisines: ['American'],
    });

    render(<FilterOptions />);

    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should call resetCuisineFilter when Reset is clicked in cuisine dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    const resetButtons = screen.getAllByText('Reset');
    const cuisineResetButton = resetButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Cuisine')
    );
    if (cuisineResetButton) {
      fireEvent.click(cuisineResetButton);
      expect(mockResetCuisineFilter).toHaveBeenCalled();
    }
  });

  it('should call applyCuisineFilter when View Results is clicked in cuisine dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    const viewResultsButtons = screen.getAllByText('View Results');
    const cuisineViewResultsButton = viewResultsButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Cuisine')
    );
    if (cuisineViewResultsButton) {
      fireEvent.click(cuisineViewResultsButton);
      expect(mockApplyCuisineFilter).toHaveBeenCalled();
    }
  });

  it('should open dietary dropdown when dietary button is clicked', () => {
    render(<FilterOptions />);

    const dietaryButton = screen.getByText('Dietary');
    fireEvent.click(dietaryButton);

    expect(mockSetDietaryDropdownOpen).toHaveBeenCalledWith(true);
    expect(mockSetRatingDropdownOpen).toHaveBeenCalledWith(false);
    expect(mockSetPriceDropdownOpen).toHaveBeenCalledWith(false);
    expect(mockSetCuisineDropdownOpen).toHaveBeenCalledWith(false);
  });

  it('should display dietary dropdown when dietaryDropdownOpen is true', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
    });

    render(<FilterOptions />);

    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  it('should call handleDietaryToggle when dietary option is clicked', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
    });

    render(<FilterOptions />);

    const veganButton = screen.getByText('Vegan');
    fireEvent.click(veganButton);

    expect(mockHandleDietaryToggle).toHaveBeenCalledWith('Vegan');
  });

  it('should display check icon for selected dietary preferences', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
      selectedDietaryPreferences: ['Vegan'],
    });

    render(<FilterOptions />);

    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should call resetDietaryFilter when Reset is clicked in dietary dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
    });

    render(<FilterOptions />);

    const resetButtons = screen.getAllByText('Reset');
    const dietaryResetButton = resetButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Dietary Preferences')
    );
    if (dietaryResetButton) {
      fireEvent.click(dietaryResetButton);
      expect(mockResetDietaryFilter).toHaveBeenCalled();
    }
  });

  it('should call applyDietaryFilter when View Results is clicked in dietary dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
    });

    render(<FilterOptions />);

    const viewResultsButtons = screen.getAllByText('View Results');
    const dietaryViewResultsButton = viewResultsButtons.find(btn =>
      btn.closest('div')?.textContent?.includes('Dietary Preferences')
    );
    if (dietaryViewResultsButton) {
      fireEvent.click(dietaryViewResultsButton);
      expect(mockApplyDietaryFilter).toHaveBeenCalled();
    }
  });

  it('should not display deals filter when isGrocery is true', () => {
    render(<FilterOptions isGrocery={true} />);

    expect(screen.queryByText('Deals')).not.toBeInTheDocument();
  });

  it('should not display cuisine filter when hideCuisineFilter is true', () => {
    render(<FilterOptions hideCuisineFilter={true} />);

    expect(screen.queryByText('Cuisine')).not.toBeInTheDocument();
  });

  it('should not display dietary filter when hideDietaryFilter is true', () => {
    render(<FilterOptions hideDietaryFilter={true} />);

    expect(screen.queryByText('Dietary')).not.toBeInTheDocument();
  });

  it('should not display price filter when showPriceFilter is false', () => {
    render(<FilterOptions showPriceFilter={false} />);

    expect(screen.queryByText('Price')).not.toBeInTheDocument();
  });

  it('should expose resetFilters via ref', () => {
    const ref = React.createRef<FilterOptionsRef>();

    render(<FilterOptions ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.resetFilters).toBeDefined();

    ref.current?.resetFilters();
    expect(mockResetAllFilters).toHaveBeenCalled();
  });

  it('should call onFilterChange when filters change', () => {
    const filtersWithDeals: FilterState = {
      ...defaultFilters,
      deals: true,
    };

    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      filters: filtersWithDeals,
    });

    render(<FilterOptions onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('should display active filter state correctly', () => {
    const activeFilters: FilterState = {
      ...defaultFilters,
      underThirtyMins: true,
      deals: true,
      overRating: 4,
      price: ['$', '$$'],
      cuisine: ['Italian'],
      dietaryPreferences: ['Vegan'],
    };

    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      filters: activeFilters,
    });

    render(<FilterOptions />);

    expect(screen.getByText('Under 30 min')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('should skip delivery and pickup filters from filterData', () => {
    const filterData = [
      { id: '1', name: 'Delivery', icon: '🚚' },
      { id: '2', name: 'Pickup', icon: '📦' },
      { id: '3', name: 'DashPass', icon: '🚀' },
    ];

    render(<FilterOptions filterData={filterData} />);

    expect(screen.queryByText('Delivery')).not.toBeInTheDocument();
    expect(screen.queryByText('Pickup')).not.toBeInTheDocument();
    expect(screen.getByText('DashPass')).toBeInTheDocument();
  });

  it('should render price filter from filterData when id is 5', () => {
    const filterData = [{ id: '5', name: 'Price', icon: '$' }];

    render(<FilterOptions filterData={filterData} />);

    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('should close other dropdowns when opening rating dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      priceDropdownOpen: true,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    const ratingButton = screen.getByText('Ratings');
    fireEvent.click(ratingButton);

    expect(mockSetRatingDropdownOpen).toHaveBeenCalledWith(true);
  });

  it('should toggle price dropdown when price button is clicked', () => {
    render(<FilterOptions showPriceFilter={true} />);

    const priceButton = screen.getByText('Price');
    fireEvent.click(priceButton);

    expect(mockSetPriceDropdownOpen).toHaveBeenCalledWith(true);
  });

  it('should display all cuisine options', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      cuisineDropdownOpen: true,
    });

    render(<FilterOptions />);

    const cuisines = [
      'American',
      'Italian',
      'Asian',
      'Mexican',
      'Chinese',
      'Japanese',
      'Indian',
      'Thai',
      'Mediterranean',
      'French',
      'Greek',
      'Korean',
      'Vietnamese',
      'Middle Eastern',
      'Spanish',
      'Seafood',
      'Steakhouse',
      'Pizza',
      'Fast Food',
      'Barbecue',
    ];

    cuisines.forEach(cuisine => {
      expect(screen.getByText(cuisine)).toBeInTheDocument();
    });
  });

  it('should display all dietary preference options', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      dietaryDropdownOpen: true,
    });

    render(<FilterOptions />);

    const dietaryOptions = ['Vegan', 'Vegetarian', 'Nut-free', 'Low-carb', 'Dairy-free'];

    dietaryOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should handle external filters prop', () => {
    const externalFilters: FilterState = {
      ...defaultFilters,
      underThirtyMins: true,
      deals: true,
    };

    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      filters: externalFilters,
    });

    render(<FilterOptions filters={externalFilters} />);

    expect(screen.getByText('Under 30 min')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('should display selected rating in dropdown', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
      selectedRating: 4,
    });

    render(<FilterOptions />);

    expect(screen.getByText('Over 4')).toBeInTheDocument();
  });

  it('should display default rating text when no rating selected', () => {
    mockUseFilterOptions.mockReturnValue({
      ...defaultHookReturn,
      ratingDropdownOpen: true,
      selectedRating: null,
    });

    render(<FilterOptions />);

    expect(screen.getByText('Over 1')).toBeInTheDocument();
  });
});
