"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

// Updated banners focusing on store categories and items instead of promotions
const defaultPromos = [
  {
    id: "1",
    title: "Fresh produce and dairy essentials from Safeway",
    description: "Discover fresh fruits, vegetables, milk, cheese, and organic options for your daily needs.",
    buttonText: "Shop now",
    backgroundColor: "#f7f3e8",
    buttonColor: "bg-[#eb1800] hover:bg-[#cf1600]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/757d11c9-3d97-41d8-9fe0-e1cc4ff46294-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png",
    link: "/grocery/store/2"
  },
  {
    id: "2", 
    title: "Quality groceries and household items at Gus's Community Market",
    description: "Browse pantry staples, fresh meats, bakery items, and cleaning supplies all in one place.",
    buttonText: "Order now",
    backgroundColor: "#fcee21",
    buttonColor: "bg-[#00723B] hover:bg-[#00612e]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1531ea13-c071-4cf6-9b73-be9d4a650e28-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1ad70c1a-791f-46dd-87c7-14a84d427230.jpg",
    link: "/grocery/store/8"
  },
  {
    id: "3",
    title: "Great deals and discounted prices at Grocery Outlet",
    description: "Find name-brand groceries at discounted prices, fresh produce, and everyday essentials.",
    buttonText: "Shop deals",
    backgroundColor: "#e8f5e8",
    buttonColor: "bg-[#228B22] hover:bg-[#1e7d1e]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/df09eac7-b06f-4d31-9e18-f7f333d6ebda.png",
    link: "/grocery/store/9"
  }
];

interface PromoData {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  image: string;
  logoImage?: string;
  link?: string;
}

interface GroceryScheduleProps {
  data?: {
    title: string;
    description: string;
    buttonText: string;
    stores: Array<{
      name: string;
      logo: string;
    }>;
  };
  promos?: PromoData[];
}

export default function GrocerySchedule({ data, promos = defaultPromos }: GroceryScheduleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || promos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev >= promos.length - 1 ? 0 : prev + 1
        return nextIndex
      })
    }, 5000) // Change banner every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoScrolling, promos.length])

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index)
    setIsAutoScrolling(false)
    setTimeout(() => setIsAutoScrolling(true), 5000)
  }

  const navigateBanner = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentIndex(prev => prev > 0 ? prev - 1 : promos.length - 1)
    } else {
      setCurrentIndex(prev => prev < promos.length - 1 ? prev + 1 : 0)
    }
    setIsAutoScrolling(false)
    setTimeout(() => setIsAutoScrolling(true), 5000)
  }

  return (
    <div className="mt-4 relative">
      <div 
        className="w-full"
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        {/* Show only the current banner */}
        <div 
          className="rounded-lg overflow-hidden flex transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg"
          style={{ 
            backgroundColor: promos[currentIndex].backgroundColor
          }}
        >
          <div className="p-6 flex-1">
            {promos[currentIndex].logoImage && (
              <div className="mb-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Image 
                  src={promos[currentIndex].logoImage} 
                  alt="Store Logo" 
                  width={24} 
                  height={24} 
                  className="object-contain" 
                />
              </div>
            )}
            <h2 className={`text-xl font-bold mb-2 ${promos[currentIndex].textColor}`}>
              {promos[currentIndex].description}
            </h2>
            <p className={`text-sm mb-4 ${promos[currentIndex].textColor} opacity-80`}>
              {promos[currentIndex].title}
            </p>
            <a 
              href={promos[currentIndex].link || "#"}
              className="inline-block"
            >
              <Button className={`rounded-full text-white ${promos[currentIndex].buttonColor} hover:shadow-md transition-all duration-200 hover:scale-105`}>
                {promos[currentIndex].buttonText}
              </Button>
            </a>
          </div>
          <div className="relative w-1/2 hidden md:block">
            <Image 
              src={promos[currentIndex].image} 
              alt={promos[currentIndex].title} 
              fill
              className="object-cover" 
            />
          </div>
        </div>
      </div>

      {/* Navigation controls - only show if multiple promos */}
      {promos.length > 1 && (
        <>
          {/* Navigation arrows */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
            <button
              onClick={() => navigateBanner("left")}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
            <button
              onClick={() => navigateBanner("right")}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Indicator dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {promos.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}