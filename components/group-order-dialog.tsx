"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronRight, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface GroupOrderDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function GroupOrderDialog({ isOpen, onClose }: GroupOrderDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [currentView, setCurrentView] = useState<"main" | "paying">("main")
  const [selectedLimit, setSelectedLimit] = useState<string>("No Limit")

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEscapeKey)
    } else {
      // Reset to main view when dialog is closed
      setCurrentView("main")
    }

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscapeKey)
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

                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
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
                        <p className="text-gray-500 text-sm">ASAP after you checkout</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
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
                        <h4 className="font-medium">No order deadline</h4>
                        <p className="text-gray-500 text-sm">People can add to cart any time</p>
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
                <button className="px-6 py-3 bg-red-600 text-white rounded-full font-medium">Start Group Order</button>
              </div>
            </div>
          </>
        ) : (
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
                    selectedLimit === "A$10" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("A$10")}
                >
                  A$10
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "A$15" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("A$15")}
                >
                  A$15
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedLimit === "A$20" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => handleLimitSelect("A$20")}
                >
                  A$20
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
        )}
      </div>
    </div>
  )
}
