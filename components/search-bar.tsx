"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Search, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { restaurants } from "@/constants/restaurants"

interface SearchResult {
  id: string
  name: string
  logo: string
  description: string
  dashPass?: boolean
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

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return

    const updatedSearches = [
      term,
      ...recentSearches.filter((search) => search.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 5)

    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim()) {
      // Filter restaurants based on search term
      const filteredRestaurants = restaurants
        .filter((restaurant) => {
          return (
            restaurant.name.toLowerCase().includes(value.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(value.toLowerCase())
          )
        })
        .slice(0, 5)
        .map((restaurant) => ({
          id: restaurant.id,
          name: restaurant.name,
          logo: restaurant.logo,
          description: generateDescription(restaurant),
          dashPass: restaurant.dashPass,
        }))

      // Generate search suggestions based on search term
      const suggestions = generateSearchSuggestions(value)

      setSearchResults(filteredRestaurants)
      setSearchSuggestions(suggestions)
      setIsSearchActive(true)
    } else {
      setSearchResults([])
      setSearchSuggestions([])
      setIsSearchActive(!!recentSearches.length)
    }
  }

  // Generate description for restaurant search results
  const generateDescription = (restaurant: any) => {
    // Create a description based on restaurant properties
    const tags = [
      restaurant.cuisine,
      "Chicken",
      "Burgers",
      "Sandwiches",
      "Fried Chicken",
      "Wraps",
      "Nuggets",
      "Rice Bowl",
      "Noodles",
      "Seafood",
      "Lamb",
      "Dessert",
      "Fast Food",
      "Family Friendly",
    ]
      .filter((tag) => Math.random() > 0.5) // Randomly select some tags
      .slice(0, 6) // Limit to 6 tags

    // Ensure cuisine is always included
    if (!tags.includes(restaurant.cuisine)) {
      tags.unshift(restaurant.cuisine)
    }

    return tags.join(", ")
  }

  // Generate search suggestions based on search term
  const generateSearchSuggestions = (term: string) => {
    const commonSuggestions = [
      `${term}`,
      `${term} delivery`,
      `${term} near me`,
      `${term} restaurant`,
      `${term} takeaway`,
      `${term} fast food`,
      `grilled ${term}`,
      `fried ${term}`,
      `${term} burger`,
      `${term} sandwich`,
      `${term} wrap`,
      `${term} salad`,
      `${term} bowl`,
      `${term} meal`,
      `${term} combo`,
      `${term} special`,
      `${term} royale`,
      `honey ${term}`,
      `spicy ${term}`,
      `${term} breast`,
    ]

    // Filter suggestions that include the search term
    return commonSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(term.toLowerCase())).slice(0, 5)
  }

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm)
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      setIsSearchActive(false)
    }
  }

  // Handle clicking on a search result
  const handleResultClick = (id: string) => {
    saveRecentSearch(searchTerm)
    router.push(`/store/${id}`)
    setIsSearchActive(false)
  }

  // Handle clicking on a search suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    saveRecentSearch(suggestion)
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
            placeholder="Search DoorDash"
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
          {/* Restaurant results */}
          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleResultClick(result.id)}
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
