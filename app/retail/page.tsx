"use client"

import CategoryFilters from "@/components/category-filters"
import StoreCard from "@/components/storeCard"
import GrocerySchedule from "@/components/grocery-schedule"
import { stores } from "@/constants/store"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cart-store"
import { CartProvider } from "@/context/cart-context"

// Retail-specific banner data
const retailBanners = [
  {
    id: "1",
    title: "Home improvement and hardware essentials from Lowe's",
    description: "Find tools, appliances, garden supplies, and home improvement materials for every project.",
    buttonText: "Shop now",
    backgroundColor: "#f0f8ff",
    buttonColor: "bg-[#004990] hover:bg-[#003d7a]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e35cca4a-a694-4eed-823f-7253f72b8e6f-retina-large.jpg",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
    link: "/convenience/store/lowes?storeType=retail"
  },
  {
    id: "2",
    title: "Office supplies and electronics from Staples",
    description: "Browse office furniture, tech accessories, printing services, and business essentials.",
    buttonText: "Shop Staples",
    backgroundColor: "#fff5f5",
    buttonColor: "bg-[#cc0000] hover:bg-[#b30000]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d6338d1-1d18-4cb3-b146-232913b74923-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
    link: "/retail/store/staples"
  }
];

export default function Retail() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const { setCurrentStore, clearCurrentStore } = useCartStore()
  const { updateSearchResults, clearSearchResults } = useCartStore()

  // Set category explicitly
  useEffect(() => {
    const cartStore = useCartStore.getState();
    cartStore.setCategory("retail");
    clearCurrentStore();
  }, []);

  const filteredStores = stores.filter(store => {
    if (activeFilters.length === 0) return true
    return activeFilters.every(filter => {
      if (filter === "Over 4.5") {
        return store.tags?.includes("Over 4.5")
      }
      if (filter === "Under 30 min") {
        return store.tags?.includes("Under 30 min")
      }
      return store.tags?.includes(filter)
    })
  })

  const handleFilterChange = (filter: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter)
      }
      return [...prev, filter]
    })
  }

  const handleReset = () => {
    setActiveFilters([])
    clearSearchResults();
  }

  const nearbyStores = filteredStores.filter(store => store.isNearYou)
  const resultCount = filteredStores.length

  return (
    <CartProvider category="retail">
      <main className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* Promotional Banners */}
        <GrocerySchedule promos={retailBanners} />

        <CategoryFilters
          categories={[
            { name: "Flowers", href: "#" },
            { name: "Retail", href: "#" },
            { name: "Convenience", href: "#" },
            { name: "Beauty", href: "#" },
            { name: "Alcohol", href: "#" },
          ]}
          showRating={true}
          showTime={true}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {activeFilters.length > 0 && (
          <div className="flex items-center justify-between mt-6 mb-2">
            <p className="text-gray-900 font-medium">{resultCount} results</p>
          </div>
        )}
        {activeFilters.length === 0 && (
          <>
            <h2 className="text-xl font-bold mt-8 mb-4">Stores Near You</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyStores.map((store) => (
                <StoreCard key={store.id} {...store} storeType="retail" />
              ))}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Popular Deals</h2>
              </div>
              <div
                className="border border-gray-200 rounded-lg p-4 max-w-[368px] cursor-pointer hover:bg-gray-50"
                onClick={() => window.location.href = '/convenience/store/lowes?storeType=retail'}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png"
                    alt="Lowe's"
                    width={36}
                    height={36}
                    className="rounded-full"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-gray-900">Lowe's</span>
                    <span className="text-sm text-gray-500">33 min</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>

                <div className="grid grid-cols-2 gap-x-24 gap-y-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e35cca4a-a694-4eed-823f-7253f72b8e6f-retina-large.jpg"
                      alt="Microwave"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$67.60</p>
                      <p className="text-sm text-gray-500 line-through">$169.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d6338d1-1d18-4cb3-b146-232913b74923-retina-large.png"
                      alt="Air Filter"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$2.42</p>
                      <p className="text-sm text-gray-500 line-through">$50.00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e4bee36-6259-4606-9e83-6656e18cf869-retina-large.jpg"
                      alt="Fertilizer"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$2.00</p>
                      <p className="text-sm text-gray-500 line-through">$4.50</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5c392522-4380-4812-a664-814edfa3463d-retina-large.png"
                      alt="Vacuum"
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div>
                      <p className="text-red-600 font-bold">$89.99</p>
                      <p className="text-sm text-gray-500 line-through">$99.99</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">All stores</h2>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} {...store} storeType="retail" />
          ))}
        </div>
      </main>
    </CartProvider>
  )
}

