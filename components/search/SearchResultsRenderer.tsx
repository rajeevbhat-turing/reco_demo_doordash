"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ShoppingCart } from "lucide-react"
import type { SearchResultRestaurant } from "@/lib/utils/search-utils"
import { useCartStore } from "@/store/cart-store"

interface SearchResultsRendererProps {
  results: SearchResultRestaurant[]
}

export default function SearchResultsRenderer({ results }: SearchResultsRendererProps) {
  const { addItem } = useCartStore()

  // Group products by store and separate standalone stores
  const storeGroups: { [key: string]: SearchResultRestaurant[] } = {}
  const standaloneStores: SearchResultRestaurant[] = []
  
  results.forEach((result) => {
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
                      }
                      
                      // Add to cart - will automatically find or create cart for this store
                      addItem(newItem, category, product.cuisine, storeId)
                      
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

