"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import { useCartStore } from "@/store/cart-store"
import { useVerifierStore } from "@/store/verifier-store"
import { useAppStore } from "@/store/app-store"
import { performSearch, isOnlySpecialCharacters, type SearchResultRestaurant } from "@/lib/utils/search-utils"
import { applySearchFilters, determineSearchContext, detectAvailableCategories, filterByCategory } from "@/lib/utils/search-filter-utils"
import SearchResultsRenderer from "@/components/search/SearchResultsRenderer"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  
  console.log('🚀 SearchPage rendered with query:', query)
  const [searchResults, setSearchResults] = useState<SearchResultRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hideCuisineFilter, setHideCuisineFilter] = useState(false)
  const [hideDietaryFilter, setHideDietaryFilter] = useState(false)
  const [originalHasProducts, setOriginalHasProducts] = useState(false)
  const [originalHasRestaurants, setOriginalHasRestaurants] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [allFilteredResults, setAllFilteredResults] = useState<SearchResultRestaurant[]>([])
  const { addItem } = useCartStore()
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null, // DEPRECATED
    minPrice: null,
    maxPrice: null,
    dashPass: false,
    location: null,
    cuisine: null,
    dietaryPreferences: null,
  })
  const { updateSearchResults, clearSearchResults } = useAppStore()
  const { recordSearch } = useVerifierStore()

  // Handle filter changes
  const handleFilterChange = (filters: FilterState) => {
    console.log(`[SEARCH] Filter change detected:`, filters);
    console.log(`[SEARCH] Previous activeFilters:`, activeFilters);
    setActiveFilters(filters);
  };

  // Debug activeFilters changes
  useEffect(() => {
    console.log(`[SEARCH] activeFilters changed:`, activeFilters);
  }, [activeFilters]);

  // Track previous query to detect query changes
  const prevQueryRef = useRef<string>("")

  useEffect(() => {
    // Reset filter visibility only when query changes (not when filters change)
    const queryChanged = prevQueryRef.current !== query
    if (queryChanged) {
      setHideCuisineFilter(false)
      setHideDietaryFilter(false)
      setSelectedCategory("All") // Reset to "All" when query changes
      prevQueryRef.current = query
    }
    
    // Simulate loading
    setIsLoading(true)

    // Handle special characters: if query contains only special characters, show no results
    if (isOnlySpecialCharacters(query)) {
      setSearchResults([])
      setAllFilteredResults([])
      setAvailableCategories([])
      setIsLoading(false)
      return
    }
    
    // Perform search
    const combinedResults = performSearch(query)
    
    // Check if original results had products or restaurants (for empty state messages)
    const hasProducts = combinedResults.some(r => r.id.includes("-product-"))
    const hasRestaurants = combinedResults.some(r => !r.id.includes("-product-") && (r.matchType === "restaurant" || !r.storeType))
    setOriginalHasProducts(hasProducts)
    setOriginalHasRestaurants(hasRestaurants)
    
    // Determine search context based on ORIGINAL results (before filtering) to hide irrelevant filters
    // This ensures context doesn't change when filters are applied
    const searchContext = determineSearchContext(combinedResults)
    
    // Detect available categories from combinedResults (before filtering)
    const categories = detectAvailableCategories(combinedResults)
    setAvailableCategories(categories)
    
    // Store search context for FilterOptions
    // Always use the context detected from original results to ensure consistency
    setHideCuisineFilter(searchContext.hideCuisine)
    setHideDietaryFilter(searchContext.hideDietary)
    
    // Convert results to SearchResult format for cart store (immediate update for verifier)
    const immediateCartSearchResults = combinedResults.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      logo: restaurant.logo || "",
      description: restaurant.cuisine,
      dashPass: restaurant.dashPass,
      type: restaurant.storeType === "grocery" || restaurant.storeType === "pets" || restaurant.storeType === "pet-product" || restaurant.storeType === "convenience" ? "restaurant" as const : "restaurant" as const,
      restaurantId: restaurant.id,
      matchedItem: restaurant.matchType === "menu-item" || restaurant.matchType === "pet-product" || restaurant.matchType === "convenience" ? restaurant.matchedItems?.[0] : undefined,
      categories: restaurant.categories,
      priceRange: restaurant.priceRange
    }))
    
    console.log(`[SEARCH] Immediate update with ${immediateCartSearchResults.length} results`);
    updateSearchResults(immediateCartSearchResults)

    // Simulate API delay and apply filters
    const timer = setTimeout(() => {
      // Apply filters to search results
      const filteredResults = applySearchFilters(combinedResults, activeFilters)
      
      // Convert results to SearchResult format for cart store
      const cartSearchResults = filteredResults.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo || "",
        description: restaurant.cuisine,
        dashPass: restaurant.dashPass,
        type: restaurant.storeType === "grocery" || restaurant.storeType === "pets" || restaurant.storeType === "pet-product" || restaurant.storeType === "convenience" ? "restaurant" as const : "restaurant" as const,
        restaurantId: restaurant.id,
        matchedItem: restaurant.matchType === "menu-item" || restaurant.matchType === "pet-product" || restaurant.matchType === "convenience" ? restaurant.matchedItems?.[0] : undefined,
        categories: restaurant.categories,
        priceRange: restaurant.priceRange
      }))
      
      console.log(`[SEARCH] Updating cart store with ${cartSearchResults.length} results`);
      console.log(`[SEARCH] Sample result:`, cartSearchResults[0]);
      updateSearchResults(cartSearchResults)
      
      // Store all filtered results (before category filtering)
      setAllFilteredResults(filteredResults)
      setIsLoading(false)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [query, activeFilters, updateSearchResults])

  // Apply category filtering when selectedCategory or allFilteredResults changes
  useEffect(() => {
    if (allFilteredResults.length === 0) {
      setSearchResults([])
      return
    }
    
    // Filter results based on selected category
    const categoryFilteredResults = filterByCategory(allFilteredResults, selectedCategory)
    
    setSearchResults(categoryFilteredResults)
  }, [selectedCategory, allFilteredResults])

  useEffect(() => {
    return () => {
      clearSearchResults()
    }
  }, [clearSearchResults])

  // Save search to recent searches
  useEffect(() => {
    if (query) {
      try {
        if (typeof window !== 'undefined') {
          const savedSearches = localStorage.getItem("recentSearches")
          let recentSearches = savedSearches ? JSON.parse(savedSearches) : []

          // Add current search to recent searches if not already present
          if (!recentSearches.includes(query)) {
            recentSearches = [query, ...recentSearches].slice(0, 5)
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
          }
        }
      } catch (error) {
        console.error('Error saving search to recent searches:', error)
        // Continue without saving if localStorage fails
      }
    }
  }, [query])

  // Record search in cart store for verifier tracking
  useEffect(() => {
    if (query) {
      recordSearch(query)
    }
  }, [query, recordSearch])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search results for "{query}"</h1>
        <div className="text-sm text-gray-600">
          {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="mb-6">
        <FilterOptions 
          isGrocery={false} 
          onFilterChange={handleFilterChange}
          filters={activeFilters}
          hideCuisineFilter={hideCuisineFilter}
          hideDietaryFilter={hideDietaryFilter}
        />
      </div>

      {/* Category Tabs - Only show if there are multiple categories */}
      {!isLoading && availableCategories.length > 1 && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-8">
          <SearchResultsRenderer results={searchResults} />
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {/* Check if price filter is active and show appropriate message */}
          {(activeFilters.minPrice != null || activeFilters.maxPrice != null) ? (
            <>
              {(() => {
                if (originalHasProducts && !originalHasRestaurants) {
                  return <h3 className="text-lg font-medium text-gray-700">No products match your price</h3>
                } else if (originalHasRestaurants && !originalHasProducts) {
                  return <h3 className="text-lg font-medium text-gray-700">No restaurants match your price</h3>
                } else {
                  return <h3 className="text-lg font-medium text-gray-700">No results match your price</h3>
                }
              })()}
              <p className="text-gray-500 mt-2">
                Try adjusting your price range or browse other options
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-2">
                Try searching for something else or browse our categories to discover great restaurants
              </p>
            </>
          )}
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
