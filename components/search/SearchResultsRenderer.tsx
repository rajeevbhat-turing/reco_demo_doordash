"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, Trash2, Plus, Minus } from "lucide-react"
import type { SearchResultRestaurant } from "@/lib/utils/search-utils"
import { useCartStore } from "@/store/cart-store"
import MenuItemDialog from "@/components/menu-item-dialog"
import type { Product } from "@/types"

interface SearchResultsRendererProps {
  results: SearchResultRestaurant[]
}

export default function SearchResultsRenderer({ results }: SearchResultsRendererProps) {
  const { addItem, findCart, updateQuantity, removeItem } = useCartStore()
  const [favoritedStores, setFavoritedStores] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductCategory] = useState<"restaurant">("restaurant")
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")
  const [selectedStoreName, setSelectedStoreName] = useState<string>("")

  // Toggle favorite state for a store
  const toggleFavorite = (storeName: string) => {
    setFavoritedStores(prev => {
      const newSet = new Set(prev)
      if (newSet.has(storeName)) {
        newSet.delete(storeName)
      } else {
        newSet.add(storeName)
      }
      return newSet
    })
  }

  // Find product by ID from search result - only restaurants supported now
  const findProductById = (productId: string, storeType?: string, storeName?: string): Product | null => {
    // Products from other store types are no longer supported
    return null
  }

  // Handle product click to open modal
  const handleProductClick = (product: SearchResultRestaurant) => {
    const foundProduct = findProductById(product.id, product.storeType, product.cuisine)
    if (foundProduct) {
      // Determine category and store ID
      let category: "grocery" | "retail" | "convenience" | "pets" | "restaurant" = "grocery"
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

      setSelectedProduct(foundProduct)
      setSelectedProductCategory(category)
      setSelectedStoreId(storeId)
      setSelectedStoreName(product.cuisine || "")
    }
  }

  // Close modal
  const handleCloseModal = () => {
    setSelectedProduct(null)
    setSelectedStoreId("")
    setSelectedStoreName("")
  }

  // Helper function to get store information - only restaurants supported now
  const getStoreInfo = (storeName: string, storeType?: string) => {
    // Other store types are no longer supported
    return null
  }

  // Helper function to calculate delivery estimate
  const getDeliveryEstimate = (timeString: string): string => {
    if (!timeString) return "Get it by 8:00 AM"
    
    // Extract minutes from time string (e.g., "10-25 min" or "30-45 min")
    const match = timeString.match(/(\d+)-(\d+)\s*min/)
    if (match) {
      const avgMinutes = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
      const now = new Date()
      const deliveryTime = new Date(now.getTime() + avgMinutes * 60000)
      const hours = deliveryTime.getHours()
      const minutes = deliveryTime.getMinutes()
      const period = hours >= 12 ? "PM" : "AM"
      const displayHours = hours % 12 === 0 ? 12 : hours % 12
      const displayMinutes = minutes.toString().padStart(2, "0")
      return `Get it by ${displayHours}:${displayMinutes} ${period}`
    }
    return "Get it by 8:00 AM"
  }

  // Helper function to format opening time
  const formatOpeningTime = (openingHours: string | undefined): string => {
    if (!openingHours) return "Opens Thu at 7:00 AM"
    
    // Try to extract opening time from openingHours string
    const match = openingHours.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i)
    if (match) {
      const hour = parseInt(match[1])
      const minute = match[2] || "00"
      const period = match[3].toUpperCase()
      const dayMatch = openingHours.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i)
      const day = dayMatch ? dayMatch[0] : "Thu"
      return `Opens ${day} at ${hour}:${minute} ${period}`
    }
    return "Opens Thu at 7:00 AM"
  }

  // Group products by store and separate standalone stores
  const storeGroups: { [key: string]: SearchResultRestaurant[] } = {}
  const standaloneStores: SearchResultRestaurant[] = []
  const restaurants: SearchResultRestaurant[] = []
  
  results.forEach((result) => {
    const isProduct = result.id.includes("-product-")
    if (isProduct) {
      const storeName = result.cuisine || "Unknown Store"
      if (!storeGroups[storeName]) {
        storeGroups[storeName] = []
      }
      storeGroups[storeName].push(result)
    } else {
      // Check if it's a restaurant (no storeType or matchType is restaurant/menu-item)
      const isRestaurant = !result.storeType || 
                          result.matchType === "restaurant" || 
                          result.matchType === "menu-item"
      
      if (isRestaurant) {
        restaurants.push(result)
      } else {
        standaloneStores.push(result)
      }
    }
  })
  
  return (
    <>
      {/* Use MenuItemDialog instead of ProductDetailModal */}
      <MenuItemDialog
        isOpen={!!selectedProduct}
        onClose={handleCloseModal}
        item={
          selectedProduct
            ? {
                id: String(selectedProduct.id),
                restaurantId:
                  selectedStoreId ||
                  (selectedStoreName ? selectedStoreName.toLowerCase().replace(/\s+/g, "-") : "store"),
                name: selectedProduct.name,
                price:
                  typeof selectedProduct.price === "number"
                    ? `$${selectedProduct.price.toFixed(2)}`
                    : (() => {
                        const p = String((selectedProduct as any).price ?? "")
                        return p.startsWith("$") ? p : p ? `$${p}` : "$0.00"
                      })(),
                image: selectedProduct.image || "/placeholder.svg",
              }
            : null
        }
      />
      
      {/* Render store groups with products */}
      {Object.entries(storeGroups).map(([storeName, products]) => {
        // Get store type from first product
        const firstProduct = products[0]
        const storeType = firstProduct?.storeType || "grocery"
        
        // Get actual store information instead of product information
        const storeInfo: any = getStoreInfo(storeName, storeType)
        
        // Use store-level data if available, otherwise fallback to product data
        const isOpen = storeInfo?.isOpen !== undefined ? storeInfo.isOpen : (firstProduct?.isOpen !== false)
        const rating = storeInfo?.rating ?? firstProduct?.rating ?? null
        const reviewCount = storeInfo?.reviewCount
        const reviews = reviewCount !== undefined && reviewCount !== null
          ? `${reviewCount}+` 
          : (firstProduct?.reviews || null)
        const deliveryFee = storeInfo?.deliveryFee || firstProduct?.deliveryFee || "CA$0 delivery fee"
        const time = storeInfo?.time || firstProduct?.time || "30-45 min"
        const discount = storeInfo?.discount || firstProduct?.discount
        const openingHours = storeInfo?.openTime || firstProduct?.openingHours
        
        return (
        <div key={storeName} className="mb-8">
          {/* Store Header */}
          <div className="pb-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{storeName}</h2>
                
                {/* Rating and Reviews */}
                {rating && (
                  <div className="flex items-center text-sm mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-900 mr-1">{rating}</span>
                    {reviews && (
                      <span className="text-gray-600">({reviews})</span>
                    )}
                  </div>
                )}
                
                {/* Delivery Estimate */}
                <div className="text-sm text-gray-600 mb-1">
                  {getDeliveryEstimate(time)}
                </div>
                
                {/* Delivery Fee */}
                <div className="text-sm text-gray-600 mb-1">
                  {deliveryFee}
                </div>
                
                {/* Status */}
                {!isOpen && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="text-gray-500">Closed</span>
                    <span className="ml-2">{formatOpeningTime(openingHours)}</span>
                  </div>
                )}
                
                {/* Promotional Offer */}
                {discount && (
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      {discount}
                    </span>
                  </div>
                )}
              </div>
              <button 
                className="p-2 ml-4"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleFavorite(storeName)
                }}
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    favoritedStores.has(storeName) 
                      ? "text-blue-600 fill-blue-600" 
                      : "text-gray-400"
                  }`} 
                />
              </button>
            </div>
          </div>
          
          {/* Products - Horizontal Scrollable */}
          <div>
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex flex-col min-w-[160px] max-w-[160px] flex-shrink-0 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm">
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
                  
                  {/* Add Button / Quantity Selector - Positioned below image, right-aligned */}
                  <div className="flex justify-end mb-3">
                    {(() => {
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
                      
                      // Get current cart and check quantity
                      const currentCart = findCart(storeId, category)
                      const cartItem = currentCart?.items.find((item) => item.id === product.id)
                      const quantity = cartItem?.quantity || 0
                      
                      // Parse price
                      const price = typeof product.priceRange === 'string' 
                        ? parseFloat(product.priceRange.replace(/[^0-9.]/g, '')) || 0
                        : product.priceRange || 0
                        
                      const newItem = {
                        id: product.id,
                        itemName: product.name,
                        price: price,
                        image: product.logo || product.banner || '/placeholder.svg',
                      }
                      
                      // If quantity is 0, show "Add" button
                      if (quantity === 0) {
                        return (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addItem(newItem, category, product.cuisine, storeId)
                              console.log('Added to cart:', product.name, 'from', product.cuisine)
                            }}
                            className="bg-white text-gray-900 rounded-full px-4 py-1.5 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                          >
                            Add
                          </button>
                        )
                      }
                      
                      // If quantity > 0, show expanded quantity selector
                      return (
                        <div className="bg-white text-gray-900 rounded-full px-3 py-1.5 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow flex items-center gap-2">
                          {/* Trash icon - removes item */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeItem(product.id)
                              console.log('Removed from cart:', product.name)
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4 text-black" />
                          </button>
                          
                          {/* Minus icon - decrements quantity */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (quantity > 1) {
                                // If quantity is more than 1, just decrease it
                                updateQuantity(product.id, quantity - 1)
                                console.log('Decremented quantity:', product.name)
                              } else {
                                // If quantity is 1, remove the item completely
                                removeItem(product.id)
                                console.log('Removed from cart (quantity was 1):', product.name)
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-black" />
                          </button>
                          
                          {/* Quantity display */}
                          <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                            {quantity}x
                          </span>
                          
                          {/* Plus icon - adds more */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addItem(newItem, category, product.cuisine, storeId)
                              console.log('Added more to cart:', product.name)
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Add one more"
                          >
                            <Plus className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium text-sm leading-tight mb-1.5 line-clamp-2 text-gray-900">{product.name}</h3>
                    {product.matchedItems && product.matchedItems.length > 0 && (
                      <p className="text-xs text-green-600 mb-2">Many in stock</p>
                    )}
                    
                    {/* Price Display */}
                    {(product.priceRange !== undefined && product.priceRange !== null && 
                      (typeof product.priceRange === 'string' ? product.priceRange !== '0' && product.priceRange !== '' : product.priceRange !== 0)) && (
                      <div className="mb-1">
                        <span className="text-base font-bold text-gray-900">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )
      })}
      
      {/* Render restaurants with heading */}
      {restaurants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link 
                key={restaurant.id}
                href={`/store/${restaurant.id}`}
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
                      <button 
                        className="ml-2 p-1"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(restaurant.name)
                        }}
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
                            favoritedStores.has(restaurant.name) 
                              ? "text-blue-600 fill-blue-600" 
                              : "text-gray-400"
                          }`} 
                        />
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
        </div>
      )}
      
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
                    <button 
                      className="ml-2 p-1"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(restaurant.name)
                      }}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          favoritedStores.has(restaurant.name) 
                            ? "text-blue-600 fill-blue-600" 
                            : "text-gray-400"
                        }`} 
                      />
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

