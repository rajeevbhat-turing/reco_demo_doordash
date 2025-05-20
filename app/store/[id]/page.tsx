"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronDown, Info, ChevronLeft, ChevronRight, ExternalLink, Star } from "lucide-react"
import { getRestaurantById } from "@/constants/restaurants"
import { getFeaturedMenuItemsByRestaurantId, getMenuItemsByCategory } from "@/constants/menu-items"
import { getMenuCategoriesByRestaurantId } from "@/constants/menu-categories"
import { getDealsByRestaurantId } from "@/constants/deals"
import { useCartStore } from "@/store/cart-store"

export default function RestaurantPage() {
  const params = useParams()
  const id = params.id as string
  const [restaurant, setRestaurant] = useState<any>(null)
  const [featuredItems, setFeaturedItems] = useState<any[]>([])
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState("Featured Items")
  const [mostOrderedItems, setMostOrderedItems] = useState<any[]>([])
  const [familySharingItems, setFamilySharingItems] = useState<any[]>([])
  const [beefItems, setBeefItems] = useState<any[]>([])
  const [menuTopPosition, setMenuTopPosition] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const addToCart = useCartStore((state) => state.addItem)
  const ticking = useRef(false)

  useEffect(() => {
    if (id) {
      const restaurantData = getRestaurantById(id)
      const featuredItemsData = getFeaturedMenuItemsByRestaurantId(id)
      const menuCategoriesData = getMenuCategoriesByRestaurantId(id)
      const dealsData = getDealsByRestaurantId(id)
      const mostOrderedItemsData = getMenuItemsByCategory(id, "Most Ordered")
      const familySharingItemsData = getMenuItemsByCategory(id, "Family & Sharing")
      const beefItemsData = getMenuItemsByCategory(id, "Beef")

      setRestaurant(restaurantData)
      setFeaturedItems(featuredItemsData)
      setMenuCategories(menuCategoriesData)
      setDeals(dealsData)
      setMostOrderedItems(mostOrderedItemsData)
      setFamilySharingItems(familySharingItemsData)
      setBeefItems(beefItemsData)
    }
  }, [id])

  // Save the initial position of the menu after the component mounts
  useEffect(() => {
    if (menuRef.current && menuContainerRef.current) {
      const rect = menuContainerRef.current.getBoundingClientRect()
      setMenuTopPosition(rect.top + window.scrollY)
    }
  }, [restaurant])

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true

      requestAnimationFrame(() => {
        // Find which section is currently in view
        const sectionPositions = Object.entries(sectionRefs.current).map(([category, ref]) => {
          const position = ref?.getBoundingClientRect().top || 0
          return { category, position }
        })

        const currentSection = sectionPositions
          .filter((section) => section.position <= 200)
          .sort((a, b) => b.position - a.position)[0]

        if (currentSection && currentSection.category !== activeCategory) {
          setActiveCategory(currentSection.category)
        }

        ticking.current = false
      })
    }
  }, [activeCategory])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToSection = (category: string) => {
    setActiveCategory(category)
    sectionRefs.current[category]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (!restaurant) {
    return <div className="p-8 text-center">Loading...</div>
  }

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      image: item.image,
    })
  }

  return (
    <div className="pb-16 pt-16">
      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="mt-6 mb-6">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        </div>

        <div className="flex flex-wrap justify-between mb-6">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <div className="bg-white rounded-lg p-4">
              <h2 className="font-bold text-lg mb-2">Store Info</h2>
              {restaurant.dashPass && (
                <div className="flex items-center text-blue-700 mb-2">
                  <span className="text-sm font-medium">DashPass</span>
                </div>
              )}
              <div className="flex items-center mb-1">
                <span className="text-sm">
                  {restaurant.rating} ★ ({restaurant.reviews} ratings) • {restaurant.distance}
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-sm">
                  {restaurant.priceRange} • {restaurant.cuisine}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span>Service fees apply</span>
                <Info className="h-4 w-4 ml-1" />
              </div>
              <button className="mt-4 text-[#FF3008] font-medium text-sm">See More</button>
            </div>
            <div ref={menuContainerRef} className="relative mt-4">
              <div
                ref={menuRef}
                className="border border-gray-200 rounded-lg overflow-hidden"
                style={{
                  position: "sticky",
                  top: "80px",
                  transition: "none",
                  zIndex: 10,
                }}
              >
                <div className="p-4 border-b border-gray-200">
                  <button className="w-full flex items-center justify-between font-medium">
                    <span>Overnight Menu</span>
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  <div className="text-sm text-gray-600 mt-1">12:00 am - 3:59 am</div>
                </div>
                <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <ul className="space-y-1">
                    {menuCategories.map((category) => (
                      <li key={category.id}>
                        <button
                          className={`w-full text-left px-2 py-2 rounded-md ${activeCategory === category.name ? "bg-gray-100 font-medium" : ""}`}
                          onClick={() => scrollToSection(category.name)}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 md:pl-4">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <button className="border border-gray-200 rounded-lg px-4 py-2 flex items-center">
                  <span className="mr-1">Group Order</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-sm">
                  <span className="font-medium">A$0 delivery fee</span>
                  <div className="flex items-center text-gray-600">
                    <span>pricing & fees</span>
                    <Info className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{restaurant.time}</div>
                <div className="text-sm text-gray-600">delivery time</div>
              </div>
            </div>
            {/* Deals & Benefits */}
            {deals.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Deals & benefits</h2>
                  <div className="flex">
                    <button className="text-gray-900 font-medium text-sm mr-2">See All</button>
                    <button className="p-2 rounded-full border border-gray-200 mr-2">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full border border-gray-200">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="min-w-[400px] border border-gray-200 rounded-lg p-4 flex items-center"
                    >
                      {deal.icon && (
                        <Image
                          src={deal.icon || "/placeholder.svg"}
                          alt="DashPass"
                          width={40}
                          height={40}
                          className="mr-3"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{deal.title}</h3>
                        <p className="text-sm text-gray-600">{deal.description}</p>
                      </div>
                      {deal.buttonText && (
                        <Link href={deal.buttonLink || "#"} className="ml-4">
                          <button className="border border-gray-300 rounded-lg px-4 py-1 text-sm font-medium flex items-center">
                            {deal.buttonText}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Items */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Featured Items</h2>
                <div className="flex">
                  <button className="p-2 rounded-full border border-gray-200 mr-2">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full border border-gray-200">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {featuredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <button
                        className="absolute bottom-3 right-3 bg-white rounded-full p-1 shadow-md"
                        onClick={() => handleAddToCart(item)}
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-900 mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Be the first to review</h3>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-gray-300" />
                  ))}
                </div>
                <button className="text-gray-600 font-medium">Start your review</button>
              </div>
            </div>

            {/* Menu Sections */}
            <div ref={(el) => (sectionRefs.current["Featured Items"] = el)} className="mt-8 pt-4" id="featured-items">
              <h2 className="text-xl font-bold mb-4">Featured Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden flex">
                    <div className="p-3 flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-gray-900 mt-2">{item.price}</p>
                    </div>
                    <div className="relative w-24 h-24 m-3">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                        onClick={() => handleAddToCart(item)}
                      >
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={(el) => (sectionRefs.current["Most Ordered"] = el)} className="mt-8 pt-4" id="most-ordered">
              <h2 className="text-xl font-bold mb-4">Most Ordered</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mostOrderedItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <button
                        className="absolute bottom-3 right-3 bg-white rounded-full p-1 shadow-md"
                        onClick={() => handleAddToCart(item)}
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.calories && <p className="text-sm text-gray-500">({item.calories})</p>}
                      <p className="text-gray-900 mt-1">{item.price}</p>
                      {item.rating && (
                        <div className="flex items-center mt-1">
                          <span className="text-sm">{Math.round(item.rating * 100)}%</span>
                          {item.ratingCount && <span className="text-sm text-gray-500 ml-1">({item.ratingCount})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={(el) => (sectionRefs.current["Family & Sharing"] = el)} className="mt-8 pt-4" id="family-sharing">
              <h2 className="text-xl font-bold mb-4">Family & Sharing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familySharingItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.calories && <p className="text-sm text-gray-500">({item.calories})</p>}
                        <p className="text-gray-900 mt-1">{item.price}</p>
                      </div>
                      <div className="relative w-24 h-24">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                          onClick={() => handleAddToCart(item)}
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={(el) => (sectionRefs.current["Beef"] = el)} className="mt-8 pt-4" id="beef">
              <h2 className="text-xl font-bold mb-4">Beef</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beefItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.calories && <p className="text-sm text-gray-500">({item.calories})</p>}
                        <p className="text-gray-900 mt-1">{item.price}</p>
                      </div>
                      <div className="relative w-24 h-24">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                          onClick={() => handleAddToCart(item)}
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add refs for other menu categories */}
            {menuCategories
              .filter(
                (category) => !["Featured Items", "Most Ordered", "Family & Sharing", "Beef"].includes(category.name),
              )
              .map((category) => (
                <div
                  key={category.id}
                  ref={(el) => (sectionRefs.current[category.name] = el)}
                  className="mt-8 pt-4"
                  id={category.name.toLowerCase().replace(/\s+/g, "-")}
                >
                  <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getMenuItemsByCategory(id, category.name).map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.calories && <p className="text-sm text-gray-500">({item.calories})</p>}
                            <p className="text-gray-900 mt-1">{item.price}</p>
                          </div>
                          <div className="relative w-24 h-24">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <button
                              className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                              onClick={() => handleAddToCart(item)}
                            >
                              <span className="text-lg font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
