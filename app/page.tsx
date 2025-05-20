"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import FoodCategories from "@/components/food-categories"
import FilterOptions, { type FilterOptionsRef, type FilterState } from "@/components/filter-options"
import PromoBanners from "@/components/promo-banners"
import RestaurantSection from "@/components/restaurant-section"
import { restaurants } from "@/constants/restaurants"
import type { Restaurant } from "@/constants/restaurants"

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    underThirtyMins: false,
    schedule: false,
    scheduledTime: null,
    deals: false,
    pickup: false,
    overRating: null,
    price: null,
    dashPass: false,
  })
  const [allFilteredRestaurants, setAllFilteredRestaurants] = useState<Restaurant[]>([])
  const filterOptionsRef = useRef<FilterOptionsRef>(null)

  // Memoize the original restaurant sections to prevent recreating them on every render
  const nationalFavorites = useMemo(() => {
    return restaurants.filter((restaurant) => restaurant.featured).slice(0, 8)
  }, [])

  const fastestNearYou = useMemo(() => {
    return restaurants
      .filter((restaurant) => {
        const timeStr = restaurant.time
        const minutes = Number.parseInt(timeStr.match(/\d+/)?.[0] || "100")
        return minutes < 30
      })
      .sort((a, b) => {
        const timeA = Number.parseInt(a.time.match(/\d+/)?.[0] || "100")
        const timeB = Number.parseInt(b.time.match(/\d+/)?.[0] || "100")
        return timeA - timeB
      })
      .slice(0, 8)
  }, [])

  const dealsForYou = useMemo(() => {
    return restaurants.filter((restaurant) => restaurant.discount).slice(0, 8)
  }, [])

  const newOnDoorDash = useMemo(() => {
    return restaurants.filter((restaurant) => restaurant.new).slice(0, 8)
  }, [])

  const allStores = useMemo(() => {
    return restaurants.slice(0, 8)
  }, [])

  // Apply filters to all restaurants
  useEffect(() => {
    const applyFilters = (restaurantList: Restaurant[]): Restaurant[] => {
      let filtered = [...restaurantList]

      // Apply filters
      if (filters.underThirtyMins) {
        filtered = filtered.filter((restaurant) => {
          const timeStr = restaurant.time
          const minutes = Number.parseInt(timeStr.match(/\d+/)?.[0] || "100")
          return minutes < 30
        })
      }

      if (filters.overRating) {
        filtered = filtered.filter((restaurant) => restaurant.rating >= filters.overRating!)
      }

      if (filters.dashPass) {
        filtered = filtered.filter((restaurant) => restaurant.dashPass)
      }

      if (filters.price && filters.price.length > 0) {
        filtered = filtered.filter((restaurant) => filters.price!.includes(restaurant.priceRange))
      }

      // For demo purposes, we'll just simulate these filters
      if (filters.deals) {
        // Filter restaurants that have deals
        filtered = filtered.filter((restaurant) => restaurant.discount)
      }

      if (filters.pickup) {
        // For demo, we'll just take a different subset
        filtered = filtered.filter((_, index) => index % 3 === 0)
      }

      return filtered
    }

    // When filters are active, apply them to all restaurants
    if (hasActiveFilters()) {
      // Get unique restaurants from all sections
      const uniqueRestaurants = Array.from(
        new Map(
          [...nationalFavorites, ...fastestNearYou, ...dealsForYou, ...newOnDoorDash, ...allStores].map((item) => [
            item.id,
            item,
          ]),
        ).values(),
      )

      // Apply filters to all unique restaurants
      setAllFilteredRestaurants(applyFilters(uniqueRestaurants))
    } else {
      // Reset filtered restaurants when no filters are active
      setAllFilteredRestaurants([])
    }
  }, [filters, nationalFavorites, fastestNearYou, dealsForYou, newOnDoorDash, allStores])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Modify the handleReset function to avoid calling the child's resetFilters method
  const handleReset = () => {
    // Create a fresh filter state object
    const resetFilters = {
      underThirtyMins: false,
      schedule: false,
      scheduledTime: null,
      deals: false,
      pickup: false,
      overRating: null,
      price: null,
      dashPass: false,
    }

    // Update the state with the reset filters
    setFilters(resetFilters)

    // Don't call the child's resetFilters method to avoid circular dependencies
    // The child will update automatically through the filters prop
  }

  const hasActiveFilters = () => {
    return (
      filters.underThirtyMins ||
      filters.schedule ||
      filters.deals ||
      filters.pickup ||
      filters.overRating !== null ||
      (filters.price !== null && filters.price.length > 0) ||
      filters.dashPass
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-16">
      <FoodCategories />
      {/* Pass the current filters to the FilterOptions component */}
      <FilterOptions
        ref={filterOptionsRef}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        filters={filters}
      />
      {!hasActiveFilters() && <PromoBanners />}

      {/* Show filtered results when filters are active */}
      {hasActiveFilters() ? (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{allFilteredRestaurants.length} results</h2>
            <button
              onClick={handleReset}
              className="bg-gray-100 text-gray-900 font-medium text-sm rounded-full px-4 py-2"
            >
              Reset
            </button>
          </div>

          {allFilteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFilteredRestaurants.map((restaurant) => (
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
                            <svg
                              width="20"
                              height="12"
                              viewBox="0 0 20 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
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
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="ml-1">
                          <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                        </svg>
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
            <div className="mt-10 py-16 text-center bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">No restaurants match your filters</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters to see more options</p>
              <button
                onClick={handleReset}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show original sections when no filters are active
        <>
          <RestaurantSection
            title="National favourites"
            restaurants={nationalFavorites}
            seeAllLink="/category/national-favourites"
          />

          <RestaurantSection
            title="Fastest near you"
            restaurants={fastestNearYou}
            seeAllLink="/category/fastest-near-you"
          />

          <RestaurantSection title="Deals for you" restaurants={dealsForYou} seeAllLink="/category/deals" />

          <RestaurantSection title="New on DoorDash" restaurants={newOnDoorDash} seeAllLink="/category/new" />

          <RestaurantSection title="All stores" restaurants={allStores} seeAllLink="/browse" />
        </>
      )}
    </div>
  )
}
