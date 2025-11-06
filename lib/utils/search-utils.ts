import { restaurants } from "@/constants/restaurants"
import { menuItems } from "@/constants/menu-items"
import { getAllStores } from "@/app/grocery/data/retail-response-mapper"
import { getAllStores as getConvenienceStores, getProductCarouselData } from "@/app/convenience/data/convenience-response-mapper"
import { getAllPetStores, getEnrichedPetProducts } from "@/app/pets/data/pet-response-mapper"
import { convenienceData } from "@/data/convenience-data"
import { stores as retailStores } from "@/constants/store"
import { groceryData, storeSpecificData } from "@/data/grocery-data"
import { filterRestaurantsWithMenuItems } from "@/utils/restaurant-utils"
import type { Restaurant } from "@/constants/restaurants"

export interface SearchResultRestaurant extends Restaurant {
  matchType: "restaurant" | "menu-item" | "grocery" | "pets" | "pet-product" | "convenience" | "retail"
  matchedItems?: string[]
  storeType?: "grocery" | "pets" | "pet-product" | "convenience" | "retail"
}

/**
 * Clean query by removing special characters, keeping only alphanumeric and spaces
 */
export function cleanQuery(query: string): string {
  return query.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

/**
 * Check if query contains only special characters
 */
export function isOnlySpecialCharacters(query: string): boolean {
  const cleaned = cleanQuery(query);
  return cleaned.length === 0 && query.trim().length > 0;
}

/**
 * Check if product name matches search term (with plural/singular handling)
 */
export function productMatchesSearchTerm(productName: string, searchTerm: string): boolean {
  const productNameLower = productName.toLowerCase()
  const searchTermLower = searchTerm.toLowerCase()
  
  // Direct match
  if (productNameLower.includes(searchTermLower)) return true
  // Try plural form (add 's')
  if (productNameLower.includes(searchTermLower + 's')) return true
  // Try singular form (remove 's')
  if (searchTermLower.endsWith('s') && productNameLower.includes(searchTermLower.slice(0, -1))) return true
  return false
}

/**
 * Search for restaurants that serve specific menu items
 */
export function searchByMenuItem(searchTerm: string): SearchResultRestaurant[] {
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

/**
 * Perform complete search across all data sources
 */
export function performSearch(query: string): SearchResultRestaurant[] {
  // Handle special characters: if query contains only special characters, return empty
  if (isOnlySpecialCharacters(query)) {
    return []
  }
  
  // Clean the query to remove special characters while keeping alphanumeric and spaces
  const cleanedQuery = cleanQuery(query);
  const queryLower = cleanedQuery.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const firstWord = queryWords.length > 0 ? queryWords[0] : queryLower;
  
  // Early return for empty or numeric-only queries
  if (queryLower.length === 0 || /^\d+$/.test(queryLower)) {
    return []
  }
  
  // First, try exact match with full query
  let restaurantResults = filterRestaurantsWithMenuItems(restaurants)
    .filter((restaurant) => {
      // Check if name or cuisine contains the full query
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
    }));
  
  // If query has multiple words, also search by first word
  // This handles cases like "Burger King" -> also search for "burger" in restaurant names
  // Only do this if we have multiple words and first word is meaningful (length > 2)
  if (queryWords.length > 1 && firstWord.length > 2) {
    const firstWordResults = filterRestaurantsWithMenuItems(restaurants)
      .filter((restaurant) => {
        // Check if name contains the first word
        const nameMatch = restaurant.name.toLowerCase().includes(firstWord);
        const cuisineMatch = restaurant.cuisine.toLowerCase().includes(firstWord);
        
        // For categories, check if any category contains the first word
        const categoryMatch = restaurant.categories && restaurant.categories.some(category => {
          return category.toLowerCase().includes(firstWord);
        });
        
        return nameMatch || cuisineMatch || categoryMatch;
      })
      .map((restaurant) => ({
        ...restaurant,
        matchType: "restaurant" as const,
      }));
    
    // Combine results, avoiding duplicates
    const existingIds = new Set(restaurantResults.map(r => r.id));
    const newResults = firstWordResults.filter(r => !existingIds.has(r.id));
    restaurantResults = [...restaurantResults, ...newResults];
  }

  // Search grocery stores by name
  const groceryStores = getAllStores()
  const groceryResults = groceryStores
    .filter((store) => {
      return store.name.toLowerCase().includes(queryLower)
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
      street: "Local Area",
      city: "Local",
      state: "CA",
      zipCode: "00000",
      lat: 0,
      lng: 0,
      phone: "(555) 123-4567",
      categories: ["grocery"],
      matchType: "grocery" as const,
      storeType: "grocery" as const,
    }))

  // Search convenience stores by name
  const convenienceStores = getConvenienceStores()
  const convenienceResults = convenienceStores
    .filter((store) => {
      return store.name.toLowerCase().includes(queryLower)
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
      street: "Local Area",
      city: "Local",
      state: "CA",
      zipCode: "00000",
      lat: 0,
      lng: 0,
      phone: "(555) 123-4567",
      categories: ["convenience"],
      matchType: "convenience" as const,
      storeType: "convenience" as const,
    }))

  // Search restaurants by menu items - try full query first, then first word if query has multiple words
  // Use cleaned query instead of original query
  let menuItemResults = searchByMenuItem(cleanedQuery);
  
  // If query has multiple words, also search by first word in menu items
  // This handles cases like "Burger King" -> also search for "burger" in menu items
  // Only do this if we have multiple words and first word is meaningful (length > 2)
  if (queryWords.length > 1 && firstWord.length > 2) {
    const firstWordMenuResults = searchByMenuItem(firstWord);
    
    // Combine results, avoiding duplicates
    const existingIds = new Set(menuItemResults.map(r => r.id));
    const newResults = firstWordMenuResults.filter(r => !existingIds.has(r.id));
    menuItemResults = [...menuItemResults, ...newResults];
  }

  // Search pet stores by name
  const petStores = getAllPetStores()
  const petStoreResults = petStores
    .filter((store) => {
      return store.name.toLowerCase().includes(queryLower)
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
      street: "Local Area",
      city: "Local",
      state: "CA",
      zipCode: "00000",
      lat: 0,
      lng: 0,
      phone: "(555) 123-4567",
      categories: ["pets"],
      matchType: "grocery" as const,
      storeType: "pets" as const,
    }))

  // Search retail stores by name
  const retailStoreResults = retailStores
    .filter((store) => {
      return store.name.toLowerCase().includes(queryLower)
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
      street: "Local Area",
      city: "Local",
      state: "CA",
      zipCode: "00000",
      lat: 0,
      lng: 0,
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
        const queryWords = queryLower.split(' ').filter(word => word.length > 0)
        if (queryWords.length === 0) return
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
          street: "Local Area",
          city: "Local",
          state: "CA",
          zipCode: "00000",
          lat: 0,
          lng: 0,
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
  const addedConvenienceProductIds = new Set<string>()
  
  // First, search with full query
  Object.values(convenienceData).forEach((storeProducts: any) => {
    storeProducts.forEach((section: any) => {
      section.products.forEach((product: any) => {
        // Search: check if ALL words in query are present in product name (with plural/singular handling)
        const queryWords = queryLower.split(' ').filter(word => word.length > 0)
        if (queryWords.length === 0) return
        const productName = product.name.toLowerCase()
        const allWordsMatch = queryWords.every(word => {
          return productMatchesSearchTerm(productName, word)
        })
        
        if (allWordsMatch && !addedConvenienceProductIds.has(`convenience-product-${product.id}`)) {
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
            const productId = `convenience-product-${product.id}`
            convenienceProductResults.push({
            id: productId,
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
            street: "Local Area",
            city: "Local",
            state: "CA",
            zipCode: "00000",
            lat: 0,
            lng: 0,
            phone: "(555) 123-4567",
            categories: ["convenience"],
            matchType: "menu-item" as const,
            storeType: "convenience" as const,
            matchedItems: [product.name],
          })
          addedConvenienceProductIds.add(productId)
          }
        }
      })
    })
  })
  
  // If query has multiple words, also search by first word for convenience products
  if (queryWords.length > 1 && firstWord.length > 2) {
    Object.values(convenienceData).forEach((storeProducts: any) => {
      storeProducts.forEach((section: any) => {
        section.products.forEach((product: any) => {
          const productName = product.name.toLowerCase()
          // Check if product matches first word
          if (productMatchesSearchTerm(productName, firstWord) && !addedConvenienceProductIds.has(`convenience-product-${product.id}`)) {
            // Get store name - try to match with carousel data or use fallback
            let storeName = null
            const carouselData = getProductCarouselData()
            const matchingCarouselStore = carouselData.find(store => 
              store.products.some(p => p.id === product.id)
            )
            if (matchingCarouselStore) {
              storeName = matchingCarouselStore.storeName
            } else {
              storeName = "Convenience Store"
            }

            if (storeName) {
              const productId = `convenience-product-${product.id}`
              convenienceProductResults.push({
                id: productId,
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
                street: "Local Area",
                city: "Local",
                state: "CA",
                zipCode: "00000",
                lat: 0,
                lng: 0,
                phone: "(555) 123-4567",
                categories: ["convenience"],
                matchType: "menu-item" as const,
                storeType: "convenience" as const,
                matchedItems: [product.name],
              })
              addedConvenienceProductIds.add(productId)
            }
          }
        })
      })
    })
  }

  // Search retail store products
  const retailProductResults: SearchResultRestaurant[] = []
  retailStores.forEach((store: any) => {
    if (store.items) {
      store.items.forEach((section: any) => {
        section.products.forEach((product: any) => {
          // Search: check if ALL words in query are present in product name (with plural/singular handling)
          const queryWords = queryLower.split(' ').filter(word => word.length > 0)
          if (queryWords.length === 0) return
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
              street: "Local Area",
              city: "Local",
              state: "CA",
              zipCode: "00000",
              lat: 0,
              lng: 0,
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
  const addedGroceryProductIds = new Set<string>()
  
  // Search through general grocery data
  groceryData.forEach((section: any) => {
    section.products.forEach((product: any) => {
      if (!product.name) return // Skip products without names
      const queryWords = queryLower.split(' ').filter(word => word.length > 0)
      if (queryWords.length === 0) return
      const productName = product.name.toLowerCase()
      const allWordsMatch = queryWords.every(word => {
        return productMatchesSearchTerm(productName, word)
      })
      
      if (allWordsMatch && !addedGroceryProductIds.has(`grocery-product-${product.id}`)) {
        const storeName = "General Grocery Store"
        const productId = `grocery-product-${product.id}`
        
        groceryProductResults.push({
          id: productId,
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
          street: "Local Area",
          city: "Local",
          state: "CA",
          zipCode: "00000",
          lat: 0,
          lng: 0,
          phone: "(555) 123-4567",
          categories: ["grocery"],
          matchType: "menu-item" as const,
          storeType: "grocery" as const,
          matchedItems: [product.name],
        })
        addedGroceryProductIds.add(productId)
      }
    })
  })

  // Search through store-specific grocery data
  Object.entries(storeSpecificData).forEach(([storeId, storeSections]: [string, any]) => {
    storeSections.forEach((section: any) => {
        section.products.forEach((product: any) => {
          if (!product.name) return // Skip products without names
          const queryWords = queryLower.split(' ').filter(word => word.length > 0)
          if (queryWords.length === 0) return
          const productName = product.name.toLowerCase()
          const allWordsMatch = queryWords.every(word => {
            return productMatchesSearchTerm(productName, word)
          })
          
          if (allWordsMatch && !addedGroceryProductIds.has(`grocery-product-${product.id}`)) {
          // Get store name from grocery stores
          const groceryStores = getAllStores()
          const store = groceryStores.find(s => s.id === storeId)
          const storeName = store?.name
          
          // Only add products that have a valid store name
          if (storeName) {
            const productId = `grocery-product-${product.id}`
            groceryProductResults.push({
              id: productId,
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
              street: "Local Area",
              city: "Local",
              state: "CA",
              zipCode: "00000",
              lat: 0,
              lng: 0,
              phone: "(555) 123-4567",
              categories: ["grocery"],
              matchType: "menu-item" as const,
              storeType: "grocery" as const,
              matchedItems: [product.name],
            })
            addedGroceryProductIds.add(productId)
          }
        }
      })
    })
  })
  
  // If query has multiple words, also search by first word for grocery products
  if (queryWords.length > 1 && firstWord.length > 2) {
    // Search through general grocery data with first word
    groceryData.forEach((section: any) => {
      section.products.forEach((product: any) => {
        if (!product.name) return
        const productName = product.name.toLowerCase()
        if (productMatchesSearchTerm(productName, firstWord) && !addedGroceryProductIds.has(`grocery-product-${product.id}`)) {
          const storeName = "General Grocery Store"
          const productId = `grocery-product-${product.id}`
          
          groceryProductResults.push({
            id: productId,
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
            street: "Local Area",
            city: "Local",
            state: "CA",
            zipCode: "00000",
            lat: 0,
            lng: 0,
            phone: "(555) 123-4567",
            categories: ["grocery"],
            matchType: "menu-item" as const,
            storeType: "grocery" as const,
            matchedItems: [product.name],
          })
          addedGroceryProductIds.add(productId)
        }
      })
    })
    
    // Search through store-specific grocery data with first word
    Object.entries(storeSpecificData).forEach(([storeId, storeSections]: [string, any]) => {
      storeSections.forEach((section: any) => {
        section.products.forEach((product: any) => {
          if (!product.name) return
          const productName = product.name.toLowerCase()
          if (productMatchesSearchTerm(productName, firstWord) && !addedGroceryProductIds.has(`grocery-product-${product.id}`)) {
            const groceryStores = getAllStores()
            const store = groceryStores.find(s => s.id === storeId)
            const storeName = store?.name
            
            if (storeName) {
              const productId = `grocery-product-${product.id}`
              groceryProductResults.push({
                id: productId,
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
                street: "Local Area",
                city: "Local",
                state: "CA",
                zipCode: "00000",
                lat: 0,
                lng: 0,
                phone: "(555) 123-4567",
                categories: ["grocery"],
                matchType: "menu-item" as const,
                storeType: "grocery" as const,
                matchedItems: [product.name],
              })
              addedGroceryProductIds.add(productId)
            }
          }
        })
      })
    })
  }

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

  return combinedResults
}

