"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { X, Search, Plus, Edit2, ChevronRight } from "lucide-react"
import { Address } from "@/lib/types/user-types"
import addressesData from "@/data/addresses.json"

interface AddressesModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: Address[]
  selectedAddressId?: string
  onSelectAddress: (addressId: string) => void
  onEditAddress?: (addressId: string) => void
  onSelectSearchAddress?: (address: Address) => void
  onManualEntry?: () => void
  onAddLabel?: () => void
}

export default function AddressesModal({ 
  isOpen, 
  onClose, 
  addresses,
  selectedAddressId,
  onSelectAddress,
  onEditAddress,
  onSelectSearchAddress,
  onManualEntry,
  onAddLabel
}: AddressesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const dialogRef = useRef<HTMLDivElement>(null)

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

  // Filter searchable addresses from JSON data (API simulation) - for dropdown
  const filteredSearchAddresses = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return (addressesData as Address[]).filter((address) => {
      const fullAddress = `${address.street} ${address.city} ${address.state} ${address.zipCode}`.toLowerCase()
      return fullAddress.includes(query)
    })
  }, [searchQuery])

  const hasSearchResults = searchQuery.trim().length > 0 && filteredSearchAddresses.length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={dialogRef} className="relative bg-white rounded-2xl w-full max-w-md mx-4">
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
            
            {/* Dropdown with search results */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                {filteredSearchAddresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      onSelectSearchAddress?.(address as Address)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex-1 mr-2">
                      <p className="text-gray-900 text-sm">
                        {address.street}, {address.city} {address.state} {address.zipCode}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
                {onManualEntry && (
                  <div
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-colors border-t border-gray-200"
                    onClick={() => {
                      onManualEntry()
                      setSearchQuery("")
                    }}
                  >
                    <p className="text-gray-900 text-sm">Enter address manually</p>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Label Pills and Add Label Button */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Display all unique labels */}
            {addresses
              .filter(addr => addr.personalLabel)
              .map(addr => ({
                label: addr.personalLabel!,
                addressId: addr.id,
                isSelected: selectedAddressId === addr.id
              }))
              .filter((item, index, self) => 
                // Keep only unique labels (first occurrence)
                index === self.findIndex(t => t.label.toLowerCase() === item.label.toLowerCase())
              )
              .map(({ label, addressId, isSelected }) => (
                <button
                  key={addressId}
                  onClick={() => onSelectAddress(addressId)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              ))}

            {/* Add Label Button */}
            <button 
              onClick={() => {
                onAddLabel?.()
                onClose()
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-full font text-black bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">Add label</span>
            </button>
          </div>
        </div>
        {/* Address List - Shows all user's saved addresses */}
        <div>
          {addresses.map((address, index) => {
            const isLastAddress = index === addresses.length - 1
            return (
              <div 
                key={address.id}
                className={`flex items-start p-4 hover:bg-gray-100 cursor-pointer transition-colors ${
                  isLastAddress ? 'rounded-b-2xl' : ''
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
                  {address.personalLabel ? (
                    <>
                      <p className="font-medium text-gray-900">
                        {address.personalLabel.charAt(0).toUpperCase() + address.personalLabel.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900">{address.street}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                    </>
                  )}
                </div>

                {/* Edit Icon */}
                <button 
                  className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors ml-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onEditAddress) {
                      onEditAddress(address.id)
                    }
                  }}
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )
          })}
        </div>

        {addresses.length === 0 && (
          <p className="text-center text-gray-500 py-8">No addresses found</p>
        )}
      </div>
    </div>
  )
}

