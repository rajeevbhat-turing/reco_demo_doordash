"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { Address } from "@/lib/types/user-types"

interface AddressDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  address?: Address
  onSave?: (addressData: any) => void
}

export default function AddressDetailsModal({ 
  isOpen, 
  onClose,
  address,
  onSave
}: AddressDetailsModalProps) {
  const [addressType, setAddressType] = useState(address?.addressType || "house")
  const [gateCode, setGateCode] = useState(address?.gateCode || "")
  const [deliveryPreference, setDeliveryPreference] = useState<"door" | "location">(address?.deliveryPreference || "door")
  const [meetLocation, setMeetLocation] = useState<"door" | "outside">(address?.meetLocation || "door")
  const [deliveryInstructions, setDeliveryInstructions] = useState(address?.deliveryInstructions || "")
  const [personalLabel, setPersonalLabel] = useState(address?.personalLabel || "none")

  // Update state when address changes
  useEffect(() => {
    if (address) {
      setAddressType(address.addressType || "house")
      setGateCode(address.gateCode || "")
      setDeliveryPreference(address.deliveryPreference || "door")
      setMeetLocation(address.meetLocation || "door")
      setDeliveryInstructions(address.deliveryInstructions || "")
      setPersonalLabel(address.personalLabel || "none")
    }
  }, [address])

  if (!isOpen || !address) return null

  const handleSave = () => {
    if (onSave) {
      onSave({
        addressType,
        gateCode,
        deliveryPreference,
        meetLocation,
        deliveryInstructions,
        personalLabel
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-2xl p-6 pb-4 border-b border-gray-100 z-10">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-6">
            Address details
          </h2>
          
          {/* Full Address */}
          <p className="text-sm text-gray-600">
            {address.street}, {address.city}, {address.state} {address.zipCode}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Address type
            </label>
            <div className="relative">
              <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="hotel">Hotel</option>
                <option value="office">Office</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* Gate Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Gate code
            </label>
            <input
              type="text"
              value={gateCode}
              onChange={(e) => setGateCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* House Entrance */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              House entrance
            </label>
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
              {/* Map Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                {/* Pin Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>
              {/* Adjust Pin Button */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <button className="bg-white px-4 py-1.5 rounded-full shadow-md text-sm font-medium">
                  Adjust pin
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Preferences */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Delivery preferences
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryPreference("door")}
                className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors hover:bg-gray-100 ${
                  deliveryPreference === "door"
                    ? "border-black bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">Leave at door</span>
              </button>
              <button
                onClick={() => setDeliveryPreference("location")}
                className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors hover:bg-gray-100 ${
                  deliveryPreference === "location"
                    ? "border-black bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                <span className="text-sm font-medium">Meet at a location</span>
              </button>
            </div>
            
            {/* Door/Outside Radio Buttons - shown when "Meet at a location" is selected */}
            {deliveryPreference === "location" && (
              <div className="mt-4 space-y-3">
                <label className="flex items-center cursor-pointer w-full ">
                  <div className="relative">
                    <input
                      type="radio"
                      name="meetLocation"
                      value="door"
                      checked={meetLocation === "door"}
                      onChange={() => setMeetLocation("door")}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      meetLocation === "door" 
                        ? "border-black" 
                        : "border-gray-300"
                    }`}>
                      {meetLocation === "door" && (
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Door</span>
                </label>

                <label className="flex items-center cursor-pointer w-full">
                  <div className="relative">
                    <input
                      type="radio"
                      name="meetLocation"
                      value="outside"
                      checked={meetLocation === "outside"}
                      onChange={() => setMeetLocation("outside")}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      meetLocation === "outside" 
                        ? "border-black" 
                        : "border-gray-300"
                    }`}>
                      {meetLocation === "outside" && (
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Outside</span>
                </label>
              </div>
            )}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Delivery instructions
            </label>
            <textarea
              value={deliveryInstructions}
              placeholder={`e.g. ring the bell after dropoff, leave next to the porch, call upon arrival, etc.

Do not add order changes or requests here.`}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
            />
          </div>

          {/* Personal Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Personal label
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPersonalLabel("none")}
                className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                  personalLabel === "none"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                None
              </button>
              <button
                onClick={() => setPersonalLabel("home")}
                className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                  personalLabel === "home"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setPersonalLabel("work")}
                className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                  personalLabel === "work"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Work
              </button>
              <button
                onClick={() => setPersonalLabel("custom")}
                  className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                  personalLabel === "custom"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Custom
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Only you can see this</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl p-6 pt-4 border-t border-gray-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 text-gray-900 font-semibold hover:bg-gray-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

