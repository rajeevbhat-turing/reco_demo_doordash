"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronRight, ChevronLeft, Plus } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { getRestaurantById } from "@/constants/restaurants"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, restaurantId, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [complementItems, setComplementItems] = useState<any[]>([])

  useEffect(() => {
    if (restaurantId) {
      const restaurantData = getRestaurantById(restaurantId)
      setRestaurant(restaurantData)

      // Sample complement items - in a real app, these would come from an API or constants
      setComplementItems([
        {
          id: "oeo-mcflurry",
          name: "OREO McFlurry",
          price: "A$5.30",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/6f3f8098-809f-4482-b24f-b0ad14493109-retina-large.png",
        },
        {
          id: "fries",
          name: "Fries",
          price: "A$7.15",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/34e81cd3-e3bf-49c5-b1a8-73e842faacba-retina-large.png",
        },
        {
          id: "coke",
          name: "Coke",
          price: "A$5.30",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/683ff86e-b09c-4631-bcf3-be8a72b19a98-retina-large.png",
        },
        {
          id: "caramel-sunday",
          name: "Caamel Sunday",
          price: "A$4.65",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/5df2f9ff-cda5-4f81-aeeb-76cc42aec429-retina-large.png",
        },
        {
          id: "HashBrown",
          name: "hashbrown",
          price: "A$5.30",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/d6932d81-c9b6-449d-895f-004798747012-retina-large.png",
        },
      ])
    }
  }, [restaurantId])

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
        <button className="w-full bg-[#e03a19] text-white py-3 rounded-full font-medium">Continue</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Cart Items */}
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex">
              <div className="relative h-14 w-14 mr-4 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg?height=96&width=96&query=burger"}
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
                  <div className="text-sm">
                    A${(Number.parseFloat(item.price.replace("A$", "")) * item.quantity).toFixed(2)}
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-full shadow-lg">
                    <button className="p-1 bg-white rounded-full" onClick={() => removeItem(item.id)} aria-label="Remove item">
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

        {/* Complement your cart section */}
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
                  <button className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <h4 className="text-xs text-center line-clamp-2">{item.name}</h4>
                <p className="text-xs font-medium">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
