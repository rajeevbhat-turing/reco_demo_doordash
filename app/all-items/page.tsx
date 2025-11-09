"use client"

import { useRouter, useSearchParams } from "next/navigation"
import VerticalListPage from "@/components/vertical-list-page"
import { restaurants } from "@/constants/restaurants"
import { 
  getAllStores, 
  getGroceryFavorites, 
  getFastestNearYou 
} from "@/app/grocery/data/retail-response-mapper"
import { convenienceStores } from "@/data/convenience-store-data"
import { Suspense } from "react"
import { getDefaultRating } from "@/utils/rating-utils"
import { filterRestaurantsWithMenuItems } from "@/utils/restaurant-utils"

// Inner component that uses searchParams
function AllItemsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get parameters from the URL
  const title = decodeURIComponent(searchParams.get('title') || "All Items")
  const type = searchParams.get('type') || "restaurant"
  const section = searchParams.get('section') ? decodeURIComponent(searchParams.get('section') || "") : ""
  
  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidLogo = (logoUrl: string | undefined): boolean => {
    if (!logoUrl || logoUrl.trim() === '') return false;
    if (logoUrl.includes('placeholder.svg')) return false;
    if (logoUrl.includes('placeholder.png')) return false;
    return true;
  };
  
  // Get the items based on the section
  const getItems = () => {
    // Restaurant items
    if (type === 'restaurant') {
      let filteredRestaurants: any[] = []
      // First filter restaurants to only include those with menu items
      const restaurantsWithMenus = filterRestaurantsWithMenuItems(restaurants);
      
      switch (section) {
        case 'national-favourites':
          filteredRestaurants = restaurantsWithMenus.filter(r => r.featured === true && hasValidLogo(r.logo))
          break
        case 'fastest-near-you':
          filteredRestaurants = restaurantsWithMenus.filter(r => {
            const timeStr = r.time
            const minutes = parseInt(timeStr.match(/\d+/)?.[0] || "100")
            return minutes < 30 && hasValidLogo(r.logo)
          })
          break
        case 'deals-for-you':
          filteredRestaurants = restaurantsWithMenus.filter(r => r.discount && hasValidLogo(r.logo))
          break
        case 'new-on-doordash':
          filteredRestaurants = restaurantsWithMenus.filter(r => r.new && hasValidLogo(r.logo))
          break
        case 'all-stores':
        default:
          filteredRestaurants = restaurantsWithMenus // Filter "all-stores" section too
      }
      
      // Convert restaurants to ListItem format
      return filteredRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.banner || restaurant.logo || "",
        rating: restaurant.rating,
        reviews: restaurant.reviews,
        distance: restaurant.distance,
        time: restaurant.time,
        deliveryFee: restaurant.deliveryFee,
        category: restaurant.category,
        cuisine: restaurant.cuisine,
        tags: restaurant.tags,
        dashPass: restaurant.dashPass,
        isOpen: restaurant.isOpen,
        discount: restaurant.discount,
        featured: restaurant.featured,
        new: restaurant.new
      }))
    }
    
    // Grocery items
    if (type === 'grocery') {
      let groceryStores: any[] = []
      switch (section) {
        case 'all-stores':
          groceryStores = getAllStores()
          break
        case 'grocery-favorites':
          groceryStores = getGroceryFavorites()
          break
        case 'fastest-near-you':
          groceryStores = getFastestNearYou()
          break
        default:
          groceryStores = getAllStores()
      }
      
      // Convert grocery stores to ListItem format
      return groceryStores.map(store => ({
        id: store.id,
        name: store.name,
        image: store.image,
        rating: store.rating,
        reviews: store.numRatings,
        time: store.time,
        deliveryFee: store.delivery,
        discount: store.discount,
        isSnapEligible: store.isSnap,
        inStorePrice: store.inStorePrice,
        isOpen: store.open
      }))
    }
    
    // Convenience items
    if (type === 'convenience') {
      // Convert convenience store data to array and match expected format
      const formattedStores = Object.values(convenienceStores).map((store: any) => ({
        id: store.id,
        name: store.name,
        image: store.logo,
        rating: store.rating?.toString() || "4.5",
        reviews: store.reviewCount?.toString() || "1,000+",
        time: store.deliveryTime || store.expressTime || "30 min",
        deliveryFee: "$0 delivery fee",
        discount: store.discount || "",
        isSnapEligible: store.isSnap || false,
        inStorePrice: true,
        isOpen: store.open !== false,
        dashPass: store.isDashPass
      })).filter((store: any) => store.id && store.name) // Filter out empty stores
      
      switch (section) {
        case 'convenience-favorites':
          // Filter for featured convenience stores
          return formattedStores.filter((store: any) => 
            ["cvs", "dashmart", "speedway", "extramile"].includes(store.id)
          )
        case 'all-stores':
        default:
          return formattedStores
      }
    }
    
    // Default to empty array for other types
    return []
  }
  
  const handleBack = () => {
    // Redirect to the appropriate home page based on the type
    switch (type) {
      case 'restaurant':
        router.push('/home')
        break
      case 'grocery':
        router.push('/grocery')
        break
      case 'pets':
        router.push('/pets')
        break
      case 'retail':
        router.push('/retail')
        break
      case 'convenience':
        router.push('/convenience')
        break
      default:
        router.push('/home')
    }
  }
  
  // Determine the URL prefix based on the type
  const getUrlPrefix = () => {
    switch (type) {
      case 'restaurant':
        return '/store'
      case 'grocery':
        return '/grocery/store'
      case 'pets':
        return '/pets/store'
      case 'retail':
        return '/retail/store'
      case 'convenience':
        return '/convenience/store'
      default:
        return '/store'
    }
  }

  return (
    <VerticalListPage 
      title={title}
      items={getItems()}
      onBackClick={handleBack}
      categoryType={type}
      urlPrefix={getUrlPrefix()}
    />
  )
}

// Loading fallback component
function LoadingContent() {
  return <div className="w-full h-screen flex items-center justify-center">Loading...</div>
}

// Main component with Suspense boundary
export default function AllItemsPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <AllItemsContent />
    </Suspense>
  )
}