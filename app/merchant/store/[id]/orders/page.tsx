'use client'
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMerchantPersistedState } from "@/lib/hooks/useMerchantPersistedState"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useMerchantOrdersStore } from "@/store/merchant-orders-store"
import { useMerchantOrders } from "@/lib/hooks/use-merchant-orders"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"

interface Order {
  customer: string
  orderId: string
  orderStatus: "Active" | "Scheduled" | "Completed" | "Cancelled - Not Paid"
  date: string
  time: string
  fulfillmentStatus: string
  fulfillmentType: "Customer pickup" | "DashDoor delivery"
  channel: string
  subtotal: string
}

function FilterBar({ searchValue, onSearchChange }: { searchValue: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <select className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700">
          <option>All channels</option>
          <option>DashDoor</option>
          <option>Pickup</option>
        </select>
        <select className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
        <select className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700">
          <option>Order status</option>
          <option>Completed</option>
          <option>Cancelled - Not Paid</option>
        </select>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search orders"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-3 py-1.5 w-64 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  )
}

/**
 * Route: /merchant/store/[id]/orders
 * 
 * Orders page for a specific store - displays all orders for that store
 * Gets store ID from URL params and ensures orders are filtered correctly
 */
export default function MerchantStoreOrdersPage() {
  const params = useParams()
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore()
  const { data: restaurants, isLoading } = useAllRestaurants()
  const { searchQuery, selectedFilter, activeTab, setSearchQuery, setSelectedFilter, setActiveTab } = useMerchantOrdersStore()
  const [searchValue, setSearchValue] = useState(searchQuery)
  const [lastUpdated, setLastUpdated] = useState(3)
  const [storeSet, setStoreSet] = useState(false)

  const storeIdParam = params.id as string

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet) return

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants.find(r => r.id === storeIdParam)
    
    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
        r.name === storeIdParam
      )
    }

    if (restaurant) {
      // Only set if it's different from current store ID to avoid unnecessary updates
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id)
        console.log(`✅ Set merchant store to: ${restaurant.name} (ID: ${restaurant.id})`)
      }
      // Set merchant mode flag in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true')
      }
      setStoreSet(true)
    } else {
      console.warn(`Store not found: ${storeIdParam}, using default`)
      // If store not found, set to default store (ID 1)
      if (contextStoreId !== '1') {
        setCurrentStoreId('1')
      }
      setStoreSet(true)
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet])

  // Find the current restaurant directly from URL param - this is the source of truth
  const currentRestaurant = useMemo(() => {
    if (!restaurants || isLoading) return null
    
    // Try to find restaurant by numeric ID first
    let restaurant = restaurants.find(r => r.id === storeIdParam)
    
    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
        r.name === storeIdParam
      )
    }
    
    return restaurant
  }, [restaurants, storeIdParam, isLoading])

  // Use restaurant.id which is the numeric database ID as string (e.g., "56")
  // Fallback to storeIdParam if restaurant not found yet
  const numericStoreId = currentRestaurant?.id || storeIdParam || null

  // Fetch orders from API for current store using numeric ID
  const { data: apiOrders = [], isLoading: isLoadingOrders } = useMerchantOrders(numericStoreId)

  // Transform API orders to merchant order format
  const orders = useMemo(() => {
    const now = new Date()
    
    return apiOrders.map((order: any) => {
      // Parse order date - handle both ISO string and formatted string
      let orderDate: Date
      try {
        if (order.orderDate && order.orderDate.includes(',')) {
          // Already formatted date, try to parse it
          orderDate = new Date(order.orderDate)
        } else if (order.orderDate) {
          // ISO string
          orderDate = new Date(order.orderDate)
        } else {
          orderDate = new Date()
        }
      } catch {
        orderDate = new Date()
      }

      // Check if order is in the past
      const isPastOrder = orderDate < now

      // Check if there's a scheduled date in the future
      let scheduledDate: Date | null = null
      if (order.deliveryOption?.scheduledDate) {
        try {
          scheduledDate = new Date(order.deliveryOption.scheduledDate)
        } catch {
          scheduledDate = null
        }
      }
      const isFutureScheduled = scheduledDate && scheduledDate > now

      // Determine order status based on database status and date
      // Priority: Past orders always go to History, unless explicitly future scheduled
      let orderStatus: "Active" | "Scheduled" | "Completed" | "Cancelled - Not Paid"
      
      if (order.status === 'Completed') {
        orderStatus = 'Completed'
      } else if (order.status === 'Cancelled') {
        orderStatus = 'Cancelled - Not Paid'
      } else if (isPastOrder && !isFutureScheduled) {
        // Past orders (regardless of status) should be in History
        // Exception: if there's a future scheduled date, it stays Scheduled
        orderStatus = 'Completed'
      } else if (order.status === 'Confirmed') {
        // Current/future confirmed orders are Active
        orderStatus = 'Active'
      } else if (isFutureScheduled) {
        // Future scheduled orders
        orderStatus = 'Scheduled'
      } else {
        // Default: if not in past and no explicit status, treat as Scheduled
        // But this should rarely happen
        orderStatus = 'Scheduled'
      }

      // Get customer name - prioritize user name, then business name, then address
      const customerName = order.userName || 
                          order.deliveryAddress?.businessName || 
                          order.deliveryAddress?.street || 
                          'Customer'

      return {
        customer: customerName,
        orderId: `DD-${order.id}`,
        orderStatus,
        date: orderDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        time: orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        fulfillmentStatus: order.status,
        fulfillmentType: order.deliveryOption?.type === 'pickup' ? 'Customer pickup' : 'DashDoor delivery',
        channel: 'DashDoor',
        subtotal: `$${((order.subtotal || 0) / 100).toFixed(2)}`, // Convert from cents to dollars
        rawOrderDate: orderDate, // Keep for sorting/filtering
      }
    })
  }, [apiOrders])

  // Sync search value with store
  useEffect(() => {
    setSearchQuery(searchValue)
  }, [searchValue, setSearchQuery])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((prev) => (prev >= 60 ? 1 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLastUpdated(0)
    // Force refetch orders
    window.location.reload()
  }

  // Filter orders based on active tab and search
  const filteredOrders = useMemo(() => {
    const now = new Date()
    
    return orders.filter(order => {
      // Tab filtering logic:
      // - "Active": Show orders with status 'Active' (current Confirmed orders)
      // - "Scheduled": Show orders with status 'Scheduled' (future scheduled orders)
      // - "History": Show all past/completed orders (Completed, Cancelled, past orders)
      let matchesTab = false
      
      if (activeTab === "History") {
        // History shows:
        // - Completed orders
        // - Cancelled orders
        // - Past orders (regardless of status, if they're in the past)
        const isPastOrder = order.rawOrderDate && order.rawOrderDate < now
        matchesTab = order.orderStatus === "Completed" || 
                     order.orderStatus === "Cancelled - Not Paid" ||
                     (isPastOrder && order.orderStatus !== "Active" && order.orderStatus !== "Scheduled")
      } else if (activeTab === "Active") {
        // Active shows current Confirmed orders (not in the past)
        const isPastOrder = order.rawOrderDate && order.rawOrderDate < now
        matchesTab = order.orderStatus === "Active" && !isPastOrder
      } else if (activeTab === "Scheduled") {
        // Scheduled shows only future scheduled orders
        const isPastOrder = order.rawOrderDate && order.rawOrderDate < now
        matchesTab = order.orderStatus === "Scheduled" && !isPastOrder
      }

      // Search filtering
      const matchesSearch = searchValue === "" ||
        order.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchValue.toLowerCase())
      
      return matchesTab && matchesSearch
    })
  }, [orders, activeTab, searchValue])

  // Show loading state while finding store
  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </MerchantLayout>
    )
  }

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
            <p className="text-sm text-gray-600">
              Track all your orders from every channel in real-time. For even more transaction details, go to{" "}
              <a href="#" className="text-blue-600 hover:underline">Transactions</a>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Last updated {lastUpdated} seconds ago</span>
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium transition-colors">
              Request a Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("Active")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Active"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Active
        </button>
        <button 
          onClick={() => setActiveTab("Scheduled")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Scheduled"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Scheduled
        </button>
        <button 
          onClick={() => setActiveTab("History")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "History"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          History
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-4">
        <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} />
      </div>

      {/* Table */}
      {isLoadingOrders ? (
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg bg-white mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Customer</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Order ID</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Order status</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Date</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Time</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Fulfillment status</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Fulfillment type</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Channel</th>
                <th className="text-right font-medium px-4 py-3 text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No orders found for this tab
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{order.customer}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          order.orderStatus === "Completed" ? "bg-gray-900" : 
                          order.orderStatus === "Active" ? "bg-green-500" :
                          order.orderStatus === "Scheduled" ? "bg-blue-500" :
                          "bg-red-500"
                        }`} />
                        <span className={order.orderStatus === "Cancelled - Not Paid" ? "text-red-600" : "text-gray-700"}>
                          {order.orderStatus}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.date}</td>
                    <td className="px-4 py-3 text-gray-600">{order.time}</td>
                    <td className="px-4 py-3 text-gray-600">{order.fulfillmentStatus || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{order.fulfillmentType}</td>
                    <td className="px-4 py-3 text-gray-600">{order.channel}</td>
                    <td className="px-4 py-3 text-right font-medium">{order.subtotal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select className="border border-gray-300 rounded px-2 py-1 bg-white">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span>Showing 1-{filteredOrders.length} of {filteredOrders.length}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2">Page 1 of 1</span>
            <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
            <select className="ml-2 border border-gray-300 rounded px-2 py-1 bg-white">
              <option>1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
        Keep all your orders in one place.{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Contact Us
        </a>{" "}
        to consolidate your Drive and Marketplace orders.
      </div>
    </MerchantLayout>
  )
}

