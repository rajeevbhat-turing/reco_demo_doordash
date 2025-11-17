"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PromoBanners() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  const banners = [
    {
      id: 'philz-coffee',
      title: 'Handcrafted specialty coffee at Philz Coffee',
      description: 'asdasdasasdasdasd our signature blends, cold brews, and custom coffee creations made just for you.',
      href: '/store/philz-coffee',
      buttonText: 'Order now',
      buttonColor: 'bg-amber-600',
      gradient: 'from-amber-100 to-orange-100',
      image: 'https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/ac042b0c-d74a-48f9-92f7-3c4347d7ba25.png',
      alt: 'Philz Coffee'
    },
    {
      id: 'peets-coffee',
      title: 'Premium coffee and fresh pastries at Peet\'s Coffee',
      description: 'Experience rich, deep-roasted coffee, espresso drinks, and delicious breakfast items.',
      href: '/store/peet\'s-coffee',
      buttonText: 'Order now',
      buttonColor: 'bg-teal-600',
      gradient: 'from-green-50 to-teal-50',
      image: 'https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/8ca5d03b-706e-4919-9746-ca9c45bc8b3d.png',
      alt: 'Peet\'s Coffee'
    },
    {
      id: 'starbucks',
      title: 'Classic favorites and seasonal specials at Starbucks',
      description: 'Enjoy our signature Frappuccinos, lattes, teas, and fresh food options.',
      href: '/store/starbucks-(299-fremont-street)',
      buttonText: 'Order now',
      buttonColor: 'bg-white text-green-600',
      gradient: 'from-green-600 to-green-700',
      textColor: 'text-white',
      image: 'https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/2c09d946-5237-4271-9f64-a23a83b3e8a1.05',
      alt: 'Starbucks'
    },
    {
      id: 'pressed-acai',
      title: 'Fresh acai bowls and healthy smoothies at Pressed',
      description: 'Nutritious acai bowls, cold-pressed juices, and wellness shots made with organic ingredients.',
      href: '/store/pressed-acai-bowls',
      buttonText: 'Order now',
      buttonColor: 'bg-purple-600',
      gradient: 'from-purple-100 to-pink-100',
      image: 'https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/55ec8325-0521-4d0f-96a3-68afd7fc36cf.jpeg',
      alt: 'Pressed Acai Bowls'
    },
    {
      id: 'il-canto-cafe',
      title: 'Authentic Italian cuisine at IL Canto Cafe',
      description: 'Traditional pasta dishes, wood-fired pizzas, and Italian specialties made with fresh ingredients.',
      href: '/store/il-canto-cafe',
      buttonText: 'Order now',
      buttonColor: 'bg-orange-600',
      gradient: 'from-yellow-50 to-orange-50',
      image: 'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto,width=800,quality=50/https://doordash-static.s3.amazonaws.com/media/photos/1ec80bad-7385-4de0-b4d9-634894f1f845-retina-large.jpg',
      alt: 'IL Canto Cafe'
    }
  ]

  const scrollBanners = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0
    const gap = 16 // gap-4 = 16px
    const scrollAmount = cardWidth + gap

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      setCurrentIndex(prev => Math.max(0, prev - 1))
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setCurrentIndex(prev => Math.min(banners.length - 1, prev + 1))
    }
    
    // Pause auto-scroll when user manually navigates
    setIsAutoScrolling(false)
    setTimeout(() => setIsAutoScrolling(true), 5000)
  }

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev >= banners.length - 1 ? 0 : prev + 1
        
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current
          const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0
          const gap = 16
          const scrollAmount = (cardWidth + gap) * nextIndex
          
          if (nextIndex === 0) {
            // Reset to beginning
            container.scrollTo({ left: 0, behavior: "smooth" })
          } else {
            container.scrollTo({ left: scrollAmount, behavior: "smooth" })
          }
        }
        
        return nextIndex
      })
    }, 4000) // Change banner every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoScrolling, banners.length])

  return (
    <div className="relative mb-6">
      {/* Scrollable Banner Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className={`promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r ${banner.gradient} overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-lg`}
            style={{ scrollSnapAlign: "start" }}
            prefetch={false}
          >
            <div className="flex">
              <div className="p-6 flex-1">
                <h3 className={`text-xl font-bold ${banner.textColor || 'text-gray-900'}`}>
                  {banner.title}
                </h3>
                <p className={`text-sm mt-2 ${banner.textColor ? 'opacity-90' : 'text-gray-700'}`}>
                  {banner.description}
                </p>
                <div className="mt-4 inline-block">
                  <button className={`${banner.buttonColor} ${banner.buttonColor.includes('text-') ? '' : 'text-white'} px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-shadow`}>
                    {banner.buttonText}
                  </button>
                </div>
              </div>
              <div className="relative w-48 h-auto flex items-center justify-center">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  width={120}
                  height={120}
                  className="object-contain rounded-full"
                  style={{ width: 'auto', height: 'auto' }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-logo.svg';
                  }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2">
        <button
          onClick={() => scrollBanners("left")}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute -right-4 top-1/2 -translate-y-1/2">
        <button
          onClick={() => scrollBanners("right")}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          disabled={currentIndex >= banners.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Indicator dots
      <div className="flex justify-center space-x-2 mt-4">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current
                const cardWidth = container.querySelector('.promo-card')?.clientWidth || 0
                const gap = 16
                const scrollAmount = (cardWidth + gap) * index
                container.scrollTo({ left: scrollAmount, behavior: "smooth" })
              }
              setIsAutoScrolling(false)
              setTimeout(() => setIsAutoScrolling(true), 5000)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-gray-800 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div> */}
    </div>
  )
}
