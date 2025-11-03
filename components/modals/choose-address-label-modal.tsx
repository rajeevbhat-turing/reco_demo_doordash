"use client"

import { useState, useMemo } from "react"
import { X, Search, ChevronRight } from "lucide-react"
import { Address } from "@/lib/types/user-types"
import addressesData from "@/data/addresses.json"

interface ChooseAddressLabelModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: Address[]
  onSelectAddress: (addressId: string) => void
  onSelectSearchAddress?: (address: Address) => void
  onManualEntry?: () => void
}

export default function ChooseAddressLabelModal({ 
  isOpen, 
  onClose, 
  addresses,
  onSelectAddress,
  onSelectSearchAddress,
  onManualEntry
}: ChooseAddressLabelModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

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

  // Filter user's saved addresses for the list below
  const filteredAddresses = addresses.filter((address) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const fullAddress = `${address.street} ${address.city} ${address.state} ${address.zipCode}`.toLowerCase()
    return fullAddress.includes(query)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
            Choose address to label
          </h2>

          {/* Search Bar */}
          <div className="relative mb-6">
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
        </div>

        {/* Address List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredAddresses.map((address, index) => {
            const isLastAddress = index === filteredAddresses.length - 1
            return (
              <div 
                key={address.id}
                className={`flex items-start justify-between p-4 hover:bg-gray-100 cursor-pointer transition-colors border-t border-gray-200 ${
                  isLastAddress ? 'rounded-b-2xl' : ''
                }`}
                onClick={() => onSelectAddress(address.id)}
              >
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

                {/* Right Arrow Icon */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            )
          })}
        </div>

        {filteredAddresses.length === 0 && (
          <p className="text-center text-gray-500 py-8">No addresses found</p>
        )}
      </div>
    </div>
  )
}

