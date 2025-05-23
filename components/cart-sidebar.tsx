"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronRight, ChevronLeft, Plus } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { getRestaurantById } from "@/constants/restaurants"
import { getMenuItemsByRestaurantId } from "@/constants/menu-items"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, currentRestaurantId, updateQuantity, removeItem, clearCart, getTotalPrice, addItem } = useCartStore()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [complementItems, setComplementItems] = useState<any[]>([])
  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(null)

  // Function to fetch complement items - moved outside useEffect for clarity
  const fetchComplementItems = useCallback(
    (currentId: string) => {
      if (!currentId) {
        setComplementItems([])
        return
      }

      // Get restaurant data
      const restaurantData = getRestaurantById(currentId)
      setRestaurant(restaurantData)

      // Get menu items strictly from this restaurant
      const menuItems = getMenuItemsByRestaurantId(currentId)

      // Verify each item has the correct restaurantId
      const verifiedMenuItems = menuItems.filter((item) => {
        return item.restaurantId === currentId
      })

      // Get items already in cart
      const cartItemIds = items.map((item) => item.id)

      // Filter out items already in cart
      const availableItems = verifiedMenuItems.filter((item) => !cartItemIds.includes(item.id))

      if (availableItems.length === 0) {
        setComplementItems([])
        return
      }

      // Prioritize certain types of items
      const prioritizedItems = availableItems.filter(
        (item) =>
          item.popular ||
          item.category?.toLowerCase().includes("dessert") ||
          item.category?.toLowerCase().includes("drink") ||
          item.category?.toLowerCase().includes("side") ||
          item.category?.toLowerCase().includes("beverage") ||
          item.name.toLowerCase().includes("shake") ||
          item.name.toLowerCase().includes("fries") ||
          item.name.toLowerCase().includes("cookie") ||
          item.name.toLowerCase().includes("pie") ||
          item.name.toLowerCase().includes("ice cream") ||
          item.name.toLowerCase().includes("sundae"),
      )

      // Use prioritized items if available, otherwise use any available items
      const itemsToShow = prioritizedItems.length > 0 ? prioritizedItems : availableItems

      // Shuffle and take first 5 items
      const shuffledItems = itemsToShow
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          restaurantId: item.restaurantId,
          name: item.name,
          price: item.price,
          image: item.image || "/diverse-food-spread.png",
        }))

      setComplementItems(shuffledItems)
    },
    [items],
  )

  useEffect(() => {
    // Clear complement items when restaurant changes
    if (currentRestaurantId !== lastRestaurantId) {
      setComplementItems([])
      setLastRestaurantId(currentRestaurantId)

      if (currentRestaurantId) {
        fetchComplementItems(currentRestaurantId)
      } else {
        setRestaurant(null)
      }
    }
  }, [currentRestaurantId, lastRestaurantId, fetchComplementItems])

  useEffect(() => {
    if (currentRestaurantId && currentRestaurantId === lastRestaurantId) {
      fetchComplementItems(currentRestaurantId)
    }
  }, [items, currentRestaurantId, lastRestaurantId, fetchComplementItems])

  // Helper function to calculate individual item price
  const getItemPrice = (item: any) => {
    const cleanPrice = item.price.replace(/[^0-9.]/g, "")
    const price = Number.parseFloat(cleanPrice)
    return isNaN(price) ? 0 : price
  }

  // Calculate subtotal
  const getSubtotal = () => {
    const total = items.reduce((sum, item) => {
      const price = getItemPrice(item)
      return sum + price * item.quantity
    }, 0)
    return total.toFixed(2)
  }

  // Calculate total
  const getTotal = () => {
    const subtotal = Number.parseFloat(getSubtotal())
    const total = subtotal
    return total.toFixed(2)
  }

  const handleAddComplementItem = (item: any) => {
    // Verify the item belongs to the current restaurant
    if (item.restaurantId === currentRestaurantId && currentRestaurantId) {
      addItem({
        id: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        price: item.price,
        image: item.image,
      })
    }
  }

  const cartClasses = isOpen
    ? "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-0 transition-transform duration-300 ease-in-out"
    : "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out"

  if (items.length === 0 && isOpen) {
    return (
      <div className={cartClasses}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-gray-500 mb-4">Your cart is empty</div>
          <button onClick={onClose} className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium">
            Browse Restaurants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cartClasses}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-600">Your cart from</h2>
          <div className="flex items-center">
            <h3 className="font-bold text-base">{restaurant?.name}</h3>
            <ChevronRight className="h-5 w-5 ml-1" />
          </div>
        </div>
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-4">
        <button className="w-full bg-[#e03a19] text-white py-3 rounded-full font-medium">{getTotalPrice()}</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Cart Items */}
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex">
              <div className="relative h-14 w-14 mr-4 flex-shrink-0">
                <Image
                  src={item.image.trim() || "/placeholder.svg?height=96&width=96&query=burger"}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-base">{item.name}</h4>
                {item.customizations ? (
                  <p className="text-xs text-gray-600 mt-1">{item.customizations}</p>
                ) : (
                  <p className="text-xs text-gray-600 mt-1">LARGE (5939 kJ.), Fries (1320 kJ.), Fanta® (716 kJ.)</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm">${(getItemPrice(item) * item.quantity).toFixed(2)}</div>
                  <div className="flex items-center bg-gray-100 rounded-full shadow-lg">
                    <button
                      className="p-1 bg-white rounded-full"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <span className="mx-3 text-sm">{item.quantity}×</span>
                    <button
                      className="p-1 bg-white rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Add one more"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complement your cart section - only show if we have items from the CURRENT restaurant */}
        {complementItems.length > 0 && lastRestaurantId === currentRestaurantId && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Complement your cart</h3>
              <div className="flex space-x-2">
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
              {complementItems.map((item) => (
                <div key={item.id} className="flex flex-col items-center min-w-[100px]">
                  <div className="relative w-20 h-20 mb-2">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleAddComplementItem(item)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <h4 className="text-xs text-center line-clamp-2 mb-1">{item.name}</h4>
                  <p className="text-xs font-medium">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
