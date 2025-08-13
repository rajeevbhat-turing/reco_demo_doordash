"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { restaurants } from "@/constants/restaurants"
import type { FilterState } from "@/components/filter-options"
import { filterRestaurantsWithMenuItems } from "@/utils/restaurant-utils"

interface NationalFavoritesProps {
  activeFilters: FilterState
}

export default function NationalFavorites({ activeFilters }: NationalFavoritesProps) {
  // Only include restaurants with menu items
  const restaurantsWithMenus = filterRestaurantsWithMenuItems(restaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurantsWithMenus)
  const [resultsCount, setResultsCount] = useState(restaurantsWithMenus.length)

  useEffect(() => {
    let filteredRestaurants = [...restaurantsWithMenus]

    // Apply filters
    if (activeFilters.underThirtyMins) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => {
        const timeMatch = restaurant.time.match(/(\d+)/)
        const deliveryTime = timeMatch ? parseInt(timeMatch[1]) : 60
        return deliveryTime <= 30
      })
    }

    if (activeFilters.deals) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.discount && restaurant.discount.length > 0)
    }

    if (activeFilters.overRating) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.rating >= activeFilters.overRating!)
    }

    if (activeFilters.price && activeFilters.price.length > 0) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        activeFilters.price!.includes(restaurant.priceRange)
      )
    }

    if (activeFilters.dashPass) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.dashPass)
    }

    setFilteredRestaurants(filteredRestaurants)
    setResultsCount(filteredRestaurants.length)
  }, [activeFilters])

  const hasActiveFilters = () => {
    return (
      activeFilters.underThirtyMins ||
      activeFilters.deals ||
      activeFilters.overRating !== null ||
      (activeFilters.price !== null && activeFilters.price.length > 0) ||
      activeFilters.dashPass
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{resultsCount} results</h2>
        {hasActiveFilters() && (
          <button
            className="bg-gray-100 text-gray-900 font-medium text-sm rounded-full px-4 py-2"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        )}
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No restaurants match your filters</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters to see more options</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card overflow-hidden">
              <Link href={`/store/${restaurant.id}`} className="block">
                <div className="relative h-[200px] bg-gray-100">
                  <Image
                    src={
                      restaurant.banner || `/placeholder.svg?height=200&width=400&query=${restaurant.name} restaurant`
                    }
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
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
                  <span className="mt-1 p-1 rounded-sm bg-red-100 text-xs text-red-600 font-medium">{restaurant.discount}</span>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
