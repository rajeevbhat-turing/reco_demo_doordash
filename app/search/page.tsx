"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { restaurants } from "@/constants/restaurants"
import type { Restaurant } from "@/constants/restaurants"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchResults, setSearchResults] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)

    // Filter restaurants based on search query
    const filteredResults = restaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
      )
    })

    // Simulate API delay
    const timer = setTimeout(() => {
      setSearchResults(filteredResults)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  // Save search to recent searches
  useEffect(() => {
    if (query) {
      const savedSearches = localStorage.getItem("recentSearches")
      let recentSearches = savedSearches ? JSON.parse(savedSearches) : []

      // Add current search to recent searches if not already present
      if (!recentSearches.includes(query)) {
        recentSearches = [query, ...recentSearches].slice(0, 5)
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
      }
    }
  }, [query])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <Link href={`/store/${restaurant.id}`} className="block">
                <div className="relative h-[200px] bg-gray-100">
                  <Image
                    src={
                      restaurant.banner ||
                      `/placeholder.svg?height=200&width=400&query=${restaurant.name || "/placeholder.svg"} restaurant`
                    }
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  {restaurant.new && (
                    <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </div>
                  )}
                </div>
              </Link>

              <div className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                    {restaurant.dashPass && (
                      <div className="text-teal-600">
                        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M18.5 1.5L11.5 9.5L7.5 5.5L1.5 10.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Heart className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex items-center mt-1 text-sm text-gray-700 flex-wrap">
                  <div className="flex items-center">
                    <span className="font-semibold">{restaurant.rating}</span>
                    <Star className="h-4 w-4 ml-1 text-gray-700 fill-current" />
                  </div>
                  <span className="mx-1">({restaurant.reviews})</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.distance}</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.time}</span>
                </div>

                <div className="mt-1 text-sm text-gray-500">{restaurant.deliveryFee}</div>

                {restaurant.discount && (
                  <div className="mt-1 text-sm text-red-600 font-medium">{restaurant.discount}</div>
                )}

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">Try searching for something else</p>
        </div>
      )}
    </div>
  )
}
