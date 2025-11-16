"use client"

import Image from "next/image"
import { Heart, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRef, useState } from "react"
import { getDefaultRating } from "@/utils/rating-utils"

interface Store {
  id: string
  name: string
  rating?: string | number | null
  numRatings?: string
  distance?: string
  time?: string
  delivery?: string
  image: string
  open?: boolean
  openTime?: string
  inStorePrice?: boolean
  discount?: string
  isSnap?: boolean
  isDashPass?: boolean
}

interface StoreGridProps {
  title: string
  stores: Store[]
  variant?: "all" | "favorites" | "fastest" | "compact"
  showSeeAll?: boolean
  showNavigation?: boolean
  seeAllLink?: string
  storeType?: "grocery" | "retail" | "pets" | "convenience"
}

export default function StoreGrid({
  title,
  stores,
  variant = "all",
  showSeeAll = false,
  showNavigation = true,
  seeAllLink = "/all-items",
  storeType = "grocery"
}: StoreGridProps) {
  // Determine if we should use card or image layout
  const useCardLayout = variant === "all" || variant === "compact"
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({})
  
  const toggleFavorite = (e: React.MouseEvent, storeId: string) => {
    e.preventDefault(); // Prevent navigation
    setFavorites(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  }

  // Scroll left
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    })
  }

  // Scroll right
  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {(showSeeAll || showNavigation) && (
          <div className="flex items-center gap-2">
            {showSeeAll && (
              <Link 
                href={{
                  pathname: seeAllLink,
                  query: { 
                    title: encodeURIComponent(title),
                    type: storeType,
                    section: encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))
                  }
                }}
                className="text-sm font-medium"
              >
                See All
              </Link>
            )}
            {showNavigation && (
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white hover:bg-gray-100"
                  onClick={scrollLeft}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white hover:bg-gray-100"
                  onClick={scrollRight}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={scrollContainerRef} className="overflow-x-auto no-scrollbar scroll-smooth w-full snap-x">
        <div className={`flex space-x-4 pb-2 ${useCardLayout ? "" : ""}`}>
          {stores.map((store, index) => {
            const baseClassName = useCardLayout ? `min-w-[320px] md:min-w-[360px] snap-start` : "relative group min-w-[280px] md:min-w-[320px] snap-start";
            
            // Determine the correct navigation URL based on store type
            let href = `/convenience/store/${store.id}?storeType=${storeType}`;
            if (storeType === "pets") {
              href = `/pets/store/${store.id}`;
            } else if (storeType === "retail") {
              href = `/retail/store/${store.id}`;
            } else if (storeType === "grocery") {
              href = `/grocery/store/${store.id}`;
            }

            // Use Link for all store types now
            return (
              <Link
                href={href}
                key={store.id || `store-${index}`}
                className={baseClassName}
              >
                {useCardLayout ? (
                  // Card layout (for "all" variant)
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={store.image || "/placeholder.svg"}
                          alt={store.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{store.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full -mr-2 -mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(e, store.id);
                            }}
                          >
                            <Heart className={`h-5 w-5 ${favorites[store.id] ? 'fill-blue-500 text-blue-500' : ''}`} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                          {store.isSnap && (
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded inline-flex items-center">
                              SNAP
                            </span>
                          )}
                          {store.isDashPass && (
                            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-flex items-center">
                              DashPass
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          {store?.rating && store.rating !== 0 && <span>★ {getDefaultRating(store.rating)}</span>}
                          {store.numRatings && store.numRatings !== '0 ratings' && <span className="ml-1">({store.numRatings})</span>}
                          <span className="mx-1">•</span>
                          <span>{store.distance}</span>
                          <span className="mx-1">•</span>
                          <span>{store.time}</span>
                        </div>

                        {store.open !== undefined ? (
                          <div className="text-sm text-gray-500">{store.open ? store.time : "Closed"}</div>
                        ) : (
                          store.time && <div className="text-sm text-gray-500">{store.time}</div>
                        )}

                        {store.delivery && <div className="text-sm text-gray-500">{store.delivery}</div>}

                        {store.inStorePrice && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Info className="h-3 w-3" />
                            In-store prices
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ) : (
                  // Image layout (for "favorites" and "fastest" variants)
                  <>
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                      <div style={{ width: "100%", paddingBottom: "75%", position: "relative" }}>
                        <div className="absolute inset-0">
                          <img
                            src={store.image || "/placeholder.svg"}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Subtle overlay gradient for better visibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full bg-white opacity-80 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(e, store.id);
                      }}
                    >
                      <Heart className={`h-5 w-5 ${favorites[store.id] ? 'fill-blue-500 text-blue-500' : ''}`} />
                    </Button>
                    <div className="mt-2">
                      <div className="font-medium flex items-center">
                        {store.name}
                        {store.isDashPass && (
                          <span className="ml-1 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                            DashPass
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 flex-wrap">
                        {store?.rating && store.rating !== 0 && <span>★ {getDefaultRating(store.rating)}</span>}
                        {store.numRatings && store.numRatings !== '0 ratings' && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{store.numRatings}</span>
                          </>
                        )}
                        {store.distance && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{store.distance}</span>
                          </>
                        )}
                        {store.time && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{store.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
