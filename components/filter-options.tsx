"use client"

import { forwardRef, useImperativeHandle } from "react"
import { ChevronDown, Tag, DollarSign, Check } from "lucide-react"
import { useFilterOptions } from "@/hooks/use-filter-options"

export interface FilterState {
  underThirtyMins: boolean
  deals: boolean
  overRating: number | null
  price: string[] | null // DEPRECATED: Keeping for backward compatibility during migration
  minPrice?: number | null // Min price in dollars
  maxPrice?: number | null // Max price in dollars
  dashPass: boolean
  location?: string | null // "under-1mi", "under-3mi", "under-5mi"
  cuisine?: string[] | null // Array of selected cuisines
  dietaryPreferences?: string[] | null // Array of dietary preferences
}

export interface FilterOptionsRef {
  resetFilters: () => void
}

interface FilterOption {
  id: string
  name: string
  icon: string
}

interface FilterOptionsProps {
  isGrocery?: boolean
  onFilterChange?: (filters: FilterState) => void
  onReset?: () => void
  filters?: FilterState
  filterData?: FilterOption[]
  showPriceFilter?: boolean
  hideCuisineFilter?: boolean  // Hide cuisine filter (for Pets, Grocery, Retail)
  hideDietaryFilter?: boolean   // Hide dietary filter (for Pets, Retail)
}

interface ScheduleOption {
  day: string
  date: string
  fullDate: Date
}

interface TimeOption {
  time: string
  selected: boolean
}

const FilterOptions = forwardRef<FilterOptionsRef, FilterOptionsProps>(
  ({ isGrocery = false, onFilterChange, onReset, filters: externalFilters, filterData = [], showPriceFilter = true, hideCuisineFilter = false, hideDietaryFilter = false }, ref) => {
    // Use the custom hook for all filter logic
    const {
      // State
      filters,
      ratingDropdownOpen,
      priceDropdownOpen,
      locationDropdownOpen,
      cuisineDropdownOpen,
      dietaryDropdownOpen,
      selectedRating,
      selectedPrices,
      selectedLocation,
      selectedCuisines,
      selectedDietaryPreferences,
      
      // Refs
      ratingButtonRef,
      priceButtonRef,
      locationButtonRef,
      cuisineButtonRef,
      dietaryButtonRef,
      ratingDropdownRef,
      priceDropdownRef,
      locationDropdownRef,
      cuisineDropdownRef,
      dietaryDropdownRef,
      
      // Positioned refs (callback refs for immediate positioning)
      ratingDropdownPositionedRef,
      priceDropdownPositionedRef,
      locationDropdownPositionedRef,
      cuisineDropdownPositionedRef,
      dietaryDropdownPositionedRef,
      
      // Handlers
      toggleFilter,
      handleRatingSelect,
      handlePriceToggle,
      resetRatingFilter,
      resetPriceFilter,
      applyPriceFilter,
      handleLocationSelect,
      resetLocationFilter,
      applyLocationFilter,
      handleCuisineToggle,
      resetCuisineFilter,
      applyCuisineFilter,
      handleDietaryToggle,
      resetDietaryFilter,
      applyDietaryFilter,
      applyRatingFilter,
      resetAllFilters,
      
      // Setters
      setRatingDropdownOpen,
      setPriceDropdownOpen,
      setLocationDropdownOpen,
      setCuisineDropdownOpen,
      setDietaryDropdownOpen,
      
      // Labels
      getPriceLabel,
      getLocationLabel,
      getCuisineLabel,
      getDietaryLabel,
      getRatingLabel,
    } = useFilterOptions({
      isGrocery,
      onFilterChange,
      onReset,
      externalFilters,
      filterData,
      showPriceFilter,
      hideCuisineFilter,
      hideDietaryFilter,
    })

    // Expose the reset function to parent components
    useImperativeHandle(ref, () => ({
      resetFilters: resetAllFilters,
    }))

    return (
      <div className="sticky top-16 z-40 bg-white py-2 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {/* Dynamic filter buttons from filterData */}
          {filterData.length > 0 ? (
            filterData.map((filter) => {
              // Map filter id to corresponding filter state property
              let filterKey: keyof FilterState | null = null;
              
              switch (filter.id) {
                case "1": // Delivery
                  return null; // Skip - default filter
                case "2": // Pickup - REMOVED
                  return null; // Skip - removed filter
                case "3": // DashPass
                  filterKey = "dashPass";
                  break;
                case "4": // Under 30 min
                  filterKey = "underThirtyMins";
                  break;
                case "5": // Price: $
                  return (
                    <div key={filter.id} className="relative">
                      <button
                        ref={priceButtonRef}
                        className={`rounded-full h-9 px-4 text-xs font-semibold ${
                          filters.price && filters.price.length > 0
                            ? "bg-gray-900 text-white" 
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        } flex items-center gap-1`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPriceDropdownOpen(!priceDropdownOpen)
                          setRatingDropdownOpen(false)
                        }}
                      >
                        {filter.icon} {getPriceLabel()}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                      {/* Price dropdown (reusing existing code) */}
                      {priceDropdownOpen && (
                        <div
                          ref={priceDropdownPositionedRef}
                          className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg p-6"
                        >
                          <h3 className="text-xl font-bold mb-6">Price</h3>
                          <div className="flex gap-3 mb-6">
                            {["$", "$$", "$$$", "$$$$"].map((price) => (
                              <button
                                key={price}
                                className={`px-6 py-2 rounded-full text-sm font-medium ${
                                  selectedPrices.includes(price)
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                }`}
                                onClick={() => handlePriceToggle(price)}
                              >
                                {price}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <button className="text-gray-900 font-medium" onClick={resetPriceFilter}>
                              Reset
                            </button>
                            <button
                              className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                              onClick={applyPriceFilter}
                            >
                              View Results
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
              }
              
              if (filterKey) {
                return (
                  <button
                    key={filter.id}
                    className={`rounded-full h-9 px-4 text-xs font-semibold ${
                      filters[filterKey] ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    } flex items-center gap-1`}
                    onClick={() => toggleFilter(filterKey as keyof FilterState)}
                  >
                    {filter.icon && <span className="mr-1">{filter.icon}</span>} {filter.name}
                  </button>
                );
              }
              
              return null;
            })
          ) : (
            // Fallback to default filters if no filterData provided
            <>
              <button
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.underThirtyMins ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
                onClick={() => toggleFilter("underThirtyMins")}
              >
                Under 30 min
              </button>
            </>
          )}

          {!isGrocery && (
            <button
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.deals ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={() => toggleFilter("deals")}
            >
              <Tag className="h-4 w-4 mr-1" />
              Deals
            </button>
          )}



          <div className="relative">
            <button
              ref={ratingButtonRef}
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.overRating ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={(e) => {
                e.stopPropagation()
                setRatingDropdownOpen(!ratingDropdownOpen)
              }}
            >
              {getRatingLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {ratingDropdownOpen && (
              <div
                ref={ratingDropdownPositionedRef}
                className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-bold mb-6">Ratings</h3>
                <div className="mb-6">
                  <div className="font-medium mb-4">{selectedRating ? `Over ${selectedRating}` : "Over 4.5"}</div>
                  <div className="relative flex items-center justify-between mb-2">
                    <div className="absolute w-full h-[2px] bg-gray-300"></div>
                    {[4.5, 4.6, 4.7, 4.8, 4.9].map((rating) => (
                      <button
                        key={rating}
                        className={`relative z-10 w-6 h-6 rounded-full ${
                          selectedRating === rating ? "bg-black" : "bg-gray-300"
                        } flex items-center justify-center`}
                        onClick={() => handleRatingSelect(rating)}
                      >
                        {selectedRating === rating && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>4.5</span>
                    <span>4.6</span>
                    <span>4.7</span>
                    <span>4.8</span>
                    <span>4.9</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="text-gray-900 font-medium" onClick={resetRatingFilter}>
                    Reset
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                    onClick={applyRatingFilter}
                  >
                    View Results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Location Filter */}
          {/* {!isGrocery && (
            <div className="relative">
              <button
                ref={locationButtonRef}
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.location ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } flex items-center gap-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  setLocationDropdownOpen(!locationDropdownOpen)
                  setRatingDropdownOpen(false)
                  setPriceDropdownOpen(false)
                  setCuisineDropdownOpen(false)
                  setDietaryDropdownOpen(false)
                }}
              >
                {getLocationLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {locationDropdownOpen && (
                <div
                  ref={locationDropdownPositionedRef}
                  className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold mb-6">Location</h3>
                  <div className="space-y-2 mb-6">
                    {[
                      { value: "under-1mi", label: "Under 1 mi" },
                      { value: "under-3mi", label: "Under 3 mi" },
                      { value: "under-5mi", label: "Under 5 mi" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium ${
                          selectedLocation === option.value
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                        onClick={() => handleLocationSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button className="text-gray-900 font-medium" onClick={resetLocationFilter}>
                      Reset
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                      onClick={applyLocationFilter}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          )} */}

          {/* Cuisine Filter */}
          {!isGrocery && !hideCuisineFilter && (
            <div className="relative">
              <button
                ref={cuisineButtonRef}
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.cuisine && filters.cuisine.length > 0
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } flex items-center gap-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCuisineDropdownOpen(!cuisineDropdownOpen)
                  setRatingDropdownOpen(false)
                  setPriceDropdownOpen(false)
                  setLocationDropdownOpen(false)
                  setDietaryDropdownOpen(false)
                }}
              >
                {getCuisineLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {cuisineDropdownOpen && (
                <div
                  ref={cuisineDropdownPositionedRef}
                  className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg flex flex-col max-h-[500px]"
                >
                  <div className="p-6 pb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold mb-6">Cuisine</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">
                    <div className="space-y-2">
                      {[
                        "American",
                        "Italian",
                        "Asian",
                        "Mexican",
                        "Chinese",
                        "Japanese",
                        "Indian",
                        "Thai",
                        "Mediterranean",
                        "French",
                        "Greek",
                        "Korean",
                        "Vietnamese",
                        "Middle Eastern",
                        "Spanish",
                        "Seafood",
                        "Steakhouse",
                        "Pizza",
                        "Fast Food",
                        "Barbecue",
                      ].map((cuisine) => (
                        <button
                          key={cuisine}
                          className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium flex items-center justify-between ${
                            selectedCuisines.includes(cuisine)
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          }`}
                          onClick={() => handleCuisineToggle(cuisine)}
                        >
                          <span>{cuisine}</span>
                          {selectedCuisines.includes(cuisine) && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between p-6 pt-4 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-lg">
                    <button className="text-gray-900 font-medium" onClick={resetCuisineFilter}>
                      Reset
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                      onClick={applyCuisineFilter}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dietary Preferences Filter */}
          {!isGrocery && !hideDietaryFilter && (
            <div className="relative">
              <button
                ref={dietaryButtonRef}
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.dietaryPreferences && filters.dietaryPreferences.length > 0
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } flex items-center gap-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  setDietaryDropdownOpen(!dietaryDropdownOpen)
                  setRatingDropdownOpen(false)
                  setPriceDropdownOpen(false)
                  setLocationDropdownOpen(false)
                  setCuisineDropdownOpen(false)
                }}
              >
                {getDietaryLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {dietaryDropdownOpen && (
                <div
                  ref={dietaryDropdownPositionedRef}
                  className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg flex flex-col max-h-[500px]"
                >
                  <div className="p-6 pb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold mb-6">Dietary Preferences</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">
                    <div className="space-y-2">
                      {[
                        "Vegan",
                        "Vegetarian",
                        "Gluten-free",
                        "Halal",
                        "Kosher",
                        "Dairy-free",
                        "Nut-free",
                        "Low-carb",
                        "Keto-friendly",
                      ].map((dietary) => (
                        <button
                          key={dietary}
                          className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium flex items-center justify-between ${
                            selectedDietaryPreferences.includes(dietary)
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          }`}
                          onClick={() => handleDietaryToggle(dietary)}
                        >
                          <span>{dietary}</span>
                          {selectedDietaryPreferences.includes(dietary) && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between p-6 pt-4 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-lg">
                    <button className="text-gray-900 font-medium" onClick={resetDietaryFilter}>
                      Reset
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                      onClick={applyDietaryFilter}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showPriceFilter && (
            <div className="relative">
              <button
                ref={priceButtonRef}
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.price && filters.price.length > 0
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } flex items-center gap-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  setPriceDropdownOpen(!priceDropdownOpen)
                }}
              >
                {getPriceLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {priceDropdownOpen && (
                <div
                  ref={priceDropdownPositionedRef}
                  className="fixed z-50 w-[400px] bg-white rounded-lg shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold mb-6">Price</h3>
                  <div className="flex gap-3 mb-6">
                    {["$", "$$", "$$$", "$$$$"].map((price) => (
                      <button
                        key={price}
                        className={`px-6 py-2 rounded-full text-sm font-medium ${
                          selectedPrices.includes(price)
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                        onClick={() => handlePriceToggle(price)}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button className="text-gray-900 font-medium" onClick={resetPriceFilter}>
                      Reset
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                      onClick={applyPriceFilter}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
)

FilterOptions.displayName = "FilterOptions"

export default FilterOptions
