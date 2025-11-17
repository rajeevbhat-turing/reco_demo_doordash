"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronRight, ArrowLeft, Copy, Check } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"

interface GroupOrderDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function GroupOrderDialog({ isOpen, onClose }: GroupOrderDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const startGroupOrder = useCartStore(state => state.startGroupOrder)
  
  const [currentView, setCurrentView] = useState<"main" | "paying" | "delivery" | "deadline" | "success">("main")
  const [selectedLimit, setSelectedLimit] = useState<string>("No Limit")
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>("Standard delivery")
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("ASAP")
  const [selectedDate, setSelectedDate] = useState<string>("Today")
  const [selectedDeadlineTime, setSelectedDeadlineTime] = useState<string>("1:15 AM")
  const [selectedCheckoutOption, setSelectedCheckoutOption] = useState<string>("Manually")
  const [hasDeadline, setHasDeadline] = useState<boolean>(false)
  const [groupOrderLink, setGroupOrderLink] = useState<string>("") 
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEscapeKey)
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      // Reset to main view when dialog is closed
      setCurrentView("main")
    }

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
      // Reset to main view when dialog is closed
      if (!isOpen) {
        setCurrentView("main")
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePayingClick = () => {
    setCurrentView("paying")
  }

  const handleDeliveryClick = () => {
    setCurrentView("delivery")
  }

  const handleDeadlineClick = () => {
    setCurrentView("deadline")
  }

  const handleBackClick = () => {
    setCurrentView("main")
  }

  const handleLimitSelect = (limit: string) => {
    setSelectedLimit(limit)
  }

  const handleSave = () => {
    // Save the selected limit and go back to main view
    setCurrentView("main")
  }

  const handleDeliveryTimeSelect = (time: string) => {
    setSelectedDeliveryTime(time)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleSaveDelivery = () => {
    setCurrentView("main")
  }

  const handleDeadlineTimeSelect = (time: string) => {
    setSelectedDeadlineTime(time)
  }

  const handleCheckoutOptionSelect = (option: string) => {
    setSelectedCheckoutOption(option)
  }

  const handleSaveDeadline = () => {
    setHasDeadline(true)
    setCurrentView("main")
  }

  const generateGroupOrderLink = () => {
    // Use the startGroupOrder method from the cart store to generate a group order ID
    const groupOrderId = startGroupOrder()
    // Use the current host with the group order ID
    const baseUrl = window.location.origin
    return `${baseUrl}/cart/group/${groupOrderId}`
  }

  const handleStartGroupOrder = () => {
    const link = generateGroupOrderLink()
    setGroupOrderLink(link)
    setCurrentView("success")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(groupOrderLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={dialogRef} className="relative bg-white rounded-[8px] w-full max-w-[480px] max-h-[80vh] overflow-auto">
        {currentView === "main" ? (
          <>
            <button onClick={onClose} className="absolute top-4 left-4 z-10" aria-label="Close dialog">
              <X className="h-6 w-6 text-gray-500" />
            </button>

            <div className="p-6 pt-16">
              <div className="flex justify-center mb-6">
                <Image
                  src="https://img.cdn4dd.com/s/managed/consumer/group-orders/group-order-people.svg"
                  alt="Group order illustration"
                  width={160}
                  height={100}
                  className="object-contain"
                />
              </div>

              <h2 className="text-[28px] font-bold text-left mb-2">Start Group Order</h2>
              <p className="text-gray-600 text-left mb-8">
                Share your group order link with others. They can add their favorite items. Checkout and get it all
                delivered together.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4 text-left">From McDonald's</h3>

                <div className="space-y-0">
                  <div
                    className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
                    onClick={handlePayingClick}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-4 flex items-center justify-center w-10 h-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7V12M12 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">I'm paying</h4>
                        <p className="text-gray-500 text-sm">
                          {selectedLimit === "No Limit" ? "No spend limit" : `${selectedLimit} per person`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div
                    className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
                    onClick={handleDeliveryClick}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-4 flex items-center justify-center w-10 h-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M12 6V12L16 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Standard delivery</h4>
                        <p className="text-gray-500 text-sm">
                          {selectedDeliveryTime === "ASAP"
                            ? "ASAP after you checkout"
                            : `${selectedDate}, ${selectedDeliveryTime}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div
                    className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
                    onClick={handleDeadlineClick}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-4 flex items-center justify-center w-10 h-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 5C10 4.44772 10.4477 4 11 4H13C13.5523 4 14 4.44772 14 5C14 5.55228 13.5523 6 13 6H11C10.4477 6 10 5.55228 10 5Z"
                            fill="currentColor"
                          />
                          <path
                            d="M8.5 8C8.5 7.17157 9.17157 6.5 10 6.5H14C14.8284 6.5 15.5 7.17157 15.5 8V8.5H8.5V8Z"
                            fill="currentColor"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5 10C5 8.34315 6.34315 7 8 7H16C17.6569 7 19 8.34315 19 10V16C19 17.6569 17.6569 19 16 19H8C6.34315 19 5 17.6569 5 16V10ZM8 9C7.44772 9 7 9.44772 7 10V16C7 16.5523 7.44772 17 8 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44772 16.5523 9 16 9H8Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">{hasDeadline ? "Order deadline" : "No order deadline"}</h4>
                        <p className="text-gray-500 text-sm">
                          {hasDeadline
                            ? `${selectedDate}, ${selectedDeadlineTime} (${selectedCheckoutOption})`
                            : "People can add to cart any time"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg mb-8">
                <div className="flex items-center">
                  <div className="mr-3 text-red-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4V12M12 16V16.01M4.93 19.07C3.17 17.31 2 14.79 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C9.21 22 6.69 20.83 4.93 19.07Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-red-900">Add order deadlines and automatically check out</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-medium text-gray-800">
                  Cancel
                </button>
                <button 
                  onClick={handleStartGroupOrder} 
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-medium flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M16.6438 16.1429C15.6563 14.4452 13.7906 13.5 11.5 13.5C9.20943 13.5 7.34366 14.4452 6.35625 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M3.5 8.5C3.5 5.73858 5.73858 3.5 8.5 3.5C11.2614 3.5 13.5 5.73858 13.5 8.5C13.5 11.2614 11.2614 13.5 8.5 13.5C5.73858 13.5 3.5 11.2614 3.5 8.5ZM18.5 8.5C18.5 5.73858 16.2614 3.5 13.5 3.5C10.7386 3.5 8.5 5.73858 8.5 8.5C8.5 11.2614 10.7386 13.5 13.5 13.5C16.2614 13.5 18.5 11.2614 18.5 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Start Group Order
                </button>
              </div>
            </div>
          </>
        ) : currentView === "paying" ? (
          <>
            <div className="p-6">
              <button onClick={handleBackClick} className="mb-4 flex items-center" aria-label="Back">
                <ArrowLeft className="h-6 w-6 text-gray-500" />
              </button>

              <h2 className="text-[28px] font-bold text-left mb-6">What is your per person order limit?</h2>

              <p className="text-gray-700 text-left mb-4">What is your per person order limit?</p>

              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "No Limit" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("No Limit")}
                >
                  No Limit
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "$10" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("$10")}
                >
                  $10
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "$15" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("$15")}
                >
                  $15
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "$20" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("$20")}
                >
                  $20
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "Other" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("Other")}
                >
                  Other
                </button>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleBackClick}
                  className="px-6 py-3 bg-gray-100 rounded-full font-medium text-gray-800"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium">
                  Save
                </button>
              </div>
            </div>
          </>
        ) : currentView === "delivery" ? (
          <>
            <div className="p-6">
              <button onClick={handleBackClick} className="mb-4 flex items-center" aria-label="Back">
                <ArrowLeft className="h-6 w-6 text-gray-500" />
              </button>

              <h2 className="text-[28px] font-bold text-left mb-2">Delivery time</h2>
              <p className="text-gray-600 text-left mb-6">When you want the order to arrive</p>

              {/* Date selection tabs */}
              <div className="flex mb-6 overflow-x-auto">
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center ${
                    selectedDate === "Today" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Today")}
                >
                  <span className="font-medium">Today</span>
                  <span className="text-sm text-gray-500">May 21</span>
                  {selectedDate === "Today" && (
                    <span className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center ${
                    selectedDate === "Tomorrow" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Tomorrow")}
                >
                  <span className="font-medium">Tomorrow</span>
                  <span className="text-sm text-gray-500">May 22</span>
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center ${
                    selectedDate === "Friday" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Friday")}
                >
                  <span className="font-medium">Friday</span>
                  <span className="text-sm text-gray-500">May 23</span>
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg flex flex-col items-center ${
                    selectedDate === "Saturday" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Saturday")}
                >
                  <span className="font-medium">Saturday</span>
                  <span className="text-sm text-gray-500">May 24</span>
                </button>
              </div>

              {/* Time slots */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="standard-delivery"
                    name="delivery-time"
                    className="hidden"
                    checked={selectedDeliveryTime === "ASAP"}
                    onChange={() => handleDeliveryTimeSelect("ASAP")}
                  />
                  <label
                    htmlFor="standard-delivery"
                    className="flex items-center cursor-pointer w-full"
                    onClick={() => handleDeliveryTimeSelect("ASAP")}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedDeliveryTime === "ASAP" ? "border-black" : "border-gray-300"
                      }`}
                    >
                      {selectedDeliveryTime === "ASAP" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">Standard delivery</div>
                      <div className="text-sm text-gray-500">ASAP</div>
                    </div>
                  </label>
                </div>

                {[
                  "2:20 AM - 2:40 AM",
                  "2:40 AM - 3:00 AM",
                  "3:00 AM - 3:20 AM",
                  "3:20 AM - 3:40 AM",
                  "3:40 AM - 4:00 AM",
                  "5:30 AM - 5:40 AM",
                  "5:40 AM - 6:00 AM",
                  "6:00 AM - 6:20 AM",
                  "6:20 AM - 6:40 AM",
                  "6:40 AM - 7:00 AM",
                  "7:00 AM - 7:20 AM",
                  "7:20 AM - 7:40 AM",
                  "7:40 AM - 8:00 AM",
                  "8:00 AM - 8:20 AM",
                  "8:20 AM - 8:40 AM",
                  "8:40 AM - 9:00 AM",
                  "9:00 AM - 9:20 AM",
                  "9:20 AM - 9:40 AM",
                  "9:40 AM - 10:00 AM",
                  "10:00 AM - 10:20 AM",
                  "10:20 AM - 10:40 AM",
                  "10:40 AM - 11:00 AM",
                  "11:00 AM - 11:20 AM",
                  "11:20 AM - 11:40 AM",
                  "11:40 AM - 12:00 PM",
                ].map((time) => (
                  <div key={time} className="flex items-center">
                    <input
                      type="radio"
                      id={`time-${time}`}
                      name="delivery-time"
                      className="hidden"
                      checked={selectedDeliveryTime === time}
                      onChange={() => handleDeliveryTimeSelect(time)}
                    />
                    <label
                      htmlFor={`time-${time}`}
                      className="flex items-center cursor-pointer w-full"
                      onClick={() => handleDeliveryTimeSelect(time)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedDeliveryTime === time ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {selectedDeliveryTime === time && <div className="w-3 h-3 bg-black rounded-full"></div>}
                      </div>
                      <div className="ml-3">{time}</div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleBackClick}
                  className="px-6 py-3 bg-gray-100 rounded-full font-medium text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDelivery}
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : currentView === "success" ? (
          <>
            <div className="p-6">
              <button onClick={onClose} className="absolute top-4 left-4 z-10" aria-label="Close dialog">
                <X className="h-6 w-6 text-gray-500" />
              </button>

              <div className="flex flex-col items-center justify-center pt-8 pb-4">
                <div className="bg-green-100 rounded-full p-4 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M20 6L9 17L4 12" 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
                <h2 className="text-[28px] font-bold mb-2">Group order started!</h2>
                <p className="text-gray-600 text-center mb-8">
                  Share this link with others. They can add their items to your cart.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-700 mb-3">Share this link with friends:</p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                  <div className="text-sm text-gray-800 truncate mr-2">{groupOrderLink}</div>
                  <button 
                    onClick={copyToClipboard} 
                    className={`flex items-center justify-center p-2 ${copied ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'} rounded-full transition-colors`}
                    aria-label="Copy link"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                {copied && <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>}
                
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">About group orders</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• People can add items until the order deadline</li>
                  <li>• All items will be delivered together</li>
                  <li>• You'll be able to review the order before checking out</li>
                  {selectedLimit !== "No Limit" && (
                    <li>• You've set a {selectedLimit} limit per person</li>
                  )}
                  {hasDeadline && (
                    <li>
                      • Order deadline: {selectedDate}, {selectedDeadlineTime} ({selectedCheckoutOption} checkout)
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex justify-center">
                <button onClick={onClose} className="px-6 py-3 bg-red-600 text-white rounded-full font-medium">
                  Done
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6">
              <button onClick={handleBackClick} className="mb-4 flex items-center" aria-label="Back">
                <ArrowLeft className="h-6 w-6 text-gray-500" />
              </button>

              <h2 className="text-[28px] font-bold text-left mb-2">Order deadline</h2>
              <p className="text-gray-600 text-left mb-6">Deadline for people to add to cart</p>

              {/* Date selection tabs */}
              <div className="flex mb-6 overflow-x-auto">
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center relative ${
                    selectedDate === "Today" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Today")}
                >
                  <span className="font-medium">Today</span>
                  <span className="text-sm text-gray-500">May 21</span>
                  {selectedDate === "Today" && (
                    <span className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center ${
                    selectedDate === "Tomorrow" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Tomorrow")}
                >
                  <span className="font-medium">Tomorrow</span>
                  <span className="text-sm text-gray-500">May 22</span>
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg mr-2 flex flex-col items-center ${
                    selectedDate === "Friday" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Friday")}
                >
                  <span className="font-medium">Friday</span>
                  <span className="text-sm text-gray-500">May 23</span>
                </button>
                <button
                  className={`min-w-[140px] py-3 px-4 border rounded-lg flex flex-col items-center ${
                    selectedDate === "Saturday" ? "border-black bg-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDateSelect("Saturday")}
                >
                  <span className="font-medium">Saturday</span>
                  <span className="text-sm text-gray-500">May 24</span>
                </button>
              </div>

              {/* Time slots */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto">
                {[
                  "1:15 AM",
                  "1:30 AM",
                  "1:45 AM",
                  "2:00 AM",
                  "2:15 AM",
                  "2:30 AM",
                  "2:45 AM",
                  "3:00 AM",
                  "3:15 AM",
                  "3:30 AM",
                  "3:45 AM",
                  "4:00 AM",
                  "4:15 AM",
                  "4:30 AM",
                  "4:45 AM",
                  "5:00 AM",
                  "5:15 AM",
                  "5:30 AM",
                  "5:45 AM",
                  "6:00 AM",
                  "6:15 AM",
                  "6:30 AM",
                  "6:45 AM",
                  "7:00 AM",
                  "7:15 AM",
                  "7:30 AM",
                  "7:45 AM",
                  "8:00 AM",
                  "8:15 AM",
                  "8:30 AM",
                  "8:45 AM",
                  "9:00 AM",
                  "9:15 AM",
                  "9:30 AM",
                  "9:45 AM",
                  "10:00 AM",
                  "10:15 AM",
                  "10:30 AM",
                  "10:45 AM",
                  "11:00 AM",
                  "11:15 AM",
                  "11:30 AM",
                  "11:45 AM",
                  "12:00 PM",
                  "12:15 PM",
                  "12:30 PM",
                  "12:45 PM",
                  "1:00 PM",
                  "1:15 PM",
                  "1:30 PM",
                  "1:45 PM",
                  "2:00 PM",
                  "2:15 PM",
                  "2:30 PM",
                  "2:45 PM",
                  "3:00 PM",
                  "3:15 PM",
                  "3:30 PM",
                  "3:45 PM",
                  "4:00 PM",
                  "4:15 PM",
                  "4:30 PM",
                  "4:45 PM",
                  "5:00 PM",
                  "5:15 PM",
                  "5:30 PM",
                  "5:45 PM",
                  "6:00 PM",
                  "6:15 PM",
                  "6:30 PM",
                  "6:45 PM",
                  "7:00 PM",
                  "7:15 PM",
                  "7:30 PM",
                  "7:45 PM",
                  "8:00 PM",
                  "8:15 PM",
                  "8:30 PM",
                  "8:45 PM",
                  "9:00 PM",
                  "9:15 PM",
                  "9:30 PM",
                  "9:45 PM",
                  "10:00 PM",
                  "10:15 PM",
                  "10:30 PM",
                  "10:45 PM",
                  "11:00 PM",
                  "11:15 PM",
                  "11:30 PM",
                  "11:45 PM",
                ].map((time) => (
                  <div key={time} className="flex items-center">
                    <input
                      type="radio"
                      id={`deadline-${time}`}
                      name="deadline-time"
                      className="hidden"
                      checked={selectedDeadlineTime === time}
                      onChange={() => handleDeadlineTimeSelect(time)}
                    />
                    <label
                      htmlFor={`deadline-${time}`}
                      className="flex items-center cursor-pointer w-full"
                      onClick={() => handleDeadlineTimeSelect(time)}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedDeadlineTime === time ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {selectedDeadlineTime === time && <div className="w-3 h-3 bg-black rounded-full"></div>}
                      </div>
                      <div className="ml-3">{time}</div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Estimated delivery time */}
              <div className="my-6 text-center text-gray-600">
                <p>Estimated delivery time: {selectedDeadlineTime === "1:15 AM" ? "1:35 AM" : "1:35 AM"}</p>
                <p>+10 mins for $150+ orders</p>
              </div>

              {/* Checkout options */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">How do you want to check out?</h3>
                <p className="text-gray-600 text-sm mb-4">We'll send you reminders before the order deadline.</p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="manually"
                      name="checkout-option"
                      className="hidden"
                      checked={selectedCheckoutOption === "Manually"}
                      onChange={() => handleCheckoutOptionSelect("Manually")}
                    />
                    <label
                      htmlFor="manually"
                      className="flex items-center cursor-pointer w-full"
                      onClick={() => handleCheckoutOptionSelect("Manually")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedCheckoutOption === "Manually" ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {selectedCheckoutOption === "Manually" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Manually</div>
                        <div className="text-sm text-gray-500">
                          We'll remind you to checkout at {selectedDeadlineTime}.
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="automatically"
                      name="checkout-option"
                      className="hidden"
                      checked={selectedCheckoutOption === "Automatically"}
                      onChange={() => handleCheckoutOptionSelect("Automatically")}
                    />
                    <label
                      htmlFor="automatically"
                      className="flex items-center cursor-pointer w-full"
                      onClick={() => handleCheckoutOptionSelect("Automatically")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedCheckoutOption === "Automatically" ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {selectedCheckoutOption === "Automatically" && (
                          <div className="w-3 h-3 bg-black rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Automatically</div>
                        <div className="text-sm text-gray-500">
                          We'll checkout for you at {selectedDeadlineTime} and send you a confirmation.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleBackClick}
                  className="px-6 py-3 bg-gray-100 rounded-full font-medium text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDeadline}
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
