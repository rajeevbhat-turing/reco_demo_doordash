"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ArrowLeft, ShoppingCart } from "lucide-react"
import { restaurants } from "@/constants/restaurants"
import { menuItems } from "@/constants/menu-items"
import { getAllStores } from "@/app/grocery/data/retail-response-mapper"
import { getAllStores as getConvenienceStores, getProductCarouselData } from "@/app/convenience/data/convenience-response-mapper"
import { getAllPetStores, getEnrichedPetProducts } from "@/app/pets/data/pet-response-mapper"
import { convenienceData } from "@/data/convenience-data"
import { stores as retailStores } from "@/constants/store"
import { groceryData, storeSpecificData } from "@/data/grocery-data"
import FilterOptions, { FilterState, FilterOptionsRef } from "@/components/filter-options"
import type { Restaurant } from "@/constants/restaurants"
import { getDefaultRating } from "@/utils/rating-utils"
import { filterRestaurantsWithMenuItems } from "@/utils/restaurant-utils"
import { useReplaceCart } from "@/lib/hooks/use-replace-cart"
import { useVerifierStore } from "@/store/verifier-store"
import { useAppStore } from "@/store/app-store"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SearchResultRestaurant extends Restaurant {
  matchType: "restaurant" | "menu-item" | "grocery" | "pets" | "pet-product" | "convenience" | "retail"
  matchedItems?: string[]
  storeType?: "grocery" | "pets" | "pet-product" | "convenience" | "retail"
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  
  console.log('🚀 SearchPage rendered with query:', query)
  const [searchResults, setSearchResults] = useState<SearchResultRestaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItemWithConflictCheck } = useReplaceCart()
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null,
    dashPass: false,
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

    // Only consider restaurants that have menu items
    const restaurantsWithMenus = filterRestaurantsWithMenuItems(restaurants);
    
    matchingItems.forEach((item) => {
      const restaurant = restaurantsWithMenus.find((r) => r.id === item.restaurantId)
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

    // Search restaurants by name, cuisine, and categories - only include restaurants with menu items
    const restaurantResults = filterRestaurantsWithMenuItems(restaurants)
      .filter((restaurant) => {
        const queryLower = query.toLowerCase();
        
        // Check if name or cuisine contains the query
        const nameMatch = restaurant.name.toLowerCase().includes(queryLower);
        const cuisineMatch = restaurant.cuisine.toLowerCase().includes(queryLower);
        
        // For categories, use more precise matching - check if any category contains the query
        // For dessert specifically, we want exact matches or word boundaries
        const categoryMatch = restaurant.categories && restaurant.categories.some(category => {
          const categoryLower = category.toLowerCase();
          // For dessert search, be more precise
          if (queryLower === 'dessert') {
            return categoryLower === 'desserts' || categoryLower === 'dessert';
          }
          return categoryLower.includes(queryLower);
        });
        
        // For dessert search, only return restaurants that actually have dessert categories
        if (queryLower === 'dessert') {
          return categoryMatch; // Only return if it has dessert category
        }
        
        return nameMatch || cuisineMatch || categoryMatch;
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

    // Search retail stores by name
    const retailStoreResults = retailStores
      .filter((store) => {
        return store.name.toLowerCase().includes(query.toLowerCase())
      })
      .map((store) => ({
        id: `retail-${store.id}`,
        name: store.name,
        logo: store.image,
        banner: store.image,
        detailsBanner: store.image,
        cuisine: "Retail Store",
        priceRange: "$",
        time: store.deliveryTime,
        distance: "Nearby",
        deliveryFee: "Free delivery",
        rating: 4.5, // Default rating for retail stores
        reviews: "1000+", // Default reviews
        dashPass: store.isDashPass,
        new: false,
        discount: store.discount || undefined,
        isOpen: true,
        openingHours: store.openTime || "9:00 AM - 9:00 PM",
        address: "Local Area",
        phone: "(555) 123-4567",
        categories: ["retail"],
        matchType: "grocery" as const, // Use same match type as other stores
        storeType: "retail" as const,
      }))

    // Search pet products
    const petProductResults: SearchResultRestaurant[] = []
    try {
      const petProducts = getEnrichedPetProducts()
    
      petProducts.forEach((section: any) => {
        section.products.forEach((product: any) => {
          // Search: check if ALL words in query are present in product name (with plural/singular handling)
          const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
          const productName = product.name.toLowerCase()
          const allWordsMatch = queryWords.every(word => {
            // Direct match
            if (productName.includes(word)) return true
            // Try plural form (add 's')
            if (productName.includes(word + 's')) return true
            // Try singular form (remove 's')
            if (word.endsWith('s') && productName.includes(word.slice(0, -1))) return true
            return false
          })
          if (allWordsMatch) {
            // Get store name from the section
            let storeName = section.storeName || "Pet Store"
          
            // Only add products that have a valid store name
            if (storeName) {
            petProductResults.push({
            id: `pet-product-${product.id}`,
            name: product.name,
            logo: product.image,
            banner: product.image,
            detailsBanner: product.image,
            cuisine: storeName,
            priceRange: product.price || 0,
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
        }
      })
    })
    } catch (error) {
      console.error('❌ Error in pet product search:', error)
    }

    // Search convenience store products
    const convenienceProductResults: SearchResultRestaurant[] = []
    Object.values(convenienceData).forEach((storeProducts: any) => {
      storeProducts.forEach((section: any) => {
        section.products.forEach((product: any) => {
          // Search: check if ALL words in query are present in product name (with plural/singular handling)
          const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
          const productName = product.name.toLowerCase()
          const allWordsMatch = queryWords.every(word => {
            // Direct match
            if (productName.includes(word)) return true
            // Try plural form (add 's')
            if (productName.includes(word + 's')) return true
            // Try singular form (remove 's')
            if (word.endsWith('s') && productName.includes(word.slice(0, -1))) return true
            return false
          })
          
          if (allWordsMatch) {
            // Get store name - try to match with carousel data or use fallback
            let storeName = null
            const carouselData = getProductCarouselData()
            const matchingCarouselStore = carouselData.find(store => 
              store.products.some(p => p.id === product.id)
            )
            if (matchingCarouselStore) {
              storeName = matchingCarouselStore.storeName
            } else {
              // Use a default convenience store name since many products don't have specific store mappings
              storeName = "Convenience Store"
            }

            // Only add products that have a valid store name
            if (storeName) {
              convenienceProductResults.push({
              id: `convenience-product-${product.id}`,
              name: product.name,
              logo: product.image,
              banner: product.image,
              detailsBanner: product.image,
              cuisine: storeName,
              priceRange: product.price || 0,
              time: "10-25 min",
              distance: "Nearby",
              deliveryFee: "Free delivery",
              rating: 4.3,
              reviews: "100+",
              dashPass: false,
              new: false,
              discount: undefined,
              isOpen: true,
              openingHours: "24 hours",
              address: "Local Area",
              phone: "(555) 123-4567",
              categories: ["convenience"],
              matchType: "menu-item" as const,
              storeType: "convenience" as const,
              matchedItems: [product.name],
            })
            }
          }
        })
      })
    })

    // Search retail store products
    const retailProductResults: SearchResultRestaurant[] = []
    retailStores.forEach((store: any) => {
      if (store.items) {
        store.items.forEach((section: any) => {
          section.products.forEach((product: any) => {
            // Search: check if ALL words in query are present in product name (with plural/singular handling)
            const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
            const productName = product.name.toLowerCase()
            const allWordsMatch = queryWords.every(word => {
              // Direct match
              if (productName.includes(word)) return true
              // Try plural form (add 's')
              if (productName.includes(word + 's')) return true
              // Try singular form (remove 's')
              if (word.endsWith('s') && productName.includes(word.slice(0, -1))) return true
              return false
            })
            
            if (allWordsMatch) {
              // Only add products that have a valid store name
              if (store.name) {
                retailProductResults.push({
                id: `retail-product-${product.id}`,
                name: product.name,
                logo: product.image,
                banner: product.image,
                detailsBanner: product.image,
                cuisine: store.name,
                priceRange: product.price || 0,
                time: "30-45 min",
                distance: "Nearby",
                deliveryFee: "Free delivery",
                rating: 4.4,
                reviews: "200+",
                dashPass: false,
                new: false,
                discount: undefined,
                isOpen: true,
                openingHours: "9:00 AM - 9:00 PM",
                address: "Local Area",
                phone: "(555) 123-4567",
                categories: ["retail"],
                matchType: "menu-item" as const,
                storeType: "retail" as const,
                matchedItems: [product.name],
              })
              }
            }
          })
        })
      }
    })

    // Search grocery products
    const groceryProductResults: SearchResultRestaurant[] = []
    
    // Search through general grocery data
    groceryData.forEach((section: any) => {
      section.products.forEach((product: any) => {
        if (!product.name) return // Skip products without names
        const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
        const productName = product.name.toLowerCase()
        const allWordsMatch = queryWords.every(word => {
          // Direct match
          if (productName.includes(word)) return true
          // Try plural form (add 's')
          if (productName.includes(word + 's')) return true
          // Try singular form (remove 's')
          if (word.endsWith('s') && productName.includes(word.slice(0, -1))) return true
          return false
        })
        
        if (allWordsMatch) {
          const storeName = "General Grocery Store"
          
          groceryProductResults.push({
            id: `grocery-product-${product.id}`,
            name: product.name,
            logo: product.image,
            banner: product.image,
            detailsBanner: product.image,
            cuisine: storeName,
            priceRange: product.price || 0,
            time: "30-45 min",
            distance: "Nearby",
            deliveryFee: "Free delivery",
            rating: 4.4,
            reviews: "150+",
            dashPass: false,
            new: false,
            discount: undefined,
            isOpen: true,
            openingHours: "9:00 AM - 9:00 PM",
            address: "Local Area",
            phone: "(555) 123-4567",
            categories: ["grocery"],
            matchType: "menu-item" as const,
            storeType: "grocery" as const,
            matchedItems: [product.name],
          })
        }
      })
    })

    // Search through store-specific grocery data
    Object.entries(storeSpecificData).forEach(([storeId, storeSections]: [string, any]) => {
      storeSections.forEach((section: any) => {
        section.products.forEach((product: any) => {
                      if (!product.name) return // Skip products without names
            const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0)
            const productName = product.name.toLowerCase()
            const allWordsMatch = queryWords.every(word => {
              // Direct match
              if (productName.includes(word)) return true
              // Try plural form (add 's')
              if (productName.includes(word + 's')) return true
              // Try singular form (remove 's')
              if (word.endsWith('s') && productName.includes(word.slice(0, -1))) return true
              return false
            })
            
            if (allWordsMatch) {
            // Get store name from grocery stores
            const groceryStores = getAllStores()
            const store = groceryStores.find(s => s.id === storeId)
            const storeName = store?.name
            
            // Only add products that have a valid store name
            if (storeName) {
              groceryProductResults.push({
                id: `grocery-product-${product.id}`,
                name: product.name,
                logo: product.image,
                banner: product.image,
                detailsBanner: product.image,
                cuisine: storeName,
                priceRange: product.price || 0,
                time: "30-45 min",
                distance: "Nearby",
                deliveryFee: "Free delivery",
                rating: 4.4,
                reviews: "150+",
                dashPass: false,
                new: false,
                discount: undefined,
                isOpen: true,
                openingHours: "9:00 AM - 9:00 PM",
                address: "Local Area",
                phone: "(555) 123-4567",
                categories: ["grocery"],
                matchType: "menu-item" as const,
                storeType: "grocery" as const,
                matchedItems: [product.name],
              })
            }
          }
        })
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

    // Add retail store matches
    retailStoreResults.forEach((store) => {
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

    // Add convenience product matches
    convenienceProductResults.forEach((product) => {
      if (!addedRestaurantIds.has(product.id)) {
        combinedResults.push(product)
        addedRestaurantIds.add(product.id)
      }
    })

    // Add retail product matches
    retailProductResults.forEach((product) => {
      if (!addedRestaurantIds.has(product.id)) {
        combinedResults.push(product)
        addedRestaurantIds.add(product.id)
      }
    })

    // Add grocery product matches
    groceryProductResults.forEach((product) => {
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
      console.log('[SEARCH] Results details:', filteredResults.map(r => r.name));
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
        matchedItem: restaurant.matchType === "menu-item" || restaurant.matchType === "pet-product" || restaurant.matchType === "convenience" ? restaurant.matchedItems?.[0] : undefined,
        categories: restaurant.categories,
        priceRange: restaurant.priceRange
      }))
      
      console.log(`[SEARCH] Updating cart store with ${cartSearchResults.length} results`);
      console.log(`[SEARCH] Sample result:`, cartSearchResults[0]);
      updateSearchResults(cartSearchResults)
    }, 500)

    // Also update search results immediately for verifier
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

  // Helper function to render grouped search results
  const renderSearchResults = () => {
    // Group products by store and separate standalone stores
    const storeGroups: { [key: string]: SearchResultRestaurant[] } = {}
    const standaloneStores: SearchResultRestaurant[] = []
    
    searchResults.forEach((result) => {
      const isProduct = result.id.includes("-product-")
      if (isProduct) {
        const storeName = result.cuisine || "Unknown Store"
        if (!storeGroups[storeName]) {
          storeGroups[storeName] = []
        }
        storeGroups[storeName].push(result)
      } else {
        standaloneStores.push(result)
      }
    })
    
    return (
      <>
        {/* Render store groups with products */}
        {Object.entries(storeGroups).map(([storeName, products]) => (
          <div key={storeName} className="bg-white rounded-lg shadow-sm border">
            {/* Store Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{storeName}</h2>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <span>{products[0]?.time || "30-45 min"}</span>
                    {products[0]?.discount && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-red-600">{products[0].discount}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className="p-2">
                  <Heart className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              {products[0]?.isOpen === false && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Closed</span>
                  <span className="text-sm text-gray-600 ml-2">Opens Thu at 6:00 AM</span>
                </div>
              )}
            </div>
            
            {/* Products Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={product.banner || product.logo || `/placeholder.svg?height=150&width=150&query=${product.name}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {product.new && (
                        <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          NEW
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                      {product.matchedItems && product.matchedItems.length > 0 && (
                        <p className="text-xs text-gray-500 mb-1">Many in stock</p>
                      )}
                      
                      {/* Price Display */}
                      {(product.priceRange !== undefined && product.priceRange !== null && 
                        (typeof product.priceRange === 'string' ? product.priceRange !== '0' && product.priceRange !== '' : product.priceRange !== 0)) && (
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {typeof product.priceRange === 'string' 
                              ? product.priceRange.startsWith('$') 
                                ? product.priceRange 
                                : product.priceRange === '0' || product.priceRange === ''
                                  ? 'Free'
                                  : `$${product.priceRange}`
                              : product.priceRange === 0 
                                ? 'Free'
                                : `$${(product.priceRange as number).toFixed(2)}`
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* Add to Cart Button - More Prominent */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          
                          // Determine store category and generate a proper store ID using the store name
                          let category: "grocery" | "pets" | "convenience" | "retail" = "grocery"
                          let storeId = ""
                          
                          if (product.storeType === "grocery") {
                            category = "grocery"
                            storeId = product.cuisine?.toLowerCase().replace(/\s+/g, '-') || "grocery-store"
                          } else if (product.storeType === "pets" || product.storeType === "pet-product") {
                            category = "pets"
                            storeId = product.cuisine?.toLowerCase().replace(/\s+/g, '-') || "pet-store"
                          } else if (product.storeType === "convenience") {
                            category = "convenience"
                            storeId = product.cuisine?.toLowerCase().replace(/\s+/g, '-') || "convenience-store"
                          } else if (product.storeType === "retail") {
                            category = "retail"
                            storeId = product.cuisine?.toLowerCase().replace(/\s+/g, '-') || "retail-store"
                          }
                          
                          // Parse price
                          const price = typeof product.priceRange === 'string' 
                            ? parseFloat(product.priceRange.replace(/[^0-9.]/g, '')) || 0
                            : product.priceRange || 0
                          
                          const newItem = {
                            id: product.id,
                            itemName: product.name,
                            price: price,
                            image: product.logo || product.banner || '/placeholder.svg',
                            storeId: storeId,
                            storeName: product.cuisine, // Pass the store name
                          }
                          
                          // Use the replace cart context to handle conflicts automatically
                          addItemWithConflictCheck(newItem, category)
                          
                          console.log('Added to cart:', product.name, 'from', product.cuisine)
                        }}
                        className="mt-auto w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* Render standalone stores */}
        {standaloneStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standaloneStores.map((restaurant) => (
              <Link 
                key={restaurant.id}
                href={restaurant.storeType === "grocery" 
                  ? `/grocery/store/${restaurant.id.replace("grocery-", "")}` 
                  : restaurant.storeType === "pets"
                  ? `/pets/store/${restaurant.id.replace("pets-", "")}`
                  : restaurant.storeType === "convenience"
                  ? `/convenience/store/${restaurant.id.replace("convenience-", "")}`
                  : `/store/${restaurant.id}`
                } 
                className="block"
              >
                <div className="restaurant-card">
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
                  <div className="p-4 bg-white rounded-b-lg shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-1">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{restaurant.cuisine}</p>
                      </div>
                      <button className="ml-2 p-1">
                        <Heart className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="mr-2">{restaurant.rating}</span>
                      <span className="mr-2">({restaurant.reviews})</span>
                      <span className="mr-2">•</span>
                      <span className="mr-2">{restaurant.time}</span>
                      <span className="mr-2">•</span>
                      <span>{restaurant.distance}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600">{restaurant.deliveryFee}</span>
                        {restaurant.dashPass && (
                          <div className="ml-2 px-2 py-1 bg-black text-white text-xs rounded">
                            DashPass
                          </div>
                        )}

                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant.priceRange}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </>
    )
  }

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
        <div className="space-y-8">
          {renderSearchResults()}
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
