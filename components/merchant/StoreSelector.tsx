'use client'

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import type { Restaurant } from "@/constants/restaurants"

interface StoreSelectorProps {
  isOpen: boolean
  onClose: () => void
  restaurants: Restaurant[]
  isLoading?: boolean
}

export default function StoreSelector({ isOpen, onClose, restaurants, isLoading = false }: StoreSelectorProps) {
  const { currentStoreId, setCurrentStoreId } = useCurrentStore()
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredStores = useMemo(() => {
    if (!restaurants || restaurants.length === 0) {
      return []
    }
    if (!searchValue.trim()) {
      return restaurants
    }
    const searchLower = searchValue.toLowerCase()
    return restaurants.filter(store =>
      store.name.toLowerCase().includes(searchLower) ||
      `${store.street || ''}, ${store.city || ''}, ${store.state || ''} ${store.zipCode || ''}`.toLowerCase().includes(searchLower)
    )
  }, [searchValue, restaurants])

  const formatAddress = (store: Restaurant) => {
    return `${store.street || ''}, ${store.city || ''}, ${store.state || ''} ${store.zipCode || ''}, USA`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown Panel */}
      <div 
        ref={dropdownRef}
        className="fixed left-[16px] top-[88px] w-[400px] max-h-[calc(100vh-120px)] bg-white z-50 shadow-2xl rounded-lg flex flex-col border border-gray-200"
      >
        {/* Header Section - Fixed */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-semibold text-gray-900">Frosty Bear test</div>
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">G</div>
              <div className="text-xs text-gray-500">NCP</div>
              <span className="text-xs">🐻</span>
              <span className="text-xs">🫘</span>
              <span className="text-xs">🫘</span>
              <span className="text-xs">🫘</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a store"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm bg-white"
            />
          </div>

          {/* Frosty Bear test section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <span>Frosty Bear test</span>
              <span>🐻</span>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              View dashboard
            </a>
          </div>

          {/* Add Store Button */}
          <button className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 bg-white">
            Add store or business
          </button>
        </div>

        {/* Scrollable Stores List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Your stores</h3>
            {isLoading ? (
              <div className="text-sm text-gray-500 py-4">Loading stores...</div>
            ) : filteredStores.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">No stores found</div>
            ) : (
              <div className="space-y-0">
                {filteredStores.map((store) => {
                  const isSelected = currentStoreId === store.id
                  return (
                    <button
                      key={store.id}
                      onClick={() => {
                        setCurrentStoreId(store.id)
                        onClose()
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
                            {store.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {formatAddress(store)}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}

