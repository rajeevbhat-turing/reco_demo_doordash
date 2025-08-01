"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ArrowLeft } from "lucide-react"
import { restaurants } from "@/constants/restaurants"
import { menuItems } from "@/constants/menu-items"
import { getAllStores } from "@/app/grocery/data/retail-response-mapper"
import { getAllStores as getConvenienceStores } from "@/app/convenience/data/convenience-response-mapper"
import { getAllPetStores, getEnrichedPetProducts } from "@/app/pets/data/pet-response-mapper"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import type { Restaurant } from "@/constants/restaurants"
import { useCartStore } from "@/store/cart-store"
import { getDefaultRating } from "@/utils/rating-utils"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SearchResultRestaurant extends Restaurant {
  matchType: "restaurant" | "menu-item" | "grocery" | "pets" | "pet-product" | "convenience"
  matchedItems?: string[]
  storeType?: "grocery" | "pets" | "pet-product" | "convenience"
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchResults, setSearchResults] = useState<SearchResultRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null,
    dashPass: false,
  })
  const { updateSearchResults, clearSearchResults, recordSearch } = useCartStore()

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

  // Search for restaurants that serve specific menu items
  const searchByMenuItem = (searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    const matchingItems = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
        item.category.toLowerCase().includes(lowerSearchTerm),
    )

    const restaurantMatches = new Map<string, { restaurant: Restaurant; items: string[] }>()

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
      ...restaurant,
      matchType: "menu-item" as const,
      matchedItems: items,
    }))
  }

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)

    // Search restaurants by name and cuisine
    const restaurantResults = restaurants
      .filter((restaurant) => {
        return (
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
        )
      })
      .map((restaurant) => ({
        ...restaurant,
        matchType: "restaurant" as const,
      }))

    // Search grocery stores by name
    const groceryStores = getAllStores()
    const groceryResults = groceryStores
      .filter((store) => {
        return store.name.toLowerCase().includes(query.toLowerCase())
      })
      .map((store) => ({
        id: `grocery-${store.id}`,
        name: store.name,
        logo: store.image,
        banner: store.image,
        detailsBanner: store.image,
        cuisine: "Grocery Store",
        priceRange: "$",
        time: store.time,
        distance: "Nearby",
        deliveryFee: store.delivery,
        rating: parseFloat(store.rating),
        reviews: store.numRatings,
        dashPass: false,
        new: false,
        discount: store.discount || undefined,
        isOpen: store.open,
        openingHours: store.openTime || "9:00 AM - 9:00 PM",
        address: "Local Area",
        phone: "(555) 123-4567",
        categories: ["grocery"],
        matchType: "grocery" as const,
        storeType: "grocery" as const,
      }))

    // Search convenience stores by name
    const convenienceStores = getConvenienceStores()
    const convenienceResults = convenienceStores
      .filter((store) => {
        return store.name.toLowerCase().includes(query.toLowerCase())
      })
      .map((store) => ({
        id: `convenience-${store.id}`,
        name: store.name,
        logo: store.image,
        banner: store.image,
        detailsBanner: store.image,
        cuisine: "Convenience Store",
        priceRange: "$",
        time: store.time,
        distance: "Nearby",
        deliveryFee: store.delivery,
        rating: parseFloat(store.rating),
        reviews: store.numRatings,
        dashPass: store.isDashPass,
        new: false,
        discount: store.discount || undefined,
        isOpen: store.open,
        openingHours: store.openTime || "9:00 AM - 9:00 PM",
        address: "Local Area",
        phone: "(555) 123-4567",
        categories: ["convenience"],
        matchType: "convenience" as const,
        storeType: "convenience" as const,
      }))

    // Search restaurants by menu items
    const menuItemResults = searchByMenuItem(query)

    // Search pet stores by name
    const petStores = getAllPetStores()
    const petStoreResults = petStores
      .filter((store) => {
        return store.name.toLowerCase().includes(query.toLowerCase())
      })
      .map((store) => ({
        id: `pets-${store.id}`,
        name: store.name,
        logo: store.image,
        banner: store.image,
        detailsBanner: store.image,
        cuisine: "Pet Supplies",
        priceRange: "$",
        time: store.time,
        distance: "Nearby",
        deliveryFee: "Free delivery",
        rating: parseFloat(store.rating),
        reviews: store.ratingCount,
        dashPass: store.isDashPass,
        new: false,
        discount: undefined,
        isOpen: true,
        openingHours: "9:00 AM - 9:00 PM",
        address: "Local Area",
        phone: "(555) 123-4567",
        categories: ["pets"],
        matchType: "grocery" as const,
        storeType: "pets" as const,
      }))

    // Search pet products
    const petProducts = getEnrichedPetProducts()
    const petProductResults: SearchResultRestaurant[] = []
    petProducts.forEach((section: any) => {
      section.products.forEach((product: any) => {
        if (product.name.toLowerCase().includes(query.toLowerCase())) {
          petProductResults.push({
            id: `pet-product-${product.id}`,
            name: product.name,
            logo: product.image,
            banner: product.image,
            detailsBanner: product.image,
            cuisine: "Pet Product",
            priceRange: "$",
            time: "15-30 min",
            distance: "Nearby",
            deliveryFee: "Free delivery",
            rating: 4.5,
            reviews: "50+",
            dashPass: false,
            new: false,
            discount: undefined,
            isOpen: true,
            openingHours: "9:00 AM - 9:00 PM",
            address: "Local Area",
            phone: "(555) 123-4567",
            categories: ["pet-product"],
            matchType: "menu-item" as const,
            storeType: "pet-product" as const,
            matchedItems: [product.name],
          })
        }
      })
    })

    // Combine results, removing duplicates (prioritize restaurant matches)
    const combinedResults: SearchResultRestaurant[] = []
    const addedRestaurantIds = new Set<string>()

    // Add restaurant matches first
    restaurantResults.forEach((restaurant) => {
      if (!addedRestaurantIds.has(restaurant.id)) {
        combinedResults.push(restaurant)
        addedRestaurantIds.add(restaurant.id)
      }
    })

    // Add grocery store matches
    groceryResults.forEach((store) => {
      if (!addedRestaurantIds.has(store.id)) {
        combinedResults.push(store)
        addedRestaurantIds.add(store.id)
      }
    })

    // Add convenience store matches
    convenienceResults.forEach((store) => {
      if (!addedRestaurantIds.has(store.id)) {
        combinedResults.push(store)
        addedRestaurantIds.add(store.id)
      }
    })

    // Add pet store matches
    petStoreResults.forEach((store) => {
      if (!addedRestaurantIds.has(store.id)) {
        combinedResults.push(store)
        addedRestaurantIds.add(store.id)
      }
    })

    // Add pet product matches
    petProductResults.forEach((product) => {
      if (!addedRestaurantIds.has(product.id)) {
        combinedResults.push(product)
        addedRestaurantIds.add(product.id)
      }
    })

    // Add menu item matches that aren't already included
    menuItemResults.forEach((restaurant) => {
      if (!addedRestaurantIds.has(restaurant.id)) {
        combinedResults.push(restaurant)
        addedRestaurantIds.add(restaurant.id)
      }
    })

    // Simulate API delay
    const timer = setTimeout(() => {
      // Apply filters to search results
      let filteredResults = combinedResults;
      
      console.log(`[SEARCH] Original results: ${combinedResults.length}`);
      console.log(`[SEARCH] Active filters:`, activeFilters);
      
      // Filter by under 30 min
      if (activeFilters.underThirtyMins) {
        filteredResults = filteredResults.filter(restaurant => {
          const timeString = restaurant.time || "";
          // Handle different time formats: "18 min", "Express 56 min", "Fast 33 min"
          const timeMatch = timeString.match(/(\d+)\s*min/);
          const minutes = timeMatch ? parseInt(timeMatch[1]) : 100;
          const isUnder30 = minutes < 30;
          console.log(`[SEARCH] ${restaurant.name}: ${timeString} (${minutes} min) - Under 30: ${isUnder30}`);
          return isUnder30;
        });
        console.log(`[SEARCH] After under 30 min filter: ${filteredResults.length} results`);
      }
      
      // Filter by rating
      if (activeFilters.overRating && activeFilters.overRating > 0) {
        filteredResults = filteredResults.filter(restaurant => {
          if (!restaurant.rating) return false;
          const rating = getDefaultRating(restaurant.rating);
          const meetsRating = rating >= activeFilters.overRating!;
          console.log(`[SEARCH] ${restaurant.name}: rating ${rating} >= ${activeFilters.overRating}: ${meetsRating}`);
          return meetsRating;
        });
        console.log(`[SEARCH] After rating filter: ${filteredResults.length} results`);
      }
      
      // Filter by DashPass
      if (activeFilters.dashPass) {
        filteredResults = filteredResults.filter(restaurant => {
          const hasDashPass = restaurant.dashPass;
          console.log(`[SEARCH] ${restaurant.name}: DashPass: ${hasDashPass}`);
          return hasDashPass;
        });
        console.log(`[SEARCH] After DashPass filter: ${filteredResults.length} results`);
      }
      
      // Filter by price
      if (activeFilters.price && activeFilters.price.length > 0) {
        filteredResults = filteredResults.filter(restaurant => {
          const restaurantPrice = restaurant.priceRange;
          const isInSelectedPriceRange = activeFilters.price!.includes(restaurantPrice);
          console.log(`[SEARCH] ${restaurant.name}: price ${restaurantPrice} in selected ranges ${activeFilters.price}: ${isInSelectedPriceRange}`);
          return isInSelectedPriceRange;
        });
        console.log(`[SEARCH] After price filter: ${filteredResults.length} results`);
      }
      
      // Filter by deals
      if (activeFilters.deals) {
        filteredResults = filteredResults.filter(restaurant => {
          const hasDeals = restaurant.discount && restaurant.discount.length > 0;
          console.log(`[SEARCH] ${restaurant.name}: deals ${restaurant.discount} - Has deals: ${hasDeals}`);
          return hasDeals;
        });
        console.log(`[SEARCH] After deals filter: ${filteredResults.length} results`);
      }
      
      console.log(`[SEARCH] Final filtered results: ${filteredResults.length}`);
      setSearchResults(filteredResults)
      setIsLoading(false)
      
      // Convert results to SearchResult format for cart store
      const cartSearchResults = filteredResults.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo || "",
        description: restaurant.cuisine,
        dashPass: restaurant.dashPass,
        type: restaurant.storeType === "grocery" || restaurant.storeType === "pets" || restaurant.storeType === "pet-product" || restaurant.storeType === "convenience" ? "restaurant" as const : "restaurant" as const,
        restaurantId: restaurant.id,
        matchedItem: restaurant.matchType === "menu-item" || restaurant.matchType === "pet-product" || restaurant.matchType === "convenience" ? restaurant.matchedItems?.[0] : undefined
      }))
      
      updateSearchResults(cartSearchResults)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, activeFilters])

  useEffect(() => {
    return () => {
      clearSearchResults()
    }
  }, [])

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
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <Link 
                href={restaurant.storeType === "grocery" 
                  ? `/grocery/store/${restaurant.id.replace("grocery-", "")}` 
                  : restaurant.storeType === "pets"
                  ? `/pets/store/${restaurant.id.replace("pets-", "")}`
                  : restaurant.storeType === "pet-product"
                  ? `/pets?search=${encodeURIComponent(restaurant.name)}`
                  : restaurant.storeType === "convenience"
                  ? `/convenience/store/${restaurant.id.replace("convenience-", "")}`
                  : `/store/${restaurant.id}`
                } 
                className="block"
              >
                <div className="relative h-[200px] bg-gray-100 rounded-t-lg overflow-hidden">
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

              <div className="py-3 px-2">
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
                  {restaurant.rating && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-semibold">{restaurant.rating}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="ml-1">
                        <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                      </svg>
                      {restaurant.reviews && (
                        <>
                        <span className="mx-1">
                          {restaurant.reviews.startsWith("(") ? restaurant.reviews : `(${restaurant.reviews})`}
                        </span>
                        <span className="mx-1">•</span>
                        </>
                      )}
                    </div>
                  )}
                  <span>{restaurant.distance}</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.time}</span>
                </div>

                <div className="mt-1 text-sm text-gray-500">{restaurant.deliveryFee}</div>

                {/* Cuisine and Price Range for Restaurants */}
                {restaurant.storeType !== "grocery" && restaurant.storeType !== "pets" && restaurant.storeType !== "convenience" && (
                  <div className="mt-1 text-sm text-gray-600">
                    <span>{restaurant.cuisine}</span>
                    {restaurant.priceRange && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{restaurant.priceRange}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Store Type for Non-Restaurants */}
                {restaurant.storeType === "grocery" && (
                  <div className="mt-1 text-sm text-gray-600">
                    <span>Grocery Store</span>
                    <span className="mx-1">•</span>
                    <span>$</span>
                  </div>
                )}

                {restaurant.storeType === "pets" && (
                  <div className="mt-1 text-sm text-gray-600">
                    <span>Pet Store</span>
                    <span className="mx-1">•</span>
                    <span>$</span>
                  </div>
                )}

                {restaurant.storeType === "convenience" && (
                  <div className="mt-1 text-sm text-gray-600">
                    <span>Convenience Store</span>
                    <span className="mx-1">•</span>
                    <span>$</span>
                  </div>
                )}

                {/* Categories for Restaurants */}
                {restaurant.categories && restaurant.categories.length > 0 && restaurant.storeType !== "grocery" && restaurant.storeType !== "pets" && restaurant.storeType !== "convenience" && (
                  <div className="mt-1 text-sm text-gray-500">
                    {restaurant.categories.slice(0, 3).join(" • ")}
                    {restaurant.categories.length > 3 && "..."}
                  </div>
                )}

                {restaurant.matchType === "menu-item" && restaurant.matchedItems && (
                  <div className="mt-2 text-sm text-orange-600">
                    <span className="font-medium">Known for: </span>
                    {restaurant.matchedItems.slice(0, 3).join(", ")}
                    {restaurant.matchedItems.length > 3 && "..."}
                  </div>
                )}

                {restaurant.discount && (
                  <div className="mt-1 text-sm text-red-600 font-medium">{restaurant.discount}</div>
                )}

                {restaurant.rating && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>★ {getDefaultRating(restaurant.rating)}</span>
                    <span className="ml-1">({restaurant.reviews})</span>
                    <span className="mx-1">•</span>
                    <span>{restaurant.distance}</span>
                    <span className="mx-1">•</span>
                    <span>{restaurant.time}</span>
                  </div>
                )}

              </div>
            </div>
          ))}
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
          <h3 className="text-lg font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">
            Try searching for something else or browse our categories to discover great restaurants
          </p>
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
