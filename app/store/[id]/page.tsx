"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronDown, Info, ChevronLeft, ChevronRight, ExternalLink, Heart, Star, Search } from "lucide-react"
import { getRestaurantById } from "@/constants/restaurants"
import { getFeaturedMenuItemsByRestaurantId, getMenuItemsByCategory } from "@/constants/menu-items"
import { getMenuCategoriesByRestaurantId } from "@/constants/menu-categories"
import { getDealsByRestaurantId } from "@/constants/deals"
import { useCartStore } from "@/store/cart-store"
import MenuItemDialog from "@/components/menu-item-dialog"
import GroupOrderDialog from "@/components/group-order-dialog"

function SearchBar() {
  return (
    <div className="w-2xl px-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search McDonald's ()"
          className="w-full bg-gray-100 rounded-full py-3 pl-10 pr-4 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>
    </div>
  )
}

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
  const featuredItemsRef = useRef<HTMLDivElement>(null)
  const dealsRef = useRef<HTMLDivElement>(null)

  // Dialog states
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [groupOrderDialogOpen, setGroupOrderDialogOpen] = useState(false)


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

  const scrollContainer = (containerRef: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (!containerRef.current) return

    const scrollAmount = 600 // Adjust this value based on how far you want to scroll
    const currentScroll = containerRef.current.scrollLeft

    containerRef.current.scrollTo({
      left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: "smooth",
    })
  }

  const openItemDialog = (item: any) => {
    setSelectedItem(item)
    setMenuItemDialogOpen(true)
  }

  const openGroupOrderDialog = () => {
    setGroupOrderDialogOpen(true)
  }

  return (
    <div className="px-8 py-16">

      {/* Banner Image */}
      <div className="relative w-full h-[220px] rounded-bl-xl rounded-br-xl overflow-hidden">
        <Image
          src={restaurant.banner}
          alt="McDonald's Banner"
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <button className="bg-white rounded-full p-2 flex items-center gap-2 shadow-md">
            <Heart className="h-5 w-5" />
            <span className="font-medium pr-1">Save</span>
          </button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-between mt-6 mb-6">
          <h1
            style={{
              fontFamily:
                "TT Norms -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
            }}
            className="text-2xl font-bold"
          >
            {restaurant.name}
          </h1>
          <SearchBar />
        </div>

        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <div className="bg-white rounded-lg p-4 pl-0 pt-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="styles__StyledInlineSvg-sc-12l8vvi-0 iIiQzo fetched-icon"
              >
                <path
                  d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                  fill="var(--usage-color-brand-dashpass)"
                ></path>
              </svg>
              <h2 className="font-bold text-lg mb-2">Store Info</h2>
              {restaurant.dashPass && (
                <div className="flex items-center text-[#00838a] mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="mr-1"
                >
                  <path
                    d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                    fill="#00838a"
                  ></path>
                </svg>
                <span className="text-sm font-medium">DashPass</span>
              </div>
              )}
              <div className="flex items-center mb-1">
                <span className="text-sm">
                  {restaurant.rating} ★ ({restaurant.reviews} ratings) •{" "}
                  {restaurant.distance}
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
              <div className="flex justify-center mt-6">
                <button className="text-gray-600 font-medium text-sm border border-gray-300 rounded-full px-6 py-1">
                  See More
                </button>
              </div>
            </div>
            <div ref={menuContainerRef} className="relative mt-4">
              <div
                ref={menuRef}
                className="overflow-hidden"
                style={{
                  position: "sticky",
                  top: "80px",
                  transition: "none",
                  zIndex: 10,
                }}
              >
                <div className="p-4">
                  <button className="w-full flex items-center justify-between font-medium">
                    <span>Regular Menu</span>
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  <div className="text-sm text-gray-600 mt-1">10:30 am - 11:59 pm</div>
                </div>
                <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <ul className="space-y-1">
                    {menuCategories.map((category) => (
                      <li key={category.id}>
                        <button
                          className={`w-full text-left px-2 py-2 rounded-md ${
                            activeCategory === category.name
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
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

          <div className="w-full md:w-3/4 md:pl-4">
            <div className="flex items-center justify-between mb-4 border border-gray-200 rounded-lg p-4">
              <div>
                <button className="border border-gray-200 px-4 py-2 flex items-center rounded-full" style={{background: "#f1f1f1"}} onClick={openGroupOrderDialog}>
                  <span className="mr-1">Group Order</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-[#e8f7f7] rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#3d8f8f]">A$0 delivery fee</span>
                    <div className="flex items-center text-gray-800 text-sm">
                      <span>pricing & fees</span>
                      <Info className="h-4 w-4 ml-1 text-gray-500" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">21 min</div>
                  <div className="text-sm text-gray-600">delivery time</div>
                </div>
              </div>
            </div>

                        {/* DashPass Promo Banner */}
                        <div className="my-6 rounded-lg overflow-hidden">
              <div ref={dealsRef} className="flex overflow-x-auto hide-scrollbar">
                <div className="min-w-full flex-shrink-0 relative bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">Enjoy $0 delivery fees and lower service fees</h3>
                      <p className="text-gray-700">on eligible orders with DashPass.</p>
                    </div>
                  </div>
                </div>
                {/* Additional promo items */}
                <div className="min-w-full flex-shrink-0 relative bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">Save 20% on orders over $25</h3>
                      <p className="text-gray-700">Limited time offer for new customers.</p>
                    </div>
                  </div>
                </div>
                <div className="min-w-full flex-shrink-0 relative bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">Free McFlurry with orders over $20</h3>
                      <p className="text-gray-700">Use code MCFLURRY at checkout.</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full border border-gray-200 bg-white"
                      onClick={() => scrollContainer(dealsRef, "left")}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 rounded-full border border-gray-200 bg-white"
                      onClick={() => scrollContainer(dealsRef, "right")}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Indicator Dots */}
            <div className="flex justify-center space-x-1 my-4">
              <div className="h-2 w-2 rounded-full bg-gray-200"></div>
              <div className="h-2 w-2 rounded-full bg-gray-200"></div>
              <div className="h-2 w-6 rounded-full bg-red-500"></div>
            </div>

            {/* Featured Items */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Featured Items</h2>
                <div className="flex">
                  <button
                    className="p-2 rounded-full border border-gray-200 mr-2"
                    onClick={() => scrollContainer(featuredItemsRef, "left")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 rounded-full border border-gray-200"
                    onClick={() => scrollContainer(featuredItemsRef, "right")}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div ref={featuredItemsRef} className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[200px] border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => openItemDialog(item)}
                  >
                    <div className="relative h-40">
                      <Image
                        src={item.image || "/placeholder.svg?height=160&width=200&query=burger"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
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
                <h3 className="text-lg font-medium mb-4">
                  Be the first to review
                </h3>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-gray-300" />
                  ))}
                </div>
                <button className="text-gray-600 font-medium">
                  Start your review
                </button>
              </div>
            </div>

            {/* Menu Sections */}
            <div
              ref={(el) => (sectionRefs.current["Featured Items"] = el)}
              className="mt-8 pt-4"
              id="featured-items"
            >
              <h2 className="text-xl font-bold mb-4">Featured Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden flex cursor-pointer"
                    onClick={() => openItemDialog(item)}
                  >
                    <div className="p-3 flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
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

            <div
              ref={(el) => (sectionRefs.current["Most Ordered"] = el)}
              className="mt-8 pt-4"
              id="most-ordered"
            >
              <h2 className="text-xl font-bold mb-4">Most Ordered</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mostOrderedItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openItemDialog(item)}
                  >
                    <div className="relative h-40">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        className="absolute bottom-3 right-3 bg-white rounded-full p-1 shadow-md"
                        onClick={() => handleAddToCart(item)}
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.calories && (
                        <p className="text-sm text-gray-500">
                          ({item.calories})
                        </p>
                      )}
                      <p className="text-gray-900 mt-1">{item.price}</p>
                      {item.rating && (
                        <div className="flex items-center mt-1">
                          <span className="text-sm">
                            {Math.round(item.rating * 100)}%
                          </span>
                          {item.ratingCount && (
                            <span className="text-sm text-gray-500 ml-1">
                              ({item.ratingCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={(el) => (sectionRefs.current["Family & Sharing"] = el)}
              className="mt-8 pt-4"
              id="family-sharing"
            >
              <h2 className="text-xl font-bold mb-4">Family & Sharing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familySharingItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openItemDialog(item)}
                  >
                    <div className="p-3 flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.calories && (
                          <p className="text-sm text-gray-500">
                            ({item.calories})
                          </p>
                        )}
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

            <div
              ref={(el) => (sectionRefs.current["Beef"] = el)}
              className="mt-8 pt-4"
              id="beef"
            >
              <h2 className="text-xl font-bold mb-4">Beef</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beefItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openItemDialog(item)}
                  >
                    <div className="p-3 flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.calories && (
                          <p className="text-sm text-gray-500">
                            ({item.calories})
                          </p>
                        )}
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
                (category) =>
                  ![
                    "Featured Items",
                    "Most Ordered",
                    "Family & Sharing",
                    "Beef",
                  ].includes(category.name)
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
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="p-3 flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.calories && (
                              <p className="text-sm text-gray-500">
                                ({item.calories})
                              </p>
                            )}
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
      {/* Menu Item Dialog */}
      <MenuItemDialog isOpen={menuItemDialogOpen} onClose={() => setMenuItemDialogOpen(false)} item={selectedItem} />
      {/* Group Order Dialog */}
      <GroupOrderDialog isOpen={groupOrderDialogOpen} onClose={() => setGroupOrderDialogOpen(false)} />
    </div>
  );
}
