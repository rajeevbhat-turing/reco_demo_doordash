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
import { CartProvider } from "@/context/cart-context"
import { useCartStore } from "@/store/cart-store"

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { updateSearchResults, clearSearchResults } = useCartStore()

  // Get cart store to set category
  const cartStore = useCartStore()

  // Set the category to restaurant when component mounts
  useEffect(() => {
    cartStore.setCategory("restaurant")
  }, [])

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
    // Scroll to top when a category is selected
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
    return restaurants
  }, [])

  // Apply filters to all restaurants
  useEffect(() => {
    const applyFilters = (restaurantList: Restaurant[]): Restaurant[] => {
      let filtered = [...restaurantList]
      console.log("filtered", filtered)

      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter((restaurant) => {
          // Check if restaurant has categories array and if it includes the selected category
          if (restaurant.categories && restaurant.categories.length > 0) {
            // Convert category names to IDs for comparison (e.g., "Fast Food" -> "fast-food")
            const categoryId = selectedCategory.toLowerCase().replace(/\s+/g, '-');
            return restaurant.categories.includes(categoryId);
          }

          // Fallback to the old logic for backward compatibility
          // Match category to cuisine
          if (restaurant.cuisine.toLowerCase() === selectedCategory.toLowerCase()) {
            return true
          }
          // For Fast Food category, include restaurants with $ price range
          if (selectedCategory === "Fast Food" && restaurant.priceRange === "$") {
            return true
          }
          // For Comfort Food, include restaurants with certain cuisines
          if (selectedCategory === "Comfort Food" && ["American", "Italian", "Burgers"].includes(restaurant.cuisine)) {
            return true
          }
          return false
        })
      }

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
      updateSearchResults(allFilteredRestaurants)
    } else {
      // Reset filtered restaurants when no filters are active
      setAllFilteredRestaurants([])
      clearSearchResults();
    }
  }, [filters, nationalFavorites, fastestNearYou, dealsForYou, newOnDoorDash, allStores, selectedCategory])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)

    // Apply filters to restaurants
    let filteredRestaurants = [...restaurants]

    // Filter by category if selected
    if (selectedCategory) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        restaurant.categories?.some((cat) => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      )
    }

    // Apply other filters
    if (newFilters.underThirtyMins) {
      // Filter by delivery time (using the time string from restaurant data)
      filteredRestaurants = filteredRestaurants.filter((restaurant) => {
        const timeMatch = restaurant.time.match(/(\d+)/)
        const deliveryTime = timeMatch ? parseInt(timeMatch[1]) : 60
        return deliveryTime <= 30
      })
    }

    if (newFilters.deals) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.discount && restaurant.discount.length > 0)
    }

    if (newFilters.overRating) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.rating >= newFilters.overRating!)
    }

    if (newFilters.price && newFilters.price.length > 0) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) =>
        newFilters.price!.includes(restaurant.priceRange)
      )
    }

    if (newFilters.dashPass) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.dashPass)
    }

    setAllFilteredRestaurants(filteredRestaurants)
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
    setSelectedCategory(null)
    clearSearchResults();
  }

  const hasActiveFilters = () => {
    return (
      selectedCategory !== null ||
      filters.underThirtyMins ||
      filters.deals ||
      filters.overRating !== null ||
      (filters.price !== null && filters.price.length > 0) ||
      filters.dashPass
    )
  }

  return (
    <CartProvider category="restaurant">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="pt-16">
          <FoodCategories selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
        </div>
        {/* Pass the current filters to the FilterOptions component */}
        <FilterOptions
          ref={filterOptionsRef}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          filters={filters}
        />
        <div className="mt-4">
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
              />

              <RestaurantSection
                title="Fastest near you"
                restaurants={fastestNearYou}
              />

              <RestaurantSection
                title="Deals for you"
                restaurants={dealsForYou}
              />

              <RestaurantSection
                title="New on DoorDash"
                restaurants={newOnDoorDash}
              />

              <RestaurantSection
                title="All stores"
                restaurants={allStores}
              />
            </>
          )}
        </div>
      </div>
    </CartProvider>
  )
}
