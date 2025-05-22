"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronRight, ChevronLeft, Plus, Trash2, Minus } from "lucide-react"
import { useCartStore, CartCategory } from "@/store/cart-store"
import { getRestaurantById } from "@/constants/restaurants"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  category?: CartCategory
  storeData?: any // Optional store data for non-restaurant categories
}

export default function CartSidebar({ isOpen, onClose, category = "restaurant", storeData }: CartSidebarProps) {
  const cartStore = useCartStore()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = cartStore
  const [complementItems, setComplementItems] = useState<any[]>([])
  const [storeInfo, setStoreInfo] = useState<any>(null)

  // Set the category when component mounts or category changes
  useEffect(() => {
    cartStore.setCategory(category)
  }, [category])

  // Load store or restaurant info based on category
  useEffect(() => {
    if (category === "restaurant" && cartStore.currentRestaurantId) {
      // For restaurant category, load restaurant data
      const restaurantData = getRestaurantById(cartStore.currentRestaurantId)
      setStoreInfo(restaurantData)

      // Sample complement items for restaurants
      setComplementItems([
        {
          id: "oeo-mcflurry",
          name: "OREO McFlurry",
          price: "5.30",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/6f3f8098-809f-4482-b24f-b0ad14493109-retina-large.png",
        },
        {
          id: "fries",
          name: "Fries",
          price: "7.15",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/34e81cd3-e3bf-49c5-b1a8-73e842faacba-retina-large.png",
        },
        {
          id: "coke",
          name: "Coke",
          price: "5.30",
          image: "https://img.cdn4dd.com/p/fit=cover,width=200,height=200,format=auto,quality=72/media/photosV2/683ff86e-b09c-4631-bcf3-be8a72b19a98-retina-large.png",
        },
      ])
    } else if (storeData) {
      // For other categories, use provided storeData
      setStoreInfo(storeData)
      
      // Use different complement items based on category
      if (category === "grocery" || category === "retail" || category === "pets") {
        // Sample complement items for non-restaurant categories
        setComplementItems([
          {
            id: "snack1",
            name: "Healthy Snack",
            price: "4.99",
            image: "/placeholder.svg",
          },
          {
            id: "drink1",
            name: "Bottled Water",
            price: "1.99",
            image: "/placeholder.svg",
          },
          {
            id: "candy1",
            name: "Chocolate Bar",
            price: "2.49",
            image: "/placeholder.svg",
          },
        ])
      }
    }
  }, [category, cartStore.currentRestaurantId, cartStore.currentStoreId, storeData])

  // Get the config for the current category
  const config = cartStore.getConfig()

  // Format price for display
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'number') {
      return price.toFixed(2)
    } else {
      return parseFloat(price.toString().replace(/[^0-9.]/g, "")).toFixed(2)
    }
  }

  // Calculate subtotal
  const subtotal = cartStore.getSubtotal()
  const deliveryFee = cartStore.getDeliveryFee()
  const serviceFee = cartStore.getServiceFee()
  const total = cartStore.getTotal()

  const cartClasses = isOpen
    ? "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-0 transition-transform duration-300 ease-in-out"
    : "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out"

  // Empty cart view
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
            Browse {category === "restaurant" ? "Restaurants" : category === "grocery" ? "Groceries" : category === "retail" ? "Retail Stores" : "Pet Stores"}
          </button>
        </div>
      </div>
    )
  }

  // Cart with items - Restaurant category view
  if (category === "restaurant") {
    return (
      <div className={cartClasses}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-sm text-gray-600">Your cart from</h2>
            <div className="flex items-center">
              <h3 className="font-bold text-base">{storeInfo?.name}</h3>
              <ChevronRight className="h-5 w-5 ml-1" />
            </div>
          </div>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <button className="w-full bg-[#e03a19] text-white py-3 rounded-full font-medium">
            Checkout • {getTotalPrice()}
          </button>
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
                    <p className="text-xs text-gray-600 mt-1">LARGE (5939 kJ.)</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm">
                      ${formatPrice(Number(formatPrice(item.price)) * item.quantity)}
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
                  <p className="text-xs font-medium">${item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cart with items - Grocery/Retail/Pets category view
  return (
    <div className={cartClasses}>
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-600">Your cart from</h2>
          <div className="flex items-center">
            <h3 className="font-bold text-base">{storeInfo?.name}</h3>
            <ChevronRight className="h-5 w-5 ml-1" />
          </div>
        </div>
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Progress bar for free delivery */}
      <div className="px-4 pt-2">
        <div className="h-1 bg-gray-200 rounded-full mt-2 mb-2">
          <div
            className="h-1 bg-red-600 rounded-full"
            style={{ width: `${Math.min((subtotal / config.freeDeliveryThreshold) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Delivery fee notice */}
        {subtotal < config.freeDeliveryThreshold && (
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
                Add ${(config.freeDeliveryThreshold - subtotal).toFixed(2)} for $0 delivery fee
              </p>
              <p className="text-gray-500">
                + service fees ({config.serviceFeePercentage * 100}%, min ${config.minServiceFee})
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-medium">
          Checkout • {getTotalPrice()}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Cart Items */}
        <div className="px-4 divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex">
              <div className="w-12 h-12 mr-3 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-sm">${formatPrice(item.price)}</p>
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
        </div>

        {/* Recommendations */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Add More, Save More</h3>
            <div className="flex space-x-1">
              <button
                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-3">To save on fees</p>

          <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
            {complementItems.map((product) => (
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
                  >
                    <Plus className="w-4 h-4 text-green-600" />
                  </button>
                </div>
                <p className="font-medium text-sm">${product.price}</p>
                <p className="text-xs text-gray-700 truncate">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}