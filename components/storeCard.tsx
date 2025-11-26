"use client"
import Image from "next/image"
import { useState } from "react"

const DEFAULT_STORE_LOGO = "/store-logos/default-store.svg"

interface StoreCardProps {
  id: string
  name: string
  image: string
  openTime?: string
  deliveryTime: string
  discount?: string
  isDashPass: boolean
  storeType?: string
}

export default function StoreCard({ id, name, image, openTime, deliveryTime, discount, isDashPass, storeType = "restaurant" }: StoreCardProps) {
    const [imageError, setImageError] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    
    // Only restaurants are supported now
    const storeUrl = `/restaurants/${id}`;
  
    return (
      <div 
        className="border border-gray-200 rounded-lg py-2 px-4 cursor-pointer hover:bg-gray-50" 
        onClick={() => window.location.href = storeUrl}
      >
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {image && <Image
              src={imageError ? DEFAULT_STORE_LOGO : image}
              alt={name}
              width={64}
              height={64}
              className="object-cover"
              loading="lazy"
              sizes="64px"
              onError={() => setImageError(true)}
            />}
          </div>
          <div className="flex-1 min-w-0">
            {openTime && (
              <p className="text-red-600 text-sm font-medium mb-1">{openTime}</p>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                {isDashPass && (
                    <Image src="/dashpass-icon.svg" alt="DashPass" width={16} height={16} loading="lazy" sizes="16px" />
                  )}
                  <h3 className="font-medium text-gray-900 truncate">{name}</h3>
                </div>
                <p className="text-sm text-gray-500">{deliveryTime && deliveryTime}</p>
              </div>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={isFavorite ? "text-red-500" : "text-gray-500"}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            {discount && (
              <p className="text-red-600 text-sm mt-1">{discount}</p>
            )}
          </div>
        </div>
      </div>
    )
  }