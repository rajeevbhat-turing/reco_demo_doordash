"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { Restaurant } from "@/constants/restaurants"
import { getDefaultRating } from "@/utils/rating-utils"

interface RestaurantSectionProps {
  title: string
  restaurants: Restaurant[]
  seeAllLink?: string
}

export default function RestaurantSection({ title, restaurants, seeAllLink = "/all-items" }: RestaurantSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [cardWidth, setCardWidth] = useState(350)
  const [visibleCards, setVisibleCards] = useState(3)
  const [containerWidth, setContainerWidth] = useState(0)
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})

  // Calculate how many cards can fit and their optimal width
  useEffect(() => {
    const updateCardLayout = () => {
      if (!scrollContainerRef.current) return

      const container = scrollContainerRef.current
      const containerWidth = container.clientWidth
      setContainerWidth(containerWidth)

      // Base card width (350px) + gap (16px)
      const baseCardWidth = 350
      const gap = 16

      // Calculate how many whole cards can fit
      const cardsPerView = Math.floor(containerWidth / (baseCardWidth + gap))
      setVisibleCards(Math.max(1, cardsPerView))

      // Calculate the optimal card width to fill the container evenly
      // We subtract the total gap space and divide by number of cards
      const optimalCardWidth = (containerWidth - gap * (cardsPerView - 1)) / cardsPerView
      setCardWidth(optimalCardWidth)
    }

    // Initial calculation
    updateCardLayout()

    // Recalculate on window resize
    window.addEventListener("resize", updateCardLayout)
    return () => window.removeEventListener("resize", updateCardLayout)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    // Scroll by exactly one card width (plus gap)
    const scrollAmount = cardWidth + 16 // 16px is the gap

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
  }

  const toggleFavorite = (restaurantId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [restaurantId]: !prev[restaurantId]
    }));
  };

  return (
    <section className="py-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <Link 
            href={`/store/${restaurant.id}`} 
            key={restaurant.id}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            prefetch={false}
          >
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={restaurant.logo || '/placeholder-logo.svg'}
                  alt={restaurant.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  style={{ width: 'auto', height: 'auto' }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{restaurant.name}</h3>
                </div>

                <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                  {restaurant.dashPass && (
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-flex items-center">
                      DashPass
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  ★ {getDefaultRating(restaurant.rating)} ({restaurant.reviews || "0"})
                </div>

                <div className="text-sm text-gray-500">{restaurant.time}</div>

                <div className="text-sm text-gray-500">{restaurant.deliveryFee}</div>

        
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
