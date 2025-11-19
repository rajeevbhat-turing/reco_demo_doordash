'use client'

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { restaurants } from "@/constants/restaurants"

interface RestaurantSelectorProps {
  selectedRestaurantId?: string
  onSelectRestaurant?: (restaurantId: string) => void
}

export default function RestaurantSelector({ selectedRestaurantId, onSelectRestaurant }: RestaurantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || restaurants[0]

  const filteredRestaurants = useMemo(() => {
    if (!searchValue.trim()) {
      return restaurants
    }
    const searchLower = searchValue.toLowerCase()
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchLower) ||
      `${restaurant.street}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`.toLowerCase().includes(searchLower)
    )
  }, [searchValue])

  const formatAddress = (restaurant: typeof restaurants[0]) => {
    return `${restaurant.street}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}, USA`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-end justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-end gap-2">
          <div className="text-sm font-medium">{selectedRestaurant.name}</div>
          <div className="text-xs text-gray-500 mb-0.5">Store</div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500 mb-0.5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div 
            className="absolute left-0 top-full mt-1 w-[400px] max-h-[400px] bg-white z-50 shadow-2xl rounded-lg flex flex-col border border-gray-200"
          >
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-900">{selectedRestaurant.name}</div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Restaurants List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-0">
                  {filteredRestaurants.map((restaurant) => {
                    const isSelected = selectedRestaurantId === restaurant.id
                    return (
                      <button
                        key={restaurant.id}
                        onClick={() => {
                          onSelectRestaurant?.(restaurant.id)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                          isSelected
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                            isSelected ? "bg-green-500" : "bg-gray-300"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {restaurant.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {formatAddress(restaurant)}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

