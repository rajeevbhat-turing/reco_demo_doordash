'use client'

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import type { Restaurant } from "@/constants/restaurants"

interface StoreSelectorProps {
  isOpen: boolean
  onClose: () => void
  restaurants: Restaurant[]
  isLoading?: boolean
}

const SearchIcon = () => (
  <svg
    className="flex-shrink-0"
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ boxSizing: "inherit", overflow: "hidden" }}
  >
    <path
      clipRule="evenodd"
      d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
      fill="currentColor"
      fillRule="evenodd"
      style={{ boxSizing: "inherit" }}
    />
  </svg>
)

export default function StoreSelector({ isOpen, onClose, restaurants, isLoading = false }: StoreSelectorProps) {
  const { currentStoreId, setCurrentStoreId } = useCurrentStore()
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentStore = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return null
    return restaurants.find(r => r.id === currentStoreId) || restaurants[0] || null
  }, [restaurants, currentStoreId])

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
    const parts = [store.street, store.city, store.state, store.zipCode].filter(Boolean)
    return parts.length > 0 ? `${parts.join(', ')}, ${store.country || 'USA'}` : ''
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
        className="fixed left-[16px] top-[88px] w-[400px] max-h-[calc(100vh-120px)] bg-white z-50 shadow-2xl rounded-lg flex flex-col border border-gray-200 overflow-hidden"
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2" style={{ font: 'inherit', boxSizing: 'inherit' }}>
            <div className="flex-shrink-0" style={{ color: 'var(--usage-color-icon-default, #606060)' }}>
              <SearchIcon />
            </div>
            <input
              type="search"
              placeholder="Search for a store"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 outline-none border-none bg-transparent text-sm"
              style={{
                font: "inherit",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
                lineHeight: "normal",
                appearance: "textfield",
                boxSizing: "content-box",
              }}
            />
          </div>
        </div>

        {/* Current Store Section */}
        <div className="p-4 flex-shrink-0">
          <div className="mb-2">
            <span 
              className="text-sm font-medium text-gray-900"
              style={{
                fontFamily: 'Inter, TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                letterSpacing: '-0.01px',
              }}
            >
              {currentStore?.name || 'No store selected'}
            </span>
          </div>
          
          <div className="mb-2" />
          
          {/* Add Store Button */}
          {/* <a
            href="/merchant/onboarding/choose-additional-store-or-business"
            className="block"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <button
              type="button"
              className="w-full rounded-full border bg-white text-gray-900 text-sm font-bold py-2.5 px-3 hover:bg-gray-50 transition-colors"
              style={{
                minHeight: '40px',
                boxShadow: 'inset 0 0 0 1px #d6d6d6',
                border: 'none',
                fontFamily: 'Inter, TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: '20px',
                letterSpacing: '-0.01px',
              }}
            >
              Add store or business
            </button>
          </a> */}
          
          <div className="my-4" />
          
          {/* Divider */}
          <hr 
            className="border-t h-px m-0 w-full" 
            style={{
              border: 'none',
              background: '#e7e7e7',
              height: '1px',
            }}
          />
        </div>

        {/* Your Stores Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <span 
                className="text-sm font-medium text-gray-600"
                style={{
                  fontFamily: 'Inter, TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '-0.01px',
                }}
              >
                Your stores
              </span>
            </div>
            
            {isLoading ? (
              <div className="text-sm text-gray-500 py-4">Loading stores...</div>
            ) : filteredStores.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">No stores found</div>
            ) : (
              <div className="space-y-2">
                {filteredStores.map((store) => {
                  const isSelected = currentStoreId === store.id
                  return (
                    <button
                      key={store.id}
                      onClick={() => {
                        setCurrentStoreId(store.id)
                        router.push(`/merchant/store/${store.id}`)
                        onClose()
                      }}
                      className="w-full text-left p-2 border-none bg-transparent cursor-pointer hover:bg-gray-50 transition-colors rounded"
                      style={{
                        font: "inherit",
                        outline: "none",
                        margin: "0px",
                        color: "inherit",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        fontFamily: "inherit",
                        overflow: "visible",
                        textTransform: "none",
                        appearance: "button",
                        userSelect: "none",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-1">
                          <img
                            height={12}
                            width={12}
                            alt="Store status"
                            src="/status-inactive-2.svg"
                            className="h-3 w-3"
                          />
                        </div>
                        
                        {/* Store Info */}
                        <div className="flex-1 min-w-0">
                          <div 
                            className="text-sm font-medium text-gray-900 mb-0.5"
                            style={{
                              fontFamily: 'Inter, TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '20px',
                              letterSpacing: '-0.01px',
                            }}
                          >
                            {store.name}
                          </div>
                          <div 
                            className="text-sm text-gray-600"
                            style={{
                              fontFamily: 'Inter, TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '20px',
                              letterSpacing: '-0.01px',
                            }}
                          >
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
