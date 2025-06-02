"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import OrderConfirmationModal from "@/components/modals/order-confirmation-modal"
import { getRestaurantById } from "@/constants/restaurants"
import { stores } from "@/data/store-data"
import { stores as retailStores } from "@/constants/store"
import { allPetStores } from "@/data/pet-data"
import { convenienceStores } from "@/data/convenience-store-data"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, getServiceFee, getDeliveryFee, getTotal, getTotalItems, currentCategory, currentRestaurantId, currentStoreId } = useCartStore()
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedScheduleTime, setSelectedScheduleTime] = useState("")
  const [isClient, setIsClient] = useState(false)
  
  // Delivery options
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
  const [deliveryTime, setDeliveryTime] = useState("45-60 min")
  const [extraDeliveryFee, setExtraDeliveryFee] = useState(0)
  
  // Dasher tip
  const [selectedTip, setSelectedTip] = useState(3.00)

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Generate order ID
  const generateOrderId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handlePlaceOrder = () => {
    const newOrderId = generateOrderId()
    setOrderId(newOrderId)
    setShowOrderConfirmation(true)
  }

  const getItemPrice = (item: any) => {
    return typeof item.price === 'number' 
      ? item.price 
      : parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
  }

  // Get store/restaurant name
  const getStoreName = () => {
    if (currentCategory === 'restaurant' && currentRestaurantId) {
      const restaurant = getRestaurantById(currentRestaurantId)
      return restaurant?.name || 'Restaurant'
    } else if (currentCategory !== 'restaurant' && currentStoreId) {
      let store = null
      switch (currentCategory) {
        case 'grocery':
          store = stores[currentStoreId]
          break
        case 'retail':
          store = retailStores.find(s => s.id === currentStoreId)
          break
        case 'pets':
          store = allPetStores.find(s => s.id === currentStoreId)
          break
        case 'convenience':
          store = convenienceStores[currentStoreId]
          break
      }
      return store?.name || 'Store'
    }
    return currentCategory === 'restaurant' ? 'Restaurant' : 'Store'
  }

  // Generate schedule times for the rest of the day
  const generateScheduleTimes = () => {
    const times = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Start from next 30-minute window
    let startHour = currentHour
    let startMinute = currentMinute < 30 ? 30 : 0
    if (currentMinute >= 30) {
      startHour += 1
    }
    
    // Generate times until 11:30 PM
    for (let hour = startHour; hour < 24; hour++) {
      const startMin = hour === startHour ? startMinute : 0
      for (let minute = startMin; minute < 60; minute += 30) {
        if (hour === 23 && minute === 30) break // Stop at 11:30 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        times.push({ value: timeString, display: displayTime })
      }
    }
    
    return times
  }

  const handleDeliveryOptionChange = (optionId: string) => {
    setSelectedDeliveryOption(optionId)
    
    switch (optionId) {
      case "express":
        setDeliveryTime("25-35 min")
        setExtraDeliveryFee(2.99)
        break
      case "standard":
        setDeliveryTime("45-60 min")
        setExtraDeliveryFee(0)
        break
      case "schedule":
        setDeliveryTime("Choose a time")
        setExtraDeliveryFee(0)
        setShowScheduleModal(true)
        break
      default:
        setDeliveryTime("45-60 min")
        setExtraDeliveryFee(0)
    }
  }

  const handleScheduleTimeSelect = (time: string) => {
    setSelectedScheduleTime(time)
    setDeliveryTime(`Scheduled for ${time}`)
    setShowScheduleModal(false)
  }

  const handleTipSelect = (amount: number) => {
    setSelectedTip(amount)
  }

  // Calculate total with extra delivery fee and tip
  const getTotalWithExtras = () => {
    return getTotal() + extraDeliveryFee + selectedTip
  }

  const deliveryOptions = [
    {
      id: "express",
      name: "Express",
      time: "25-35 min",
      description: "Direct to you",
      price: 2.99,
    },
    {
      id: "standard", 
      name: "Standard",
      time: "45-60 min",
      description: "",
      price: 0,
    },
    {
      id: "schedule",
      name: "Schedule for later",
      time: "Choose a time",
      description: "",
      price: 0,
    }
  ]

  const tipOptions = [1.00, 3.00, 5.00, 6.00]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Store
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Form */}
          <div className="flex-1 space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">1. Account details</h2>
                <span className="text-gray-600">abc@xyz.com</span>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">2. Shipping details</h2>
              
              {/* Delivery/Pickup Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-xs">
                <button className="flex-1 bg-black text-white rounded-md py-2 px-4 text-sm font-medium">
                  Delivery
                </button>
              </div>

              {/* Delivery Time */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-3"></div>
                  <span className="font-medium">Delivery Time</span>
                  <span className="ml-auto text-gray-600">{deliveryTime}</span>
                </div>

                {/* Delivery Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedDeliveryOption === option.id 
                          ? "border-black bg-gray-50" 
                          : "border-gray-200"
                      }`}
                      onClick={() => handleDeliveryOptionChange(option.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{option.name}</h3>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedDeliveryOption === option.id 
                            ? "border-black bg-black" 
                            : "border-gray-300"
                        }`}>
                          {selectedDeliveryOption === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{option.time}</p>
                      {option.description && (
                        <p className="text-sm text-gray-500">{option.description}</p>
                      )}
                      {option.price > 0 && (
                        <p className="text-sm font-medium">+${option.price.toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">548 Market Street</p>
                    <p className="text-sm text-gray-600">San Francisco, CA 94104</p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Leave it at my door</p>
                    <p className="text-sm text-gray-600">Please ring the bell and drop off at the door, thank you. Its around the corner on the ground floor</p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">(012) 345-678</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">3. Payment details</h2>
                <div className="flex items-center">
                  <div className="w-8 h-5 bg-blue-600 rounded mr-2"></div>
                  <span className="text-sm">...5097</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-5 bg-blue-600 rounded mr-2"></div>
                <span className="text-sm">Visa...5097</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button 
              onClick={handlePlaceOrder}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-lg text-lg"
            >
              {isClient ? `Place Order • $${getTotalWithExtras().toFixed(2)}` : 'Place Order'}
            </button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
              {/* Cart Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">MV</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your cart from</p>
                    <p className="font-medium">{getStoreName()}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Order Summary ({getTotalItems()} items)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${(getDeliveryFee() + extraDeliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>${getServiceFee().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax</span>
                    <span>$0.67</span>
                  </div>
                </div>
              </div>

              {/* Dasher Tip */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Dasher Tip</h3>
                <div className="grid grid-cols-4 gap-2">
                  {tipOptions.map((tip) => (
                    <button 
                      key={tip}
                      onClick={() => handleTipSelect(tip)}
                      className={`border rounded py-2 text-sm ${
                        selectedTip === tip 
                          ? "border-black bg-black text-white" 
                          : "border-gray-200"
                      }`}
                    >
                      ${tip.toFixed(2)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The recommended Dasher tip is based on the delivery distance and effort. 100% of the tip goes to your Dasher.
                </p>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.itemName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.itemName}</h4>
                      {item.customizations && (
                        <p className="text-xs text-gray-600">{item.customizations}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <button className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                        🗑
                      </button>
                      <span className="text-sm mr-2">{item.quantity}×</span>
                      <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <button 
              onClick={() => setShowScheduleModal(false)} 
              className="absolute top-4 right-4 p-1" 
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Schedule Delivery
              </h2>
              <p className="text-gray-600 mb-6">
                Choose a delivery time for today
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {generateScheduleTimes().map((time) => (
                  <button
                    key={time.value}
                    onClick={() => handleScheduleTimeSelect(time.display)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {time.display}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        orderId={orderId}
        total={getTotalWithExtras()}
        tipAmount={selectedTip}
        scheduledTime={selectedDeliveryOption === "schedule" ? selectedScheduleTime : undefined}
        deliveryTime={deliveryTime}
        storeName={getStoreName()}
        storeId={currentStoreId || currentRestaurantId || "unknown"}
        category={currentCategory}
      />
    </div>
  )
} 