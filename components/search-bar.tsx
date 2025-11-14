"use client"

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react"
import Image from "next/image"
import { Search, X, ArrowLeft, ChevronRight, Clock } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useRestaurants } from "@/lib/hooks/use-restaurants"
import { useUserStore } from "@/store/user-store"
import { useAppStore } from "@/store/app-store"
import { useVerifierStore } from "@/store/verifier-store"

interface SearchResult {
  id: string
  name: string
  logo: string
  description: string
  dashPass?: boolean
  type: "restaurant" | "menu-item"
  restaurantId?: string
  matchedItem?: string
  categories?: string[]
  priceRange?: string
}

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [previousPathname, setPreviousPathname] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { updateSearchResults, clearSearchResults } = useAppStore()
  const { recordSearch } = useVerifierStore()
  
  // Placeholder texts for rotation
  const placeholderTexts = [
    "Search DashDoor",
    "Search Presses Acai Bowls",
    "Search Papa Pasta",
    "Search Boichik Bagels"
  ]
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  
  // Get authentication status
  const isAuthenticated = useSyncExternalStore(
    useUserStore.subscribe,
    () => useUserStore.getState().isAuthenticated(),
    () => false // fallback for SSR
  )

  // Get user's address for location-based search
  const currentUser = useUserStore(state => state.currentUser)
  const tempAddress = useUserStore(state => state.getTempAddress())
  const defaultAddress = currentUser?.addresses?.find(a => a.default)
  const activeAddress = defaultAddress || tempAddress

  // Fetch restaurants near user's address
  const { data: restaurants } = useRestaurants(
    activeAddress?.lat,
    activeAddress?.lng,
    10 // 10 mile radius
  )

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedSearches = localStorage.getItem("recentSearches")
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches))
        }
      }
    } catch (error) {
      console.error("Error loading recent searches:", error)
      // Fallback to empty array if localStorage fails
      setRecentSearches([])
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return

    try {
      if (typeof window !== "undefined") {
        const updatedSearches = [
          term,
          ...recentSearches.filter((search) => search.toLowerCase() !== term.toLowerCase()),
        ].slice(0, 5)

        setRecentSearches(updatedSearches)
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
      }
    } catch (error) {
      console.error("Error saving recent search:", error)
      // Continue without saving if localStorage fails
    }
  }

  // Remove a specific recent search
  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the search when clicking X

    try {
      if (typeof window !== "undefined") {
        const updatedSearches = recentSearches.filter(
          (search) => search.toLowerCase() !== term.toLowerCase()
        )

        setRecentSearches(updatedSearches)
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
      }
    } catch (error) {
      console.error("Error removing recent search:", error)
      // Continue without removing if localStorage fails
    }
  }

  // State to hold all menu items for searching
  const [allMenuItems, setAllMenuItems] = useState<any[]>([])

  // Fetch menu items for all restaurants when restaurants are loaded
  useEffect(() => {
    const fetchAllMenuItems = async () => {
      if (!restaurants || restaurants.length === 0) return

      try {
        // Fetch menu items for all restaurants in parallel
        const menuPromises = restaurants.map(restaurant => 
          fetch(`/api/restaurants/${restaurant.id}/menu`)
            .then(res => res.json())
            .then(data => data.success ? data.data.menuItems : [])
            .catch(() => [])
        )

        const allMenus = await Promise.all(menuPromises)
        const flattenedMenuItems = allMenus.flat()
        setAllMenuItems(flattenedMenuItems)
      } catch (error) {
        console.error('Error fetching menu items:', error)
      }
    }

    fetchAllMenuItems()
  }, [restaurants])

  // Search for restaurants that serve specific menu items
  const searchByMenuItem = (searchTerm: string) => {
    if (!restaurants || allMenuItems.length === 0) return [];

    const lowerSearchTerm = searchTerm.toLowerCase()
    const matchingItems = allMenuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearchTerm)
        // || (item.description && item.description.toLowerCase().includes(lowerSearchTerm))
        // || (item.category_name && item.category_name.toLowerCase().includes(lowerSearchTerm)),
    )

    const restaurantMatches = new Map<string, { restaurant: any; items: string[] }>()
    
    matchingItems.forEach((item) => {
      const restaurant = restaurants.find((r) => r.id === item.restaurant_id || r.id === item.restaurantId)
      if (restaurant) {
        if (!restaurantMatches.has(restaurant.id)) {
          restaurantMatches.set(restaurant.id, { restaurant, items: [] })
        }
        restaurantMatches.get(restaurant.id)!.items.push(item.name)
      }
    })

    return Array.from(restaurantMatches.values()).map(({ restaurant, items }) => ({
      id: restaurant.id,
      name: restaurant.name,
      logo: restaurant.logo,
      description: `Known for: ${items.slice(0, 3).join(", ")}${items.length > 3 ? "..." : ""}`,
      dashPass: restaurant.dashPass,
      type: "menu-item" as const,
      restaurantId: restaurant.id,
      matchedItem: items[0],
      categories: restaurant.categories,
      priceRange: restaurant.priceRange,
    }))
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() && restaurants) {
      // Search restaurants by name and cuisine
      const restaurantResults = restaurants
        .filter((restaurant) => {
          return (
            restaurant.name.toLowerCase().includes(value.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(value.toLowerCase()) ||
            (restaurant.categories && restaurant.categories.some(category => 
              category.toLowerCase().includes(value.toLowerCase())
            ))
          )
        })
        .slice(0, 2)
        .map((restaurant) => ({
          id: restaurant.id,
          name: restaurant.name,
          logo: restaurant.logo,
          description: generateDescription(restaurant),
          dashPass: restaurant.dashPass,
          type: "restaurant" as const,
          matchedItem: undefined,
          categories: restaurant.categories,
          priceRange: restaurant.priceRange,
        }))





      // Search restaurants by menu items
      const menuItemResults = searchByMenuItem(value).slice(0, 2)

      // Combine results, prioritizing restaurant matches, then menu items
      console.log('🔍 Search results found:', {
        restaurants: restaurantResults.length,
        menuItems: menuItemResults.length
      })

      const combinedResults = [...restaurantResults, ...menuItemResults].slice(0, 5)

      // Generate search suggestions based on search term
      const suggestions = generateSearchSuggestions(value)

      setSearchResults(combinedResults as SearchResult[])
      setSearchSuggestions(suggestions)
      setIsSearchActive(true)

      // Update cart store with search results
      const cartSearchResults = combinedResults.map(result => {
        const baseResult = {
          id: result.id,
          name: result.name,
          logo: result.logo,
          description: result.description,
          dashPass: result.dashPass,
          type: result.type,
          restaurantId: result.id,
          matchedItem: result.matchedItem
        }
        
        // For restaurant results, include categories and priceRange from original data
        if (result.type === "restaurant" || result.type === "menu-item") {
          const originalRestaurant = restaurants.find(r => r.id === result.id)
          return {
            ...baseResult,
            categories: originalRestaurant?.categories,
            priceRange: originalRestaurant?.priceRange
          }
        }
        
        return baseResult
      })
      updateSearchResults(cartSearchResults)
    } else {
      setSearchResults([])
      setSearchSuggestions([])
      setIsSearchActive(!!recentSearches.length)

      // Clear cart store search results
      clearSearchResults()
    }
  }

  // Generate description for restaurant search results
  const generateDescription = (restaurant: any) => {
    // Create a description based on restaurant properties
    const tags = [restaurant.cuisine, "Popular items", "Fast delivery", "Highly rated"]

    return `${restaurant.cuisine} • ${restaurant.priceRange} • ${restaurant.time}`
  }

  // Generate search suggestions based on search term
  // Disabled: Auto-generated suggestions removed per user requirement
  const generateSearchSuggestions = (term: string) => {
    // Return empty array - no auto-generated suggestions
    return []
  }

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm)
      recordSearch(searchTerm)
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      setIsSearchActive(false)
    }
  }

  // Handle clicking on a search result
  const handleResultClick = (result: SearchResult) => {
    // Get the restaurant name to display in search bar
    const restaurantName = result.name
    
    // Update search bar with restaurant name
    setSearchTerm(restaurantName)
    saveRecentSearch(restaurantName)
    recordSearch(restaurantName)
    
    // Only restaurants are supported now
    router.push(`/store/${result.id}`)
    setIsSearchActive(false)
  }

  // Handle clicking on a search suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    saveRecentSearch(suggestion)
    recordSearch(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setIsSearchActive(false)
  }

  // Handle clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus the search input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchActive])

  // Rotate placeholder texts every 2 seconds
  // Only rotate when input is empty and search bar is not active
  useEffect(() => {
    // Don't rotate if user is typing or search bar is active
    if (searchTerm.trim() || isSearchActive) {
      return
    }

    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholderTexts.length)
    }, 2000) // 2 seconds

    return () => clearInterval(interval)
  }, [searchTerm, isSearchActive, placeholderTexts.length])

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setSearchSuggestions([])
    setIsSearchActive(false)
    clearSearchResults()
    
    if (searchInputRef.current) {
      searchInputRef.current.blur() // Remove focus instead of focusing
    }
  }

  // Go back (close search and navigate to previous page)
  const goBack = () => {
    setIsSearchActive(false)
    setSearchTerm("")
    clearSearchResults()
    
    // If currently on search page, navigate to home page
    if (pathname === "/search") {
      router.push(isAuthenticated ? "/home" : "/")
    } 
    // Otherwise, navigate back to the previous page if it exists and is different from current
    else if (previousPathname && previousPathname !== pathname) {
      // If previous pathname is "/" and user is authenticated, navigate to "/home" instead
      const targetPath = previousPathname === "/" && isAuthenticated ? "/home" : previousPathname
      router.push(targetPath)
    }
  }

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div
          className={`flex items-center bg-gray-100 rounded-full transition-all h-8 ${
            isSearchActive ? 'bg-white border border-black' : ''
          }`}
        >
          {isSearchActive ? (
            <button
              type="button"
              onClick={goBack}
              className="pl-3 pr-1 text-black hover:text-gray-700 focus:outline-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black" />
            </div>
          )}
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholderTexts[currentPlaceholderIndex]}
            className={`block w-full bg-transparent ${
              isSearchActive ? "pl-2 pr-10" : "pl-10 pr-10"
            } text-sm focus:outline-none`}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              // Store the current pathname when search is activated
              if (!isSearchActive) {
                setPreviousPathname(pathname)
              }
              setIsSearchActive(true)
            }}
          />
          {/* Cross icon - always visible for better UX */}
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 text-black hover:text-gray-700 focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Search dropdown */}
      {isSearchActive && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Restaurant and Menu Item results */}
          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                      <Image
                        src={result.logo || "/placeholder.svg?height=40&width=40&query=restaurant logo"}
                        alt={result.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 mr-2">{result.name}</h4>
                        {result.dashPass && (
                          <svg
                            width="16"
                            height="10"
                            viewBox="0 0 20 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-teal-600"
                          >
                            <path
                              d="M18.5 1.5L11.5 9.5L7.5 5.5L1.5 10.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {result.type === "menu-item" && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-2">
                            Menu Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{result.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {searchTerm &&
            searchResults.length === 0 &&
            searchSuggestions.length === 0 &&
            recentSearches.length === 0 && (
              <div className="p-4 text-center text-gray-500">No results found for {searchTerm}</div>
            )}

          {/* Recent searches - Show when search is active and there are recent searches */}
          {recentSearches.length > 0 && (
            <div className={searchTerm || searchResults.length > 0 ? "border-t border-gray-200" : ""}>
              {/* Recent Searches Heading */}
              <div className="px-3 pt-3 pb-2">
                <h3 className="text-sm font-semibold text-gray-900">Recent Searches</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <Clock className="h-5 w-5 text-gray-900 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate">{search}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(search, e)}
                        className="ml-3 p-1 hover:bg-gray-200 rounded flex-shrink-0"
                        aria-label={`Remove ${search} from recent searches`}
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
