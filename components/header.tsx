"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Bell, ChevronDown, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import SearchBar from "@/components/search-bar"
import CartSidebar from "@/components/cart-sidebar"

export default function Header() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Update cart count whenever the cart changes
  useEffect(() => {
    // Initial cart count
    setCartItemCount(getTotalItems())

    // Subscribe to cart store changes
    const unsubscribeFromStore = useCartStore.subscribe((state) => {
      setCartItemCount(state.getTotalItems())
    })

    return () => {
      unsubscribeFromStore()
    }
  }, [getTotalItems])

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center flex-1 space-x-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="font-bold text-2xl text-[#FF3008]">DOORDASH</div>
            </Link>

            {/* Search - grows to take remaining space */}
            <div className="flex-grow">
              <SearchBar />
            </div>
          </div>

          <div className="flex">
            {/* Location */}
            <div className="flex items-center mr-4 bg-[#f1f1f1] rounded-full px-5">
              <MapPin className="h-5 w-5 text-gray-700 mr-1" />
              <span className="text-sm font-medium mr-1">Delhi6 Sweets & Savou</span>
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </div>

            {/* Delivery/Pickup */}
            <div className="flex items-center space-x-2 mr-3">
              <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">Delivery</button>
              <button className="text-gray-900 px-4 bg-[#f1f1f1] py-2 rounded-full text-sm font-medium">Pickup</button>
            </div>

            {/* Notifications */}
            <div className="flex items-center space-x-2">
              <button className="h-8 w-8 rounded-full bg-[#f3f3f3] flex items-center justify-center">
                <Bell className="h-4 w-4 text-black" />
              </button>
            </div>

            {/* Cart */}
            <div className="ml-4">
              <button
                className="relative h-8 w-14 rounded-full bg-[#ff3008] text-white text-sm font-semibold flex items-center justify-center"
                onClick={toggleCart}
              >
                <ShoppingCart className="h-4 w-4 text-white mr-1" />
                <span className="font-medium">{cartItemCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
