"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import type { Restaurant } from "@/constants/restaurants"

interface RestaurantSectionProps {
  title: string
  restaurants: Restaurant[]
  seeAllLink?: string
}

export default function RestaurantSection({ title, restaurants, seeAllLink = "#" }: RestaurantSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [cardWidth, setCardWidth] = useState(350)
  const [visibleCards, setVisibleCards] = useState(3)
  const [containerWidth, setContainerWidth] = useState(0)

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

  return (
    <div className="mt-10 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          <Link href={seeAllLink} className="text-gray-900 font-medium text-sm">
            See All
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className={`p-2 rounded-full border border-gray-200 ${!showLeftArrow ? "text-gray-300" : "text-gray-600"}`}
              disabled={!showLeftArrow}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className={`p-2 rounded-full border border-gray-200 ${!showRightArrow ? "text-gray-300" : "text-gray-600"}`}
              disabled={!showRightArrow}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x"
        onScroll={handleScroll}
      >
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="restaurant-card flex-shrink-0 snap-start"
            style={{ width: `${cardWidth}px` }}
          >
            <Link href={`/store/${restaurant.id}`} className="block">
              <div className="relative h-[200px] bg-gray-100">
                <Image
                  src={restaurant.banner || `/placeholder.svg?height=200&width=400&query=${restaurant.name} restaurant`}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                  {restaurant.dashPass && (
                    <div className="text-teal-600">
                      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M18.5 1.5L11.5 9.5L7.5 5.5L1.5 10.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Heart className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center mt-1 text-sm text-gray-700 flex-wrap">
                <div className="flex items-center">
                  <span className="font-semibold">{restaurant.rating}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="ml-1">
                    <path d="M8 0L10.2571 5.08631L16 5.87013L11.8 9.79752L12.9443 15.5L8 12.5863L3.05573 15.5L4.2 9.79752L0 5.87013L5.74286 5.08631L8 0Z" />
                  </svg>
                </div>
                <span className="mx-1">({restaurant.reviews})</span>
                <span className="mx-1">•</span>
                <span>{restaurant.distance}</span>
                <span className="mx-1">•</span>
                <span>{restaurant.time}</span>
              </div>

              <div className="mt-1 text-sm text-gray-500">{restaurant.deliveryFee}</div>

              {restaurant.discount && (
                <div className="mt-1 text-sm text-red-600 font-medium">{restaurant.discount}</div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
