'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, Settings, Eye, Plus, ChevronDown, Star, X, Pencil, Trash2, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MenuItem {
  id: string
  name: string
  image: string
  pickupPrice: string
  deliveryPrice: string
  status: "In stock" | "Out of stock"
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

const menuCategories: MenuCategory[] = [
  {
    id: "paninis",
    name: "Paninis",
    items: [
      {
        id: "1",
        name: "Build Your Own Panini",
        image: "/placeholder.jpg",
        pickupPrice: "$15.00",
        deliveryPrice: "$15.00",
        status: "In stock"
      },
      {
        id: "2",
        name: "Peppe Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$18.00",
        deliveryPrice: "$18.00",
        status: "In stock"
      },
      {
        id: "3",
        name: "Meatball Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$17.00",
        deliveryPrice: "$17.00",
        status: "In stock"
      },
      {
        id: "4",
        name: "Olga Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$19.00",
        deliveryPrice: "$19.00",
        status: "In stock"
      },
      {
        id: "5",
        name: "Spicy Salame Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$18.00",
        deliveryPrice: "$18.00",
        status: "In stock"
      },
      {
        id: "6",
        name: "Burrata Sandwich",
        image: "/placeholder.jpg",
        pickupPrice: "$17.00",
        deliveryPrice: "$17.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "entrees",
    name: "Entrées",
    items: [
      {
        id: "7",
        name: "Chicken Parmesan",
        image: "/placeholder.jpg",
        pickupPrice: "$22.00",
        deliveryPrice: "$22.00",
        status: "In stock"
      },
      {
        id: "8",
        name: "Lasagna",
        image: "/placeholder.jpg",
        pickupPrice: "$20.00",
        deliveryPrice: "$20.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "croissant",
    name: "Limited Edition Filled Croissant",
    items: [
      {
        id: "9",
        name: "Chocolate Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$6.00",
        deliveryPrice: "$6.00",
        status: "In stock"
      },
      {
        id: "10",
        name: "Almond Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$6.50",
        deliveryPrice: "$6.50",
        status: "In stock"
      },
      {
        id: "11",
        name: "Ham & Cheese Croissant",
        image: "/placeholder.jpg",
        pickupPrice: "$7.00",
        deliveryPrice: "$7.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      {
        id: "12",
        name: "French Fries",
        image: "/placeholder.jpg",
        pickupPrice: "$5.00",
        deliveryPrice: "$5.00",
        status: "In stock"
      },
      {
        id: "13",
        name: "Side Salad",
        image: "/placeholder.jpg",
        pickupPrice: "$6.00",
        deliveryPrice: "$6.00",
        status: "In stock"
      },
      {
        id: "14",
        name: "Soup of the Day",
        image: "/placeholder.jpg",
        pickupPrice: "$7.00",
        deliveryPrice: "$7.00",
        status: "In stock"
      },
      {
        id: "15",
        name: "Garlic Bread",
        image: "/placeholder.jpg",
        pickupPrice: "$4.00",
        deliveryPrice: "$4.00",
        status: "In stock"
      },
      {
        id: "16",
        name: "Mozzarella Sticks",
        image: "/placeholder.jpg",
        pickupPrice: "$8.00",
        deliveryPrice: "$8.00",
        status: "In stock"
      }
    ]
  },
  {
    id: "beverages",
    name: "Beverages",
    items: Array.from({ length: 28 }, (_, i) => ({
      id: `bev-${i + 1}`,
      name: `Beverage ${i + 1}`,
      image: "/placeholder.jpg",
      pickupPrice: "$3.00",
      deliveryPrice: "$3.00",
      status: "In stock" as const
    }))
  }
]

export default function MerchantMenuPage() {
  const [searchValue, setSearchValue] = useState("")
  const [showBanner, setShowBanner] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["paninis"]))
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("All Day")
  const [selectedFilter, setSelectedFilter] = useState("All items")

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredCategories = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    )
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
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">All Day</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
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
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Settings className="h-4 w-4" />
            Menu Settings
          </button>
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

      {/* Menu Categories */}
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
                            <div className="inline-flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-700">{item.status}</span>
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button className="p-1.5 text-gray-400 hover:text-red-600 rounded">
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
    </MerchantLayout>
  )
}

