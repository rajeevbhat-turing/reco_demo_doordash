'use client'
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, Settings, Eye, Plus, ChevronDown, Star, X, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMerchantMenuStore } from "@/store/merchant-menu-store"
import ItemStatusDropdown from "@/components/merchant/ItemStatusDropdown"
import MenuSettingsDropdown from "@/components/merchant/MenuSettingsDropdown"
import RestaurantSelector from "@/components/merchant/RestaurantSelector"
import ItemEditorPanel from "@/components/merchant/ItemEditorPanel"
import { MenuItem } from "@/store/merchant-menu-store"
import { useMerchantPersistedState } from "@/lib/hooks/useMerchantPersistedState"
import { useMerchantMenu } from "@/lib/hooks/use-merchant-menu"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"
import { useEffect, useMemo, useState } from "react"

export default function MerchantMenuPage() {
  const [searchValue, setSearchValue] = useMerchantPersistedState('menu', 'filters', 'searchQuery', '')
  const [selectedFilter, setSelectedFilter] = useMerchantPersistedState('menu', 'filters', 'selectedFilter', 'All items')
  const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useMerchantPersistedState('menu', 'ui', 'isMenuSettingsOpen', false)
  const [selectedRestaurantId, setSelectedRestaurantId] = useMerchantPersistedState('menu', 'selector', 'selectedRestaurantId', 'philz-coffee')
  const [selectedItem, setSelectedItem] = useMerchantPersistedState<MenuItem | null>('menu', 'editor', 'selectedItem', null)
  const [isItemEditorOpen, setIsItemEditorOpen] = useMerchantPersistedState('menu', 'editor', 'isOpen', false)
  const [isMounted, setIsMounted] = useState(false)
  
  const { currentStoreId } = useCurrentStore()
  const { data: restaurants } = useAllRestaurants()
  
  // Find the current restaurant to get its numeric database ID
  const currentRestaurant = useMemo(() => {
    if (!restaurants || !currentStoreId) return null
    return restaurants.find(r => r.id === currentStoreId) || restaurants.find(r => 
      r.name.toLowerCase().replace(/\s+/g, '-') === currentStoreId.toLowerCase() ||
      r.name === currentStoreId
    )
  }, [restaurants, currentStoreId])
  
  const numericStoreId = currentRestaurant?.id || currentStoreId || null
  
  // Fetch menu items from database (only after mount to prevent hydration issues)
  const { categories: dbCategories, isLoading: isLoadingMenu } = useMerchantMenu(isMounted ? numericStoreId : null)
  
  const {
    categories: storeCategories,
    expandedCategories,
    showBanner,
    toggleCategory,
    setShowBanner,
    setCategories,
    updateItemStatus,
    updateItem,
    deleteItem
  } = useMerchantMenuStore()
  
  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Use database categories if available and mounted, otherwise fall back to store categories
  const categories = useMemo(() => {
    if (!isMounted) {
      return storeCategories // Use store categories during SSR/initial render
    }
    return dbCategories.length > 0 ? dbCategories : storeCategories
  }, [isMounted, dbCategories, storeCategories])
  
  // Update store when database categories change (only after mount)
  useEffect(() => {
    if (isMounted && dbCategories.length > 0) {
      setCategories(dbCategories)
    }
  }, [isMounted, dbCategories, setCategories])

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchValue.toLowerCase())
      const matchesFilter = selectedFilter === "All items" || 
        (selectedFilter === "In stock" && item.status === "In stock") ||
        (selectedFilter === "Out of stock" && item.status !== "In stock")
      return matchesSearch && matchesFilter
    })
  })).filter(category => category.items.length > 0 || searchValue === "")

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Manager</h1>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
            Overview
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Modifiers
          </button>
        </div>
      </div>

      {/* Information Banner */}
      {showBanner && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 relative">
          <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3">
              Help us get your pickup times right by reviewing suggested prep times. We've automatically set prep times for your items. Confirm that they're correct and make any edits to help ensure Dashers arrive at the right time.
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Review prep times
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="mb-6">
        {/* Top Row - Restaurant Selector and Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <RestaurantSelector 
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurant={setSelectedRestaurantId}
          />
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsMenuSettingsOpen(!isMenuSettingsOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Menu Settings
              </button>
              <MenuSettingsDropdown 
                isOpen={isMenuSettingsOpen}
                onClose={() => setIsMenuSettingsOpen(false)}
              />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Preview Menu
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Bottom Row - Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for an item"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
          >
            <option>All items</option>
            <option>In stock</option>
            <option>Out of stock</option>
          </select>
        </div>
      </div>

      {/* Menu Categories */}
      {isLoadingMenu && isMounted ? (
        <div className="text-center py-8 text-gray-500">Loading menu...</div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            const itemCount = category.items.length

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">
                    Available Category - {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                />
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left font-medium px-4 py-3 text-gray-700 w-16"></th>
                        <th className="text-left font-medium px-4 py-3 text-gray-700">Item Name</th>
                        <th className="text-left font-medium px-4 py-3 text-gray-700">Pickup price</th>
                        <th className="text-left font-medium px-4 py-3 text-gray-700">Delivery price</th>
                        <th className="text-left font-medium px-4 py-3 text-gray-700">Item status</th>
                        <th className="w-12"></th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="w-12 h-12 rounded-md bg-gray-200 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.jpg"
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-gray-600">{item.pickupPrice}</td>
                            <td className="px-4 py-3 text-gray-600">{item.deliveryPrice}</td>
                            <td className="px-4 py-3">
                              <ItemStatusDropdown
                                currentStatus={item.status}
                                onStatusChange={(status) => updateItemStatus(item.id, status)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => {
                                  setSelectedItem(item)
                                  setIsItemEditorOpen(true)
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Add Item Button */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        </div>
      )}

      {/* Item Editor Panel */}
      <ItemEditorPanel
        item={selectedItem}
        isOpen={isItemEditorOpen}
        onClose={() => {
          setIsItemEditorOpen(false)
          setSelectedItem(null)
        }}
        onUpdate={(itemId, updates) => {
          updateItem(itemId, updates)
        }}
      />
    </MerchantLayout>
  )
}

