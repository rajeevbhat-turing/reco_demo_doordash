"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search, Plus, Edit2, ChevronDown } from "lucide-react"
import { Address } from "@/lib/types/user-types"
import { useUserStore } from "@/store/user-store"

interface AddressesModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: Address[]
  selectedAddressId?: string
  onSelectAddress: (addressId: string) => void
  onEditAddress?: (addressId: string) => void
}

export default function AddressesModal({ 
  isOpen, 
  onClose, 
  addresses,
  selectedAddressId,
  onSelectAddress,
  onEditAddress
}: AddressesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  
  // Form states for expanded view
  const [addressType, setAddressType] = useState<"none" | "house" | "apartment" | "hotel" | "office" | "other">("none")
  const [apartmentSuite, setApartmentSuite] = useState("")
  const [gateCode, setGateCode] = useState("")
  const [buildingName, setBuildingName] = useState("")
  const [deliveryPreference, setDeliveryPreference] = useState<"door" | "location">("door")
  const [meetLocation, setMeetLocation] = useState<"door" | "outside">("door")
  const [deliveryInstructions, setDeliveryInstructions] = useState("")
  const [personalLabel, setPersonalLabel] = useState<string>("none")

  const { updateAddress } = useUserStore()

  // Ref for modal container to detect clicks outside
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      // Add event listener when modal is open
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      // Clean up event listener when modal closes or component unmounts
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Get the address being edited (or use sample address if editing sample)
  const editingAddress = editingAddressId 
    ? (editingAddressId === 'sample-address' 
        ? {
            id: 'sample-address',
            street: '15431 Conway Rd',
            city: 'Chesterfield',
            state: 'MO',
            zipCode: '63017',
            addressType: addressType,
            apartmentSuite: apartmentSuite,
            gateCode: gateCode,
            buildingName: buildingName,
            deliveryPreference: deliveryPreference,
            meetLocation: meetLocation,
            deliveryInstructions: deliveryInstructions,
            personalLabel: personalLabel
          } as Address
        : addresses.find(a => a.id === editingAddressId))
    : null

  // Initialize form state when editing address changes
  useEffect(() => {
    if (editingAddress) {
      setAddressType(editingAddress.addressType || "none")
      setApartmentSuite(editingAddress.apartmentSuite || "")
      setGateCode(editingAddress.gateCode || "")
      setBuildingName(editingAddress.buildingName || "")
      setDeliveryPreference(editingAddress.deliveryPreference || "door")
      setMeetLocation(editingAddress.meetLocation || "door")
      setDeliveryInstructions(editingAddress.deliveryInstructions || "")
      setPersonalLabel(editingAddress.personalLabel || "none")
    }
  }, [editingAddress])

  if (!isOpen) return null

  const filteredAddresses = addresses.filter(address => {
    const fullAddress = `${address.street} ${address.city} ${address.state} ${address.zipCode}`.toLowerCase()
    return fullAddress.includes(searchQuery.toLowerCase())
  })

  const handleEditClick = (addressId: string) => {
    setEditingAddressId(addressId)
    setSearchQuery("") // Clear search when expanding
  }

  const handleBackClick = () => {
    setEditingAddressId(null)
  }

  const handleSaveClick = () => {
    if (editingAddressId && editingAddress) {
      // Don't save sample address - just close
      if (editingAddressId === 'sample-address') {
        // Sample address cannot be saved as it doesn't exist in the addresses array
        // User would need to create a new address first
        setEditingAddressId(null)
        return
      }
      
      updateAddress(editingAddressId, {
        addressType,
        apartmentSuite,
        gateCode,
        buildingName,
        deliveryPreference,
        meetLocation,
        deliveryInstructions,
        personalLabel
      })
    }
    setEditingAddressId(null)
  }

  // Render expanded view when editing
  if (editingAddressId && editingAddress) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div ref={modalRef} className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Sticky Header */}
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
              {editingAddress.street}, {editingAddress.city}, {editingAddress.state} {editingAddress.zipCode}, USA
            </p>
          </div>

          {/* Form Fields */}
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors pr-10"
                >
                  <option value="none">None</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="hotel">Hotel</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Apartment/Suite and Entry code - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Apartment/Suite
                </label>
                <input
                  type="text"
                  value={apartmentSuite}
                  onChange={(e) => setApartmentSuite(e.target.value)}
                  placeholder="Apt 123 or Suite 456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Entry code
                </label>
                <input
                  type="text"
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value)}
                  placeholder="Enter entry code"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Building Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Building name
              </label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="Enter building name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400"
              />
            </div>

            {/* Building Entrance */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Building entrance
              </label>
              <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                {/* Map Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                  {/* Pin Icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="black">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </div>
                {/* Mapbox Logo */}
                <div className="absolute bottom-2 left-2">
                  <p className="text-xs text-gray-500">mapbox</p>
                </div>
                {/* Adjust Pin Button */}
                <div className="absolute bottom-3 right-3">
                  <button className="bg-white px-4 py-1.5 rounded-full shadow-md text-sm font-medium hover:bg-gray-50 transition-colors">
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
                  className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors ${
                    deliveryPreference === "door"
                      ? "border-red-600 text-red-600 bg-white"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-sm font-medium">Leave at door</span>
                </button>
                <button
                  onClick={() => setDeliveryPreference("location")}
                  className={`flex items-center space-x-2 px-4 py-4 rounded-lg border-2 transition-colors ${
                    deliveryPreference === "location"
                      ? "border-red-600 text-red-600 bg-white"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  <span className="text-sm font-medium">Meet at door</span>
                </button>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Delivery instructions
              </label>
              <textarea
                value={deliveryInstructions}
                placeholder="Deliver to 822"
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                rows={3}
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
          <div className="sticky bottom-0 bg-white rounded-b-2xl p-6 pt-4 border-t border-gray-100 flex justify-end gap-4">
            <button
              onClick={handleBackClick}
              className="py-3 px-6 text-gray-900 font-semibold hover:bg-gray-100 rounded-full transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveClick}
              className="py-3 px-6 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render simple view (addresses list)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="relative bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6 pb-0">
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
            Addresses
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Your Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
            />
          </div>

          {/* Label Buttons */}
          <div className="flex items-center gap-2 mb-4">
            {/* Home Button - Black background, white text */}
            <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors">
              Home
            </button>
            {/* Add Label Button - Light grey background (same as search bar), black text */}
            <button className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-300">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add label</span>
            </button>
          </div>
        </div>
        {/* Address List */}
        <div>
          {filteredAddresses.map((address, index) => (
            <div 
              key={address.id}
              className={`flex items-start p-4 hover:bg-gray-100 cursor-pointer transition-colors relative ${
                index === filteredAddresses.length - 1 ? 'rounded-b-2xl' : ''
              }`}
              onClick={() => onSelectAddress(address.id)}
            >
              {/* Radio Button */}
              <div className="flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAddressId === address.id 
                    ? "border-red-500" 
                    : "border-gray-300"
                }`}>
                  {selectedAddressId === address.id && (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Address Content */}
              <div className="flex-1">
                {/* Display label if available (Home, Work, etc.) */}
                {address.personalLabel && address.personalLabel !== "none" && (
                  <p className="text-sm text-gray-600 mb-1 capitalize">{address.personalLabel}</p>
                )}
                <p className="font-medium text-gray-900">{address.street}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
              </div>

              {/* Edit Icon */}
              <button 
                type="button"
                className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors ml-2 z-10 relative"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleEditClick(address.id)
                }}
              >
                <Edit2 className="w-5 h-5 text-gray-600 pointer-events-none" />
              </button>
            </div>
          ))}
        </div>

        {filteredAddresses.length === 0 && (
          <div className="py-4">
            {/* Sample Address Entry - Placeholder */}
            <div className="flex items-start p-4 hover:bg-gray-100 transition-colors">
              {/* Radio Button - Selected state (red) */}
              <div className="flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>

              {/* Address Content */}
              <div className="flex-1">
                {/* Label */}
                <p className="text-sm text-gray-600 mb-1">Home</p>
                {/* Street Address */}
                <p className="font-medium text-gray-900">15431 Conway Rd</p>
                {/* City, State, Zip, Country */}
                <p className="text-sm text-gray-600">Chesterfield, MO 63017, USA</p>
              </div>

              {/* Edit Icon - For sample address, create a temporary address object for editing */}
              <button 
                type="button"
                className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors ml-2 z-10 relative"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  // Create a temporary address object for the sample address
                  const sampleAddress: Address = {
                    id: 'sample-address',
                    street: '15431 Conway Rd',
                    city: 'Chesterfield',
                    state: 'MO',
                    zipCode: '63017',
                    addressType: 'none',
                    apartmentSuite: '',
                    gateCode: '',
                    buildingName: '',
                    deliveryPreference: 'door',
                    meetLocation: 'door',
                    deliveryInstructions: '',
                    personalLabel: 'home'
                  }
                  // Add the sample address temporarily to enable editing
                  setEditingAddressId('sample-address')
                  // Initialize form with sample data
                  setAddressType(sampleAddress.addressType || "none")
                  setApartmentSuite(sampleAddress.apartmentSuite || "")
                  setGateCode(sampleAddress.gateCode || "")
                  setBuildingName(sampleAddress.buildingName || "")
                  setDeliveryPreference(sampleAddress.deliveryPreference || "door")
                  setMeetLocation(sampleAddress.meetLocation || "door")
                  setDeliveryInstructions(sampleAddress.deliveryInstructions || "")
                  setPersonalLabel(sampleAddress.personalLabel || "home")
                }}
              >
                <Edit2 className="w-5 h-5 text-gray-600 pointer-events-none" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

