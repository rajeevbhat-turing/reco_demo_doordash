"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Trash2, Home, Package, Phone } from "lucide-react"
import { useCartStore, type CartCategory } from "@/store/cart-store"
import { useVerifierStore } from "@/store/verifier-store"
import { useUserStore } from "@/store/user-store"
import { useOrdersStore } from "@/store/orders-store"
import OrderConfirmationModal from "@/components/modals/order-confirmation-modal"
import AddCardModal from "@/components/modals/add-card-modal"
import EditPhoneModal from "@/components/modals/edit-phone-modal"
import AddressesModal from "@/components/modals/addresses-modal"
import AddressDetailsModal from "@/components/modals/address-details-modal"
import ScheduleDeliveryModal from "@/components/modals/schedule-delivery-modal"
import { getRestaurantById } from "@/constants/restaurants"
import { stores } from "@/data/store-data"
import { stores as retailStores } from "@/constants/store"
import { allPetStores } from "@/data/pet-data"
import { convenienceStores } from "@/data/convenience-store-data"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get cart identifier from query params
  const categoryParam = searchParams.get('category') as CartCategory | null
  const storeIdParam = searchParams.get('storeId')
  
  const { findCart, getSubtotal, getServiceFee, getDeliveryFee, getTotal, getTotalItems, setSelectedCard } = useCartStore()
  const { recordCheckoutNavigation, recordTipSelection, recordDeliveryTimeSelection } = useVerifierStore()
  const { 
    currentUser,
    getPaymentMethods,
    addPaymentMethod, 
    removePaymentMethod,
    getAddresses,
    updateAddress,
    updateUser
  } = useUserStore()
  const { addOrder } = useOrdersStore()
  
  const savedPaymentMethods = getPaymentMethods()
  const addresses = getAddresses()
  
  // Find the cart using query params
  const currentCart = categoryParam && storeIdParam ? findCart(storeIdParam, categoryParam) : null
  const items = currentCart?.items || []
  const currentCategory = currentCart?.storeCategory || null
  const currentStoreId = currentCart?.storeId || null
  
  // Calculate values for this specific cart
  const subtotal = getSubtotal(currentStoreId || undefined, currentCategory || undefined)
  const serviceFee = getServiceFee(currentStoreId || undefined, currentCategory || undefined)
  const deliveryFee = getDeliveryFee(currentStoreId || undefined, currentCategory || undefined)
  const totalItems = getTotalItems(currentStoreId || undefined, currentCategory || undefined)
  
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedScheduleTime, setSelectedScheduleTime] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState("")
  const [isClient, setIsClient] = useState(false)
  
  // Delivery options
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
  const [deliveryTime, setDeliveryTime] = useState("45-60 min")
  const [extraDeliveryFee, setExtraDeliveryFee] = useState(0)
  
  // Dasher tip
  const [selectedTip, setSelectedTip] = useState(3.00)
  
  // Payment details
  const [showExpandedPayment, setShowExpandedPayment] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(savedPaymentMethods[0]?.id || "")
  
  // Shipping details edit state
  const [showExpandedShipping, setShowExpandedShipping] = useState(true)
  
  // Add card modal state
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  
  // Edit phone modal state
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false)
  
  // Addresses modal state
  const [showAddressesModal, setShowAddressesModal] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "")
  
  // Address details modal state
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false)

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true)
    // Record checkout navigation for verifiers
    recordCheckoutNavigation()
  }, [recordCheckoutNavigation])
  
  // Update selected payment method when payment methods change
  useEffect(() => {
    if (savedPaymentMethods.length > 0 && !selectedPaymentMethod) {
      updateSelectedPaymentMethod(savedPaymentMethods[0].id)
    }
  }, [savedPaymentMethods, selectedPaymentMethod])
  
  // Redirect if cart not found
  useEffect(() => {
    if (isClient && !currentCart && categoryParam && storeIdParam) {
      // Cart was deleted or doesn't exist
      router.push('/')
    }
  }, [isClient, currentCart, categoryParam, storeIdParam, router])
  
  // Generate order ID
  const generateOrderId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handlePlaceOrder = () => {
    const newOrderId = generateOrderId()
    
    // Prepare order data
    const orderData = {
      // 1. Order ID
      id: newOrderId,
      
      // 2. Cart fields extracted to root level (without card details)
      storeId: currentCart?.storeId,
      storeName: currentCart?.storeName,
      storeCategory: currentCart?.storeCategory,
      items: currentCart?.items?.map(item => ({
        id: item.id.toString(),
        name: item.itemName,
        quantity: item.quantity,
        price: typeof item.price === 'number' 
          ? item.price 
          : parseFloat(item.price.toString().replace(/[^0-9.]/g, ""))
      })),
      
      // 3. Payment card as object
      paymentCard: {
        type: selectedPaymentMethodObj?.type,
        cardNumber: selectedPaymentMethodObj?.cardNumber,
        lastFour: selectedPaymentMethodObj?.lastFour,
        expiry: selectedPaymentMethodObj?.expiry,
        cvc: selectedPaymentMethodObj?.cvc,
        zipCode: selectedPaymentMethodObj?.zipCode,
      },
      
      // 4. Address
      deliveryAddress: selectedAddress,
      
      // 5. Delivery option and related info
      deliveryOption: {
        type: selectedDeliveryOption,
        deliveryTime: deliveryTime,
        extraFee: extraDeliveryFee,
        scheduledDate: scheduledDate,
        scheduledTimeSlot: scheduledTimeSlot,
      },
      
      // Additional order details
      phoneNumber: currentUser ? {
        countryCode: `${currentUser.country.dialCode} (${currentUser.country.code})`,
        number: currentUser.phoneNumber
      } : {
        countryCode: "+1 (US)",
        number: ""
      },
      tipAmount: selectedTip,
      subtotal: subtotal,
      serviceFee: serviceFee,
      deliveryFee: deliveryFee + extraDeliveryFee,
      total: getTotal(currentStoreId || undefined, currentCategory || undefined) + selectedTip + extraDeliveryFee,
      
      // Order metadata
      orderDate: new Date().toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      status: 'Confirmed',
    }
    
    console.log('ORDER DATA:', orderData)
    
    // Save order to store
    addOrder(orderData)
    
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
    // First, try to get store name from the cart itself
    if (currentCart) {
      return currentCart.storeName;
    }
    
    // Fallback to looking up by ID if we have the params
    if (currentCategory === 'restaurant' && currentStoreId) {
      const restaurant = getRestaurantById(currentStoreId)
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
    // Clear scheduled date and time when switching away from schedule option
    if (optionId !== "schedule") {
      setScheduledDate(null)
      setScheduledTimeSlot("")
    }
    
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

  const handleScheduleTimeSelect = (date: string, timeType: "asap" | "later", timeSlot?: string, fullDate?: Date, timeSlotDisplay?: string) => {
    if (timeType === "asap" || !timeSlot) {
      // Revert to standard option
      setSelectedDeliveryOption("standard")
      setDeliveryTime("45-60 min")
      setExtraDeliveryFee(0)
      setScheduledDate(null)
      setScheduledTimeSlot("")
    } else {
      // Save scheduled time
      setSelectedDeliveryOption("schedule")
      setScheduledDate(fullDate || null)
      setScheduledTimeSlot(timeSlotDisplay || timeSlot)
      
      // Format display
      const formattedDate = fullDate ? `${fullDate.getDate().toString().padStart(2, '0')}/${(fullDate.getMonth() + 1).toString().padStart(2, '0')}` : date
      setDeliveryTime(`${formattedDate} at ${timeSlotDisplay || timeSlot}`)
      setExtraDeliveryFee(0)
      
      // Record for verifiers
      recordDeliveryTimeSelection(`Scheduled for ${formattedDate} at ${timeSlotDisplay || timeSlot}`)
    }
    setShowScheduleModal(false)
  }

  const handleTipSelect = (amount: number) => {
    setSelectedTip(amount)
    // Record tip selection for verifiers
    recordTipSelection(amount)
  }
  
  // Helper to update selected payment method and cart store
  const updateSelectedPaymentMethod = (paymentMethodId: string) => {
    const paymentMethod = savedPaymentMethods.find(m => m.id === paymentMethodId)
    setSelectedPaymentMethod(paymentMethodId)
    if (paymentMethod && currentStoreId && currentCategory) {
      setSelectedCard(currentStoreId, currentCategory, paymentMethod)
    }
  }
  
  // Handle section expansion with mutual exclusivity
  const handleShippingEdit = () => {
    setShowExpandedShipping(true)
    setShowExpandedPayment(false)
  }
  
  const handlePaymentEdit = () => {
    setShowExpandedPayment(true)
    setShowExpandedShipping(false)
  }
  
  // Handle add card
  const handleAddCard = (cardData: {
    cardNumber: string
    cvc: string
    expiration: string
    zipCode: string
  }) => {
    const newCard = addPaymentMethod({
      cardNumber: cardData.cardNumber,
      cvc: cardData.cvc,
      expiry: cardData.expiration,
      zipCode: cardData.zipCode,
    })
    updateSelectedPaymentMethod(newCard.id)
    setShowAddCardModal(false)
  }
  
  // Handle delete payment method
  const handleDeletePaymentMethod = (e: React.MouseEvent, methodId: string) => {
    e.stopPropagation() // Prevent card selection when clicking trash
    removePaymentMethod(methodId)
    // If deleted card was selected, select the first remaining card
    if (selectedPaymentMethod === methodId && savedPaymentMethods.length > 1) {
      const remainingMethods = savedPaymentMethods.filter(m => m.id !== methodId)
      if (remainingMethods.length > 0) {
        updateSelectedPaymentMethod(remainingMethods[0].id)
      }
    }
  }
  
  // Handle save phone number
  const handleSavePhoneNumber = (phoneData: { countryCode: string; number: string }) => {
    if (currentUser) {
      // Extract dial code and country code from the countryCode string (format: "+1 (US)")
      const match = phoneData.countryCode.match(/^(\+\d+)\s*\(([A-Z]{2})\)$/)
      if (match) {
        const dialCode = match[1]
        const countryCode = match[2]
        updateUser(currentUser.id, {
          phoneNumber: phoneData.number,
          country: {
            dialCode,
            code: countryCode,
            name: currentUser.country.name, // Keep existing name
          }
        })
      } else {
        // Fallback: just update the phone number
        updateUser(currentUser.id, {
          phoneNumber: phoneData.number
        })
      }
    }
  }
  
  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId)
    setShowAddressesModal(false)
  }

  // Handle edit address from addresses modal
  const handleEditAddress = (addressId: string) => {
    setSelectedAddressId(addressId)
    setShowAddressesModal(false)
    setShowAddressDetailsModal(true)
  }

  // Handle saving address details
  const handleSaveAddressDetails = (addressData: any) => {
    if (selectedAddress) {
      updateAddress(selectedAddress.id, {
        addressType: addressData.addressType,
        gateCode: addressData.gateCode,
        deliveryPreference: addressData.deliveryPreference,
        meetLocation: addressData.meetLocation,
        deliveryInstructions: addressData.deliveryInstructions,
        personalLabel: addressData.personalLabel,
      })
    }
  }

  // Calculate total with extra delivery fee and tip
  const getTotalWithExtras = () => {
    const total = getTotal(currentStoreId || undefined, currentCategory || undefined)
    return total + extraDeliveryFee + selectedTip
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
  
  // Get the selected payment method object
  const selectedPaymentMethodObj = savedPaymentMethods.find(m => m.id === selectedPaymentMethod)
  
  // Get the selected address object
  const selectedAddress = addresses.find(a => a.id === selectedAddressId)

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
            <div className="bg-white rounded-lg shadow-sm border border-gray-300">
              {!showExpandedShipping ? (
                // Collapsed View
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">2. Shipping details</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 text-sm">47 West 13th Street, New ...</span>
                      <button 
                        onClick={handleShippingEdit}
                        className="text-blue-600 font-medium text-lg"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Expanded View
                <div className="p-6">
              <h2 className="text-lg font-semibold mb-6">2. Shipping details</h2>

              {/* Map Placeholder */}
              <div className="mb-6">
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                    {/* Pin Icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="black">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Adjust Pin Button */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium hover:bg-gray-50 transition-colors">
                      Adjust pin
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
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
                          style={{ height: "min-content" }}
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
                      {option.id === "schedule" && scheduledDate && scheduledTimeSlot ? (
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-600">
                            {`${scheduledDate.getDate().toString().padStart(2, '0')}/${(scheduledDate.getMonth() + 1).toString().padStart(2, '0')}`}
                          </p>
                          <p className="text-sm text-gray-600">{scheduledTimeSlot}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mb-1">{option.time}</p>
                      )}
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
                  <div>
                    {selectedAddress ? (
                      <div 
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressesModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Home className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{selectedAddress.street}</p>
                            <p className="text-xs text-gray-600">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
                  </div>
                </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressesModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Home className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">No address selected</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}

                    {selectedAddress && (
                      <div 
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressDetailsModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Package className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Leave it at my door</p>
                            <p className="text-xs text-gray-600">Please ring the bell and drop off at the door, thank you. Its around the corner on the ground floor</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                </div>

                    <div 
                      className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => setShowEditPhoneModal(true)}
                    >
                      <div className="flex items-center flex-1">
                        <Phone className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{currentUser?.phoneNumber || ''}</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300">
              {!showExpandedPayment && savedPaymentMethods.length > 0 ? (
                // Collapsed View
                <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">3. Payment details</h2>
                    {selectedPaymentMethodObj && (
                <div className="flex items-center">
                        <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-2 flex items-center justify-center">
                          <div className="flex space-x-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
                        <span className="text-sm">...{selectedPaymentMethodObj.lastFour}</span>
                        <button 
                          onClick={handlePaymentEdit}
                          className="text-blue-600 ml-6 font-medium text-bold text-lg"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethodObj && (
              <div className="flex items-center pl-4">
                <div className="flex items-center">
                        <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-2 flex items-center justify-center">
                          <div className="flex space-x-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <span className="text-sm">{selectedPaymentMethodObj.type}...{selectedPaymentMethodObj.lastFour}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Expanded View
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-6 px-6">3. Payment details</h2>
                  
                  <div className="ml-4 px-6">
                    {/* Saved Payment Methods - only shown if they exist */}
                    {savedPaymentMethods.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Saved Payment Methods</h3>
                        <div className="space-y-3">
                          {savedPaymentMethods.map((method) => (
                            <div 
                              key={method.id}
                              className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                              style={{ marginInline: '-12px' }}
                              onClick={() => updateSelectedPaymentMethod(method.id)}
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-3 flex items-center justify-center">
                                  <div className="flex space-x-0.5">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                </div>
                              <div>
                                <p className="font-medium text-sm">{method.type}....{method.lastFour}</p>
                                <p className="text-xs text-gray-600">Exp. {method.expiry}</p>
                              </div>
                            </div>
                            {selectedPaymentMethod === method.id ? (
                              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <button
                                onClick={(e) => handleDeletePaymentMethod(e, method.id)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Delete payment method"
                              >
                                <Trash2 className="w-5 h-5 text-gray-600" />
                              </button>
                            )}
                          </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {savedPaymentMethods.length > 0 && (
                    <div 
                      className="w-full h-2 bg-gray-200 my-4 border-b border-t border-gray-200 " 
                      style={{ marginRight: '-10000px' }} 
                    />
                  )}

                  {/* Add New Payment Method */}
                  <div className="ml-4 px-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Payment Method</h3>
                    <div className="space-y-3">
                      {/* Credit/Debit Card Option */}
                        <div 
                          className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                          style={{ marginInline: '-12px' }}
                          onClick={() => setShowAddCardModal(true)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-7 bg-gray-800 rounded mr-3 flex items-center justify-center">
                              <svg className="w-6 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/>
                                <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2"/>
                              </svg>
                            </div>
                            <span className="font-medium text-sm">Credit/Debit Card</span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                </div>
              </div>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button 
              onClick={handlePlaceOrder}
              disabled={!selectedPaymentMethodObj}
              className={`w-full font-medium py-4 rounded-lg text-lg ${
                selectedPaymentMethodObj
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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
                <h3 className="font-medium mb-2">Order Summary ({totalItems} items)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${(deliveryFee + extraDeliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
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

      {/* Schedule Delivery Modal */}
      <ScheduleDeliveryModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false)
          // Revert to standard if modal is closed without selection
          if (selectedDeliveryOption === "schedule" && !scheduledTimeSlot) {
            setSelectedDeliveryOption("standard")
            setDeliveryTime("45-60 min")
          }
        }}
        onSelectTime={handleScheduleTimeSelect}
      />

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
        storeId={currentStoreId || "unknown"}
        category={currentCategory || "grocery"}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAddCard={handleAddCard}
      />

      {/* Edit Phone Modal */}
      <EditPhoneModal
        isOpen={showEditPhoneModal}
        onClose={() => setShowEditPhoneModal(false)}
        onSave={handleSavePhoneNumber}
        initialCountryCode={currentUser ? `${currentUser.country.dialCode} (${currentUser.country.code})` : "+1 (US)"}
        initialNumber={currentUser?.phoneNumber || ''}
      />

      {/* Addresses Modal */}
      <AddressesModal
        isOpen={showAddressesModal}
        onClose={() => setShowAddressesModal(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleSelectAddress}
        onEditAddress={handleEditAddress}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        isOpen={showAddressDetailsModal}
        onClose={() => setShowAddressDetailsModal(false)}
        address={selectedAddress}
        onSave={handleSaveAddressDetails}
      />
    </div>
  )
} 