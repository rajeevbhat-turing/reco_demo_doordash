"use client"

import { useRouter, useSearchParams } from "next/navigation"
import VerticalListPage from "@/components/vertical-list-page"
import { restaurants } from "@/constants/restaurants"
import { 
  getAllStores, 
  getGroceryFavorites, 
  getFastestNearYou 
} from "@/app/grocery/data/retail-response-mapper"

export default function AllItemsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get parameters from the URL
  const title = decodeURIComponent(searchParams.get('title') || "All Items")
  const type = searchParams.get('type') || "restaurant"
  const section = searchParams.get('section') ? decodeURIComponent(searchParams.get('section') || "") : ""
  
  // Get the items based on the section
  const getItems = () => {
    // Restaurant items
    if (type === 'restaurant') {
      switch (section) {
        case 'national-favourites':
          return restaurants.filter(r => r.featured === true)
        case 'fastest-near-you':
          return restaurants.filter(r => {
            const timeStr = r.time
            const minutes = parseInt(timeStr.match(/\d+/)?.[0] || "100")
            return minutes < 30
          })
        case 'deals-for-you':
          return restaurants.filter(r => r.discount)
        case 'new-on-doordash':
          return restaurants.filter(r => r.new)
        case 'all-stores':
        default:
          return restaurants
      }
    }
    
    // Grocery items
    if (type === 'grocery') {
      switch (section) {
        case 'all-stores':
          return getAllStores()
        case 'grocery-favorites':
          return getGroceryFavorites()
        case 'fastest-near-you':
          return getFastestNearYou()
        default:
          return getAllStores()
      }
    }
    
    // Default to empty array for other types
    return []
  }
  
  const handleBack = () => {
    // Redirect to the appropriate home page based on the type
    switch (type) {
      case 'restaurant':
        router.push('/')
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
      default:
        router.push('/')
    }
  }
  
  // Determine the URL prefix based on the type
  const getUrlPrefix = () => {
    switch (type) {
      case 'restaurant':
        return '/store'
      case 'grocery':
      case 'pets':
      case 'retail':
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