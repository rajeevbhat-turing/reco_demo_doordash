"use client"

import { Trash2, Plus, Minus, ChevronRight, ChevronLeft, Users } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { useRef, useState, useEffect } from "react"
import { cartConfig } from "@/data/cart-config"
import { uiConfig } from "@/data/ui-config"
import { recommendedProducts } from "@/data/modal-data"

interface CartSidebarProps {
  storeData: import("@/data/store-data").StoreInfo
}

export default function GroceryCartSidebar({ storeData }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal, getDeliveryFee, isGroupOrder } = useCartStore()
  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const deliveryFee = getDeliveryFee()
  const recommendationsRef = useRef<HTMLDivElement>(null)
  const { emptyCartMessage } = uiConfig
  
  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      // If it's already a string like "$37.80", return as is
      if (price.startsWith('$')) {
        return price
      }
      // If it's a string number like "37.80", format it
      const numPrice = parseFloat(price)
      return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`
    }
    // If it's a number, format it normally
    return `$${price.toFixed(2)}`
  }
  
  // Use state for calculated total to avoid hydration issues
  const [totalPrice, setTotalPrice] = useState<string>("Checkout")
  
  // Calculate total on client-side only (only subtotal - item prices)
  useEffect(() => {
    setTotalPrice(`$${subtotal.toFixed(2)}`)
  }, [subtotal])

  // Use a subset of recommended products for the cart sidebar
  const cartRecommendations = recommendedProducts.slice(0, 3)

  // Scroll recommendations
  const scrollLeft = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  // Get the display name based on cart items first, then fallback to storeData
  const getDisplayName = () => {
    // First, try to get store name from cart items themselves
    if (items.length > 0) {
      const firstItem = items[0];
      if (firstItem.storeName) {
        return firstItem.storeName;
      }
    }
    
    // Fallback to storeData prop
    return storeData.name;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <div className="w-32 h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <Image
            src="/placeholder.svg?height=48&width=48"
            alt="Empty cart"
            width={48}
            height={48}
            className="opacity-50"
          />
        </div>
        <h3 className="font-medium mb-1">{emptyCartMessage.title}</h3>
        <p className="text-sm text-gray-500">{emptyCartMessage.description}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium">Your cart from</h2>
        <div className="flex items-center">
          <h3 className="font-bold text-lg">{getDisplayName()}</h3>
          <ChevronRight className="h-5 w-5 ml-1" />
        </div>
        
        {isGroupOrder && (
          <div className="mt-2 py-2 px-3 bg-blue-50 rounded-md flex items-center">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm font-medium text-blue-800">Group order active</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mt-2 mb-4">
          <div
            className="h-1 bg-red-600 rounded-full"
            style={{ width: `${Math.min((subtotal / cartConfig.freeDeliveryThreshold) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Delivery fee notice */}
        {subtotal < cartConfig.freeDeliveryThreshold && (
          <div className="flex items-start text-sm mb-4">
            <div className="text-red-600 mr-2 mt-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M12 16H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-600">
                Add ${(cartConfig.freeDeliveryThreshold - subtotal).toFixed(2)} for $0 delivery fee
              </p>
              <p className="text-gray-500">
                + service fees ({cartConfig.serviceFeePercentage * 100}%, min ${cartConfig.minServiceFee})
              </p>
            </div>
          </div>
        )}

        {/* Checkout button - Moved from bottom to here */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-full mb-3 text-lg">
          Continue
        </button>
        <p className="text-center text-sm mb-1">
          {totalPrice} without tax
        </p>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-auto p-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center mb-4">
            <div className="w-12 h-12 mr-3 flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.itemName}
                width={48}
                height={48}
                className="rounded-md object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.itemName}</p>
              <p className="text-sm">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center">
              <button className="p-1 text-gray-500 hover:text-red-600" onClick={() => removeItem(item.id)}>
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="flex items-center border rounded-full px-2 py-1 ml-2">
                <button
                  className="p-1"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="mx-2 text-sm">{item.quantity} ×</span>
                <button className="p-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Recommendations */}
        <div className="mt-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Add More, Save More</h3>
            <div className="flex space-x-1">
              <button
                onClick={scrollLeft}
                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-3">To save on fees</p>

          <div ref={recommendationsRef} className="flex space-x-3 overflow-x-auto no-scrollbar">
            {cartRecommendations.map((product) => (
              <div key={product.id} className="min-w-[120px] max-w-[120px] flex-shrink-0">
                <div className="relative mb-2">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover aspect-square"
                  />
                  <button
                    className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md"
                    onClick={() => updateQuantity(product.id, 1)}
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                </div>
                <p className="font-medium text-sm">{formatPrice(product.price)}</p>
                <p className="text-xs text-gray-700 truncate">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
