"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronLeft, Star, Info } from "lucide-react"
import type { Restaurant } from "@/constants/restaurants"
import { getDefaultRating } from "@/utils/rating-utils"

// Generic item type that covers different types of stores/items
interface ListItem {
  id: string;
  name: string;
  image: string;       // Main image or logo
  banner?: string;     // Optional banner image
  rating?: number | string;
  reviews?: string;
  distance?: string;
  time?: string;
  deliveryFee?: string;
  price?: number;
  priceRange?: string;
  category?: string;
  cuisine?: string;
  tags?: string[];
  dashPass?: boolean;
  isOpen?: boolean;
  discount?: string;
  featured?: boolean;
  new?: boolean;
  // Additional fields for grocery/retail
  isSnapEligible?: boolean;
  inStorePrice?: boolean;
}

interface VerticalListPageProps {
  title: string;
  items: ListItem[];
  onBackClick: () => void;
  description?: string;
  categoryType: 'restaurant' | 'grocery' | 'pets' | 'retail' | string;
  urlPrefix?: string;
}

export default function VerticalListPage({ 
  title, 
  items, 
  onBackClick, 
  description = "",
  categoryType = "restaurant",
  urlPrefix = '/store'
}: VerticalListPageProps) {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})

  const toggleFavorite = (itemId: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setFavorites(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 pt-16 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBackClick}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={`${urlPrefix}/${item.id}${categoryType ? `?category=${categoryType}` : ''}`}
            className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Item Image */}
            <div className="w-full h-40 relative rounded-lg overflow-hidden">
              <Image 
                src={item.banner || item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            {/* Item Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  
                  <div className="flex items-center mt-1 text-sm text-gray-700 flex-wrap gap-y-1">
                    {item.dashPass && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm mr-2 flex items-center">
                        <Image
                          src="/dashpass-icon.svg"
                          alt="DashPass"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        DashPass
                      </span>
                    )}
                    
                    {item.isSnapEligible && (
                      <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-sm mr-2">
                        SNAP EBT
                      </span>
                    )}
                    
                    {item.rating && (
                      <>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                          <span>{item.rating}</span>
                          {item.reviews && <span className="text-gray-500 ml-1">({item.reviews})</span>}
                        </div>
                        <span className="mx-1">•</span>
                      </>
                    )}
                    
                    {item.distance && (
                      <>
                        <span>{item.distance}</span>
                        <span className="mx-1">•</span>
                      </>
                    )}
                    
                    {item.time && <span>{item.time}</span>}
                    
                    {item.priceRange && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{item.priceRange}</span>
                      </>
                    )}
                  </div>
                  
                  {item.deliveryFee && <div className="mt-1 text-sm text-gray-500">{item.deliveryFee}</div>}
                  
                  {item.discount && (
                    <div className="mt-1 text-sm text-red-600 font-medium">{item.discount}</div>
                  )}
                  
                  {item.inStorePrice && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Info className="h-3 w-3" />
                      In-store prices
                    </div>
                  )}
                </div>

                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={toggleFavorite(item.id)}
                  aria-label={favorites[item.id] ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart 
                    className={favorites[item.id] ? "h-6 w-6 fill-red-500 text-red-500" : "h-6 w-6"}
                  />
                </button>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {item.cuisine && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {item.cuisine}
                  </span>
                )}
                
                {item.category && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                )}
                
                {item.tags && item.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                
                {item.isOpen !== undefined && (
                  item.isOpen ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Closed
                    </span>
                  )
                )}
                
                {item.new && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600">No items found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  )
}