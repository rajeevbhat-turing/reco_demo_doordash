"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { Address } from "@/lib/types/user-types"

interface AddAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (addressData: Omit<Address, 'id'>) => void
  onBack?: () => void
  initialData?: {
    street: string
    apartmentSuite?: string
    city: string
    state: string
    zipCode: string
  }
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
]

export default function AddAddressModal({ 
  isOpen, 
  onClose, 
  onContinue,
  onBack,
  initialData
}: AddAddressModalProps) {
  const [country, setCountry] = useState("United States")
  const [streetAddress, setStreetAddress] = useState("")
  const [apartmentSuite, setApartmentSuite] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("Alabama")
  const [zipCode, setZipCode] = useState("")

  // Update form when initialData changes or modal opens
  useEffect(() => {
    if (!isOpen) return
    
    if (initialData) {
      // Extract street and apartment from initial data
      const streetParts = initialData.street.split(',').map(s => s.trim())
      setStreetAddress(streetParts[0] || "")
      setApartmentSuite(initialData.apartmentSuite || streetParts[1] || "")
      setCity(initialData.city || "")
      setState(initialData.state || "Alabama")
      setZipCode(initialData.zipCode || "")
    } else {
      // Reset to defaults if no initial data
      setStreetAddress("")
      setApartmentSuite("")
      setCity("")
      setState("Alabama")
      setZipCode("")
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleContinue = () => {
    // Combine street address with apartment/suite if provided
    const fullStreetAddress = apartmentSuite 
      ? `${streetAddress}, ${apartmentSuite}`.trim()
      : streetAddress.trim()
    
    const addressData: Omit<Address, 'id'> = {
      street: fullStreetAddress,
      city: city,
      state: state,
      zipCode: zipCode,
      addressType: "house",
    }
    onContinue(addressData)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-6">
            Add new address
          </h2>

          {/* Form */}
          <div className="space-y-4">
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                Country
              </label>
              <div className="relative">
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 appearance-none"
                >
                  <option value="United States">United States</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-900 mb-2">
                Street Address
              </label>
              <input
                id="streetAddress"
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                placeholder=""
              />
            </div>

            {/* Apartment/Suite and City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apartmentSuite" className="block text-sm font-medium text-gray-900 mb-2">
                  Apartment/Suite
                </label>
                <input
                  id="apartmentSuite"
                  type="text"
                  value={apartmentSuite}
                  onChange={(e) => setApartmentSuite(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  placeholder=""
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  placeholder=""
                />
              </div>
            </div>

            {/* State and Zip code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-900 mb-2">
                  State
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 appearance-none"
                  >
                    {US_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-900 mb-2">
                  Zip code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  placeholder=""
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleBack}
              className="w-full py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

