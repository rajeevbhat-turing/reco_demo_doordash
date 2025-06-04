"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Search, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { restaurants } from "@/constants/restaurants"
import { menuItems } from "@/constants/menu-items"
import { getAllStores } from "@/app/grocery/data/retail-response-mapper"
import { useCartStore } from "@/store/cart-store"

interface SearchResult {
  id: string
  name: string
  logo: string
  description: string
  dashPass?: boolean
  type: "restaurant" | "menu-item" | "grocery"
  restaurantId?: string
  matchedItem?: string
}

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { updateSearchResults, clearSearchResults, recordSearch } = useCartStore()

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

  // Search for restaurants that serve specific menu items
  const searchByMenuItem = (searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const matchingItems = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
        item.category.toLowerCase().includes(lowerSearchTerm),
    )

    const restaurantMatches = new Map<string, { restaurant: any; items: string[] }>()

    matchingItems.forEach((item) => {
      const restaurant = restaurants.find((r) => r.id === item.restaurantId)
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
    }))
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim()) {
      // Search restaurants by name and cuisine
      const restaurantResults = restaurants
        .filter((restaurant) => {
          return (
            restaurant.name.toLowerCase().includes(value.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(value.toLowerCase())
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
        }))

      // Search grocery stores by name
      const groceryStores = getAllStores()
      const groceryResults = groceryStores
        .filter((store) => {
          return store.name.toLowerCase().includes(value.toLowerCase())
        })
        .slice(0, 2)
        .map((store) => ({
          id: `grocery-${store.id}`,
          name: store.name,
          logo: store.image,
          description: `${store.time} • ${store.delivery} • ★ ${store.rating}`,
          dashPass: false,
          type: "grocery" as const,
          matchedItem: undefined,
        }))

      // Search restaurants by menu items
      const menuItemResults = searchByMenuItem(value).slice(0, 2)

      // Combine results, prioritizing restaurant matches, then grocery, then menu items
      const combinedResults = [...restaurantResults, ...groceryResults, ...menuItemResults].slice(0, 5)

      // Generate search suggestions based on search term
      const suggestions = generateSearchSuggestions(value)

      setSearchResults(combinedResults)
      setSearchSuggestions(suggestions)
      setIsSearchActive(true)

      // Update cart store with search results (convert all to restaurant format for compatibility)
      const cartSearchResults = combinedResults.map(result => ({
        id: result.id,
        name: result.name,
        logo: result.logo,
        description: result.description,
        dashPass: result.dashPass,
        type: result.type === "grocery" ? "restaurant" as const : result.type,
        restaurantId: result.id,
        matchedItem: result.matchedItem
      }))
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
  const generateSearchSuggestions = (term: string) => {
    const foodCategories = [
      "burgers",
      "pizza",
      "coffee",
      "sushi",
      "chicken",
      "salad",
      "desserts",
      "breakfast",
      "lunch",
      "dinner",
      "healthy",
      "fast food",
      "asian",
      "italian",
    ]

    const locationSuggestions = [`${term} near me`, `${term} delivery`, `${term} restaurant`, `${term} takeaway`]

    const foodSuggestions = foodCategories
      .filter((category) => category.includes(term.toLowerCase()) || term.toLowerCase().includes(category))
      .map((category) => category)

    const allSuggestions = [term, ...locationSuggestions, ...foodSuggestions, `best ${term}`, `${term} deals`]

    return allSuggestions.slice(0, 5)
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
    saveRecentSearch(searchTerm)
    recordSearch(searchTerm)
    
    if (result.type === "grocery") {
      // Extract the actual grocery store ID (remove "grocery-" prefix)
      const actualId = result.id.replace("grocery-", "")
      router.push(`/grocery/store/${actualId}`)
    } else {
      router.push(`/store/${result.id}`)
    }
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

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setSearchSuggestions([])
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Go back (close search)
  const goBack = () => {
    setIsSearchActive(false)
    setSearchTerm("")
    clearSearchResults()
  }

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div
          className={`flex items-center bg-gray-100 rounded-full transition-all ${
            isSearchActive ? "bg-white border border-gray-300" : ""
          }`}
        >
          {isSearchActive ? (
            <button
              type="button"
              onClick={goBack}
              className="pl-3 pr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search DashDoor"
            className={`block w-full bg-transparent py-2 ${
              isSearchActive ? "pl-2 pr-10" : "pl-10 pr-3"
            } text-sm focus:outline-none`}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchActive(true)}
          />
          {searchTerm && isSearchActive && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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

          {/* Search suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="divide-y divide-gray-100">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSuggestionClick(search)}
                >
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{search}</span>
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
              <div className="p-4 text-center text-gray-500">No results found for "{searchTerm}"</div>
            )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
