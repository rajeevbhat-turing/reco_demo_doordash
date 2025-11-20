"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronDown } from "lucide-react"
import { Address } from "@/lib/types/user-types"

interface AddressDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  address?: Address | Omit<Address, 'id'>
  onSave?: (addressData: any) => void
  hideAddressType?: boolean // Hide address type dropdown when coming from type selection
  onBack?: () => void // Go back to previous screen (address type modal)
}

// Separate state types for each address type
interface HouseState {
  gateCode: string
}

interface ApartmentState {
  apartmentSuite: string
  entryCode: string
  buildingName: string
}

interface HotelState {
  roomSuite: string
  hotelName: string
}

interface OfficeState {
  suiteFloor: string
  businessName: string
}

interface OtherState {
  suiteFloor: string
  gateCode: string
  buildingName: string
}

interface SharedState {
  deliveryPreference: "door" | "location"
  meetLocation: string
  deliveryInstructions: string
  personalLabel?: string
}

export default function AddressDetailsModal({ 
  isOpen, 
  onClose,
  address,
  onSave,
  hideAddressType = false,
  onBack
}: AddressDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [addressType, setAddressType] = useState<Address['addressType']>(address?.addressType || "house")
  
  // Separate state for each address type
  const [houseState, setHouseState] = useState<HouseState>({
    gateCode: ""
  })

  const [apartmentState, setApartmentState] = useState<ApartmentState>({
    apartmentSuite: "",
    entryCode: "",
    buildingName: ""
  })

  const [hotelState, setHotelState] = useState<HotelState>({
    roomSuite: "",
    hotelName: ""
  })

  const [officeState, setOfficeState] = useState<OfficeState>({
    suiteFloor: "",
    businessName: ""
  })

  const [otherState, setOtherState] = useState<OtherState>({
    suiteFloor: "",
    gateCode: "",
    buildingName: ""
  })

  // Get default meet location for address type
  const getDefaultMeetLocation = (type: Address['addressType']) => {
    switch (type) {
      case 'apartment': return "apartment-door"
      case 'hotel': return "room-door"
      case 'office': return "office-suite-floor"
      case 'other': return "door"
      case 'house':
      default: return ""
    }
  }

  // Shared state across all address types
  const [sharedState, setSharedState] = useState<SharedState>({
    deliveryPreference: "door",
    meetLocation: getDefaultMeetLocation(address?.addressType || "house"),
    deliveryInstructions: "",
  })

  // Custom label text state
  const standardLabels = ['home', 'work']
  const isCustomLabel = (label: string) => label && !standardLabels.includes(label.toLowerCase())
  const [customLabelText, setCustomLabelText] = useState("")

  // Initialize state from address prop
  useEffect(() => {
    if (address) {
      setAddressType(address.addressType || "house")
      
      // Initialize type-specific state if available
      if (address.gateCode) {
        setHouseState(prev => ({ ...prev, gateCode: address.gateCode || "" }))
        setOtherState(prev => ({ ...prev, gateCode: address.gateCode || "" }))
      }
      if (address.apartmentSuite) {
        setApartmentState(prev => ({ ...prev, apartmentSuite: address.apartmentSuite || "" }))
      }
      if (address.entryCode) {
        setApartmentState(prev => ({ ...prev, entryCode: address.entryCode || "" }))
      }
      if (address.buildingName) {
        setApartmentState(prev => ({ ...prev, buildingName: address.buildingName || "" }))
        setOtherState(prev => ({ ...prev, buildingName: address.buildingName || "" }))
      }
      if (address.roomSuite) {
        setHotelState(prev => ({ ...prev, roomSuite: address.roomSuite || "" }))
      }
      if (address.hotelName) {
        setHotelState(prev => ({ ...prev, hotelName: address.hotelName || "" }))
      }
      if (address.suiteFloor) {
        setOfficeState(prev => ({ ...prev, suiteFloor: address.suiteFloor || "" }))
        setOtherState(prev => ({ ...prev, suiteFloor: address.suiteFloor || "" }))
      }
      if (address.businessName) {
        setOfficeState(prev => ({ ...prev, businessName: address.businessName || "" }))
      }
      
      // Initialize shared state with defaults
      const defaultMeetLocation = getDefaultMeetLocation(address.addressType || "house")
      const addressLabel = address.personalLabel || ""
      const isCustom = isCustomLabel(addressLabel)
      
      setSharedState({
        deliveryPreference: address.deliveryPreference || "door",
        meetLocation: address.meetLocation || defaultMeetLocation,
        deliveryInstructions: address.deliveryInstructions || "",
        personalLabel: isCustom ? "custom" : addressLabel
      })
      
      // Set custom label text if it's a custom label
      if (isCustom) {
        setCustomLabelText(addressLabel)
      } else {
        setCustomLabelText("")
      }
    }
  }, [address])

  // Handle escape key and outside click
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
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Update meetLocation default when address type changes
  useEffect(() => {
    const defaultMeetLocation = getDefaultMeetLocation(addressType)
    // Only update if current meetLocation is empty or if we're switching types
    setSharedState(prev => ({
      ...prev,
      meetLocation: defaultMeetLocation
    }))
  }, [addressType])

  if (!isOpen || !address) return null

  // Get config for current address type
  const getTypeConfig = () => {
    switch (addressType) {
      case 'house':
        return {
          field1Label: null,
          field2Label: "Gate code",
          field3Label: null,
          entranceLabel: "House entrance",
          leaveAtLabel: "Leave at door",
          leaveAtOptions: [], // No options for house "Leave at door"
          meetAtOptions: ["Door", "Outside"],
          defaultMeetLocation: "" // No default for house since no options
        }
      case 'apartment':
        return {
          field1Label: "Apartment/Suite",
          field2Label: "Entry code",
          field3Label: "Building name",
          field3Recommended: true,
          entranceLabel: "Building entrance",
          leaveAtLabel: "Leave at a location",
          leaveAtOptions: ["Apartment Door", "Lobby"],
          meetAtOptions: ["Apartment Door", "Lobby", "Outside"],
          defaultMeetLocation: "apartment-door"
        }
      case 'hotel':
        return {
          field1Label: "Room/Suite",
          field1Recommended: true,
          field2Label: null,
          field3Label: "Hotel name",
          field3Recommended: true,
          entranceLabel: "Hotel entrance",
          leaveAtLabel: "Leave at a location",
          leaveAtOptions: ["Room Door", "Lobby"],
          meetAtOptions: ["Room Door", "Lobby", "Outside"],
          defaultMeetLocation: "room-door"
        }
      case 'office':
        return {
          field1Label: "Suite/Floor",
          field1Recommended: true,
          field2Label: null,
          field3Label: "Business name",
          field3Recommended: true,
          entranceLabel: "Building entrance",
          leaveAtLabel: "Leave at a location",
          leaveAtOptions: ["Office suite/floor", "Lobby"],
          meetAtOptions: ["Office suite/floor", "Lobby", "Outside"],
          defaultMeetLocation: "office-suite-floor"
        }
      case 'other':
        return {
          field1Label: "Suite/Floor",
          field2Label: "Gate code",
          field3Label: "Building name",
          entranceLabel: "Building entrance",
          leaveAtLabel: "Leave at a location",
          leaveAtOptions: ["Door", "Lobby"],
          meetAtOptions: ["Door", "Lobby", "Outside"],
          defaultMeetLocation: "door"
        }
      default:
        return {
          field1Label: null,
          field2Label: "Gate code",
          field3Label: null,
          entranceLabel: "House entrance",
          leaveAtLabel: "Leave at door",
          leaveAtOptions: [],
          meetAtOptions: ["Door", "Outside"],
          defaultMeetLocation: ""
        }
    }
  }

  const config = getTypeConfig()

  // Get current state based on address type
  const getCurrentState = () => {
    switch (addressType) {
      case 'house': return houseState
      case 'apartment': return apartmentState
      case 'hotel': return hotelState
      case 'office': return officeState
      case 'other': return otherState
      default: return houseState
    }
  }

  // Update current state based on address type
  const updateCurrentState = (updates: Partial<any>) => {
    switch (addressType) {
      case 'house':
        setHouseState(prev => ({ ...prev, ...updates }))
        break
      case 'apartment':
        setApartmentState(prev => ({ ...prev, ...updates }))
        break
      case 'hotel':
        setHotelState(prev => ({ ...prev, ...updates }))
        break
      case 'office':
        setOfficeState(prev => ({ ...prev, ...updates }))
        break
      case 'other':
        setOtherState(prev => ({ ...prev, ...updates }))
        break
    }
  }

  const currentState = getCurrentState()

  const handleSave = () => {
    if (onSave) {
      // Base data with shared state
      const baseData: any = {
        addressType,
        ...sharedState
      }

      // If custom label is selected, use the custom text (maintaining case)
      // Otherwise use lowercase for standard labels
      if (sharedState.personalLabel === "custom") {
        baseData.personalLabel = customLabelText
      } else {
        baseData.personalLabel = sharedState.personalLabel?.toLowerCase()
      }

      // Add type-specific fields
      switch (addressType) {
        case 'house':
          if (houseState.gateCode) baseData.gateCode = houseState.gateCode
          break
        case 'apartment':
          if (apartmentState.apartmentSuite) baseData.apartmentSuite = apartmentState.apartmentSuite
          if (apartmentState.entryCode) baseData.entryCode = apartmentState.entryCode
          if (apartmentState.buildingName) baseData.buildingName = apartmentState.buildingName
          break
        case 'hotel':
          if (hotelState.roomSuite) baseData.roomSuite = hotelState.roomSuite
          if (hotelState.hotelName) baseData.hotelName = hotelState.hotelName
          break
        case 'office':
          if (officeState.suiteFloor) baseData.suiteFloor = officeState.suiteFloor
          if (officeState.businessName) baseData.businessName = officeState.businessName
          break
        case 'other':
          if (otherState.suiteFloor) baseData.suiteFloor = otherState.suiteFloor
          if (otherState.gateCode) baseData.gateCode = otherState.gateCode
          if (otherState.buildingName) baseData.buildingName = otherState.buildingName
          break
      }

      onSave(baseData)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div ref={dialogRef} className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
            {hideAddressType ? 'Address' : 'Address details'}
          </h2>
          
          {/* Full Address */}
          <p className="text-sm text-gray-600">
            {address.street}, {address.city}, {address.state} {address.zipCode}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Address Type - Only show if not coming from type selection */}
          {!hideAddressType && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Address type
            </label>
            <div className="relative">
              <select
                value={addressType}
                  onChange={(e) => setAddressType(e.target.value as Address['addressType'])}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
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
          )}

          {/* Dynamic fields based on address type */}
          {addressType === 'house' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Gate code
              </label>
              <input
                type="text"
                value={houseState.gateCode}
                onChange={(e) => setHouseState({ ...houseState, gateCode: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {addressType === 'apartment' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Apartment/Suite
                  </label>
                  <input
                    type="text"
                    value={apartmentState.apartmentSuite}
                    onChange={(e) => setApartmentState({ ...apartmentState, apartmentSuite: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Entry code
                  </label>
                  <input
                    type="text"
                    value={apartmentState.entryCode}
                    onChange={(e) => setApartmentState({ ...apartmentState, entryCode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Building name
                  <span className="text-xs font-normal text-gray-500 ml-2">Recommended</span>
                </label>
                <input
                  type="text"
                  value={apartmentState.buildingName}
                  onChange={(e) => setApartmentState({ ...apartmentState, buildingName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          {addressType === 'hotel' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Room/Suite
                  <span className="text-xs font-normal text-gray-500 ml-2">Recommended</span>
                </label>
                <input
                  type="text"
                  value={hotelState.roomSuite}
                  onChange={(e) => setHotelState({ ...hotelState, roomSuite: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hotel name
                  <span className="text-xs font-normal text-gray-500 ml-2">Recommended</span>
                </label>
                <input
                  type="text"
                  value={hotelState.hotelName}
                  onChange={(e) => setHotelState({ ...hotelState, hotelName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          {addressType === 'office' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Suite/Floor
                  <span className="text-xs font-normal text-gray-500 ml-2">Recommended</span>
                </label>
                <input
                  type="text"
                  value={officeState.suiteFloor}
                  onChange={(e) => setOfficeState({ ...officeState, suiteFloor: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business name
                  <span className="text-xs font-normal text-gray-500 ml-2">Recommended</span>
                </label>
                <input
                  type="text"
                  value={officeState.businessName}
                  onChange={(e) => setOfficeState({ ...officeState, businessName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}

          {addressType === 'other' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Suite/Floor
                  </label>
                  <input
                    type="text"
                    value={otherState.suiteFloor}
                    onChange={(e) => setOtherState({ ...otherState, suiteFloor: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Gate code
            </label>
            <input
              type="text"
                    value={otherState.gateCode}
                    onChange={(e) => setOtherState({ ...otherState, gateCode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Building name
                </label>
                <input
                  type="text"
                  value={otherState.buildingName}
                  onChange={(e) => setOtherState({ ...otherState, buildingName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
            </>
          )}

          {/* Entrance Map */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {config.entranceLabel}
            </label>
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                <button className="bg-white px-4 py-1.5 rounded-full shadow-md text-sm font-medium">
                  Adjust pin
                </button>
              </div>
            </div>
          </div> */}

          {/* Delivery Preferences */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Delivery preferences
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSharedState({ ...sharedState, deliveryPreference: "door" })}
                className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors ${
                  sharedState.deliveryPreference === "door"
                    ? "border-black bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">{config.leaveAtLabel}</span>
              </button>
              <button
                onClick={() => setSharedState({ ...sharedState, deliveryPreference: "location" })}
                className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors ${
                  sharedState.deliveryPreference === "location"
                    ? "border-black bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                <span className="text-sm font-medium">Meet at a location</span>
              </button>
            </div>
            
            {/* Location options based on delivery preference and address type */}
            {(sharedState.deliveryPreference === "door" && config.leaveAtOptions.length > 0) || 
             (sharedState.deliveryPreference === "location" && config.meetAtOptions.length > 0) ? (
              <div className="mt-4 space-y-3">
                {(sharedState.deliveryPreference === "door" ? config.leaveAtOptions : config.meetAtOptions).map((option) => {
                  const optionValue = option.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <label key={option} className="flex items-center cursor-pointer w-full">
                  <div className="relative">
                    <input
                      type="radio"
                      name="meetLocation"
                          value={optionValue}
                          checked={sharedState.meetLocation === optionValue}
                          onChange={() => setSharedState({ ...sharedState, meetLocation: optionValue })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          sharedState.meetLocation === optionValue 
                        ? "border-black" 
                        : "border-gray-300"
                    }`}>
                          {sharedState.meetLocation === optionValue && (
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      )}
                    </div>
                  </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{option}</span>
                </label>
                  )
                })}
              </div>
            ) : null}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Delivery instructions
            </label>
            <textarea
              value={sharedState.deliveryInstructions}
              placeholder={`e.g. ring the bell after dropoff, leave next to the porch, call upon arrival, etc.

Do not add order changes or requests here.`}
              onChange={(e) => setSharedState({ ...sharedState, deliveryInstructions: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
            />
          </div>

          {/* Personal Label */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Personal label
            </label>
            <div className="flex flex-wrap gap-2">
              {['none', 'home', 'work', 'custom'].map((label) => (
              <button
                  key={label}
                  onClick={() => setSharedState({ ...sharedState, personalLabel: label })}
                  className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                    sharedState.personalLabel === label
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
              </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Only you can see this</p>
            
            {/* Custom Label Input - Only shown when Custom is selected */}
            {sharedState.personalLabel === "custom" && (
              <div className="mt-4">
                <input
                  type="text"
                  value={customLabelText}
                  onChange={(e) => setCustomLabelText(e.target.value)}
                  placeholder="Enter custom label"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl p-6 pt-4 border-t border-gray-100 flex gap-4">
          <button
            onClick={hideAddressType && onBack ? onBack : onClose}
            className="flex-1 py-3 px-6 text-gray-900 font-semibold hover:bg-gray-100 rounded-full transition-colors"
          >
            {hideAddressType && onBack ? 'Back' : 'Cancel'}
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
