"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useRef } from "react"

export default function PromoBanners() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollBanners = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 600
    const currentScroll = scrollContainerRef.current.scrollLeft

    scrollContainerRef.current.scrollTo({
      left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative mt-8">
      <div ref={scrollContainerRef} className="flex overflow-x-auto py-2 scrollbar-hide -mx-4 px-4 space-x-4">
        {/* Philz Coffee Promo */}
        <Link
          href="/store/philz-coffee"
          className="promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r from-amber-100 to-orange-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-gray-900">Free coffee upgrade with any order at Philz Coffee</h3>
              <p className="text-sm mt-2 text-gray-700">
                Upgrade to large size for free. Perfect for your morning boost. Valid until 30/6.
              </p>
              <div className="mt-4 inline-block">
                <button className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Order now
                </button>
              </div>
            </div>
            <div className="relative w-48 h-auto flex items-center justify-center">
              <Image
                src="https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/ac042b0c-d74a-48f9-92f7-3c4347d7ba25.png"
                alt="Philz Coffee"
                width={120}
                height={120}
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </Link>

        {/* Peet's Coffee Promo */}
        <Link
          href="/store/peet-s-coffee"
          className="promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r from-green-50 to-teal-50 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-gray-900">Buy 2 get 1 free on all beverages at Peet's Coffee</h3>
              <p className="text-sm mt-2 text-gray-700">
                Perfect for sharing or stocking up. Premium coffee at great value. Limited time offer.
              </p>
              <div className="mt-4 inline-block">
                <button className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">Order now</button>
              </div>
            </div>
            <div className="relative w-48 h-auto flex items-center justify-center">
              <Image
                src="https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/8ca5d03b-706e-4919-9746-ca9c45bc8b3d.png"
                alt="Peet's Coffee"
                width={120}
                height={120}
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </Link>

        {/* Starbucks Promo */}
        <Link
          href="/store/starbucks"
          className="promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r from-green-600 to-green-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex">
            <div className="p-6 flex-1 text-white">
              <h3 className="text-xl font-bold">Happy Hour: 50% off Frappuccinos at Starbucks</h3>
              <p className="text-sm mt-2 opacity-90">
                Cool down with your favorite Frappuccino. Available 2-5 PM daily. While stocks last.
              </p>
              <div className="mt-4 inline-block">
                <button className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-medium">
                  Order now
                </button>
              </div>
            </div>
            <div className="relative w-48 h-auto flex items-center justify-center">
              <Image
                src="https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/2c09d946-5237-4271-9f64-a23a83b3e8a1.05"
                alt="Starbucks"
                width={120}
                height={120}
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </Link>

        {/* Pressed Acai Bowls Promo */}
        <Link
          href="/store/pressed-acai-bowls"
          className="promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r from-purple-100 to-pink-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-gray-900">Healthy start: $3 off acai bowls at Pressed</h3>
              <p className="text-sm mt-2 text-gray-700">
                Fresh, nutritious and delicious. Perfect for breakfast or post-workout. Code: HEALTHY3
              </p>
              <div className="mt-4 inline-block">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Order now
                </button>
              </div>
            </div>
            <div className="relative w-48 h-auto flex items-center justify-center">
              <Image
                src="https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/55ec8325-0521-4d0f-96a3-68afd7fc36cf.jpeg"
                alt="Pressed Acai Bowls"
                width={120}
                height={120}
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </Link>

        {/* IL Canto Cafe Promo */}
        <Link
          href="/store/il-canto-cafe"
          className="promo-card flex-shrink-0 w-full max-w-xl bg-gradient-to-r from-yellow-50 to-orange-50 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-gray-900">
                Italian favorites: 20% off orders $30+ at IL Canto Cafe
              </h3>
              <p className="text-sm mt-2 text-gray-700">
                Authentic Italian cuisine delivered fresh. Pasta, pizza and more. Code: ITALIA20
              </p>
              <div className="mt-4 inline-block">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Order now
                </button>
              </div>
            </div>
            <div className="relative w-48 h-auto flex items-center justify-center">
              <Image
                src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto,width=800,quality=50/https://doordash-static.s3.amazonaws.com/media/photos/1ec80bad-7385-4de0-b4d9-634894f1f845-retina-large.jpg"
                alt="IL Canto Cafe"
                width={120}
                height={120}
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation buttons */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => scrollBanners("left")}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => scrollBanners("right")}
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
