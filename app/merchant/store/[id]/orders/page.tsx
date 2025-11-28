'use client'
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMerchantPersistedState } from "@/lib/hooks/useMerchantPersistedState"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useMerchantOrdersStore } from "@/store/merchant-orders-store"
import { useOrdersStore } from "@/store/orders-store"
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
  rawOrderDate?: Date
  orderCreatedAt?: Date
  minutesElapsed?: number
  secondsElapsed?: number
  totalSecondsElapsed?: number
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
  // Force re-render every second to update order statuses and timers
  const [currentTime, setCurrentTime] = useState(new Date())

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

  console.log(`🔍 Store lookup: URL param="${storeIdParam}", Found restaurant="${currentRestaurant?.name}", Numeric ID="${numericStoreId}"`)

  // Get orders from localStorage (orders-store) instead of API
  const { orders: storeOrders } = useOrdersStore()
  
  // Filter orders for current store from localStorage
  const apiOrders = useMemo(() => {
    if (!numericStoreId) return []
    
    const filtered = storeOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId
      return String(orderStoreId) === String(numericStoreId)
    })
    
    console.log(`📦 Found ${filtered.length} orders in localStorage for store ${numericStoreId} (out of ${storeOrders.length} total orders)`)
    return filtered
  }, [storeOrders, numericStoreId])
  
  const isLoadingOrders = false // No loading since we're using localStorage

  // Calculate order status progression based on time elapsed
  const calculateOrderStatus = (orderCreatedAt: Date, currentTime: Date) => {
    const totalSecondsElapsed = Math.floor((currentTime.getTime() - orderCreatedAt.getTime()) / 1000)
    const minutesElapsed = Math.floor(totalSecondsElapsed / 60)
    const secondsElapsed = totalSecondsElapsed % 60
    
    // Status progression over 30 minutes:
    // 0-2 min: pending (needs action)
    // 2-8 min: confirmed (in progress)
    // 8-15 min: preparing (in progress)
    // 15-20 min: ready (ready for pickup)
    // 20-25 min: picked_up (scheduled)
    // 25-30 min: on_the_way (scheduled)
    // 30+ min: delivered (completed)
    
    if (minutesElapsed >= 30) {
      return { fulfillmentStatus: 'delivered', orderStatus: 'Completed' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else if (minutesElapsed >= 25) {
      return { fulfillmentStatus: 'on_the_way', orderStatus: 'Scheduled' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else if (minutesElapsed >= 20) {
      return { fulfillmentStatus: 'picked_up', orderStatus: 'Scheduled' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else if (minutesElapsed >= 15) {
      return { fulfillmentStatus: 'ready', orderStatus: 'Active' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else if (minutesElapsed >= 8) {
      return { fulfillmentStatus: 'preparing', orderStatus: 'Active' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else if (minutesElapsed >= 2) {
      return { fulfillmentStatus: 'confirmed', orderStatus: 'Active' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    } else {
      return { fulfillmentStatus: 'pending', orderStatus: 'Active' as const, minutesElapsed, secondsElapsed, totalSecondsElapsed }
    }
  }
  
  // Get color for fulfillment status
  const getFulfillmentStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('needs action') || statusLower === 'pending') {
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' }
    } else if (statusLower.includes('in progress') || statusLower === 'confirmed' || statusLower === 'preparing') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' }
    } else if (statusLower.includes('ready for pickup') || statusLower === 'ready') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' }
    } else if (statusLower.includes('picked up') || statusLower === 'picked_up') {
      return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' }
    } else if (statusLower.includes('on the way') || statusLower === 'on_the_way') {
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-500' }
    } else if (statusLower.includes('delivered') || statusLower === 'delivered') {
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' }
    } else if (statusLower.includes('cancelled')) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-500' }
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-500' }
  }

  // Transform API orders to merchant order format
  const orders = useMemo(() => {
    const now = currentTime
    
    console.log(`📦 Processing ${apiOrders.length} orders for store ${numericStoreId}`)
    if (apiOrders.length > 0) {
      console.log('📋 Orders:', apiOrders.map((o: any) => ({ 
        id: o.id, 
        status: o.status, 
        orderDate: o.orderDate,
        storeId: o.storeId,
        userId: o.userId,
        userName: o.userName
      })))
    }
    
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

      // Check if order is in the past (more than 30 minutes old)
      // Handle case where orderDate might be slightly in the future due to timezone issues
      const minutesSinceOrder = Math.max(0, Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60)))
      const isPastOrder = minutesSinceOrder >= 30

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
      let orderStatus: "Active" | "Scheduled" | "Completed" | "Cancelled - Not Paid"
      let fulfillmentStatus: string
      let minutesElapsed: number | undefined
      let secondsElapsed: number | undefined
      let totalSecondsElapsed: number | undefined

      // Check if order is cancelled first
      if (order.status === 'Cancelled' || order.status === 'cancelled') {
        orderStatus = 'Cancelled - Not Paid'
        fulfillmentStatus = 'cancelled'
      } 
      // Check if order is explicitly completed/delivered
      else if (order.status === 'Completed' || order.status === 'delivered') {
        orderStatus = 'Completed'
        fulfillmentStatus = 'delivered'
      } 
      // Check if order is older than 30 minutes (auto-complete)
      else if (isPastOrder && !isFutureScheduled) {
        orderStatus = 'Completed'
        fulfillmentStatus = 'delivered'
      } 
      // Check if order is scheduled for future
      else if (isFutureScheduled) {
        orderStatus = 'Scheduled'
        fulfillmentStatus = order.status || 'pending'
      } 
      // All other orders (pending, confirmed, preparing, etc.) are Active
      else {
        // Active orders - calculate status based on time elapsed
        const statusInfo = calculateOrderStatus(orderDate, now)
        orderStatus = statusInfo.orderStatus
        fulfillmentStatus = statusInfo.fulfillmentStatus
        minutesElapsed = statusInfo.minutesElapsed
        secondsElapsed = statusInfo.secondsElapsed
        totalSecondsElapsed = statusInfo.totalSecondsElapsed
      }

      // Get customer name - prioritize user name, then business name, then address
      const customerName = order.userName || 
                          order.deliveryAddress?.businessName || 
                          order.deliveryAddress?.street || 
                          'Customer'

      // Format fulfillment status for display
      const formatFulfillmentStatus = (status: string) => {
        const statusMap: Record<string, string> = {
          'pending': 'Needs action',
          'confirmed': 'In progress',
          'preparing': 'In progress',
          'ready': 'Ready for pickup',
          'picked_up': 'Picked up',
          'on_the_way': 'On the way',
          'delivered': 'Delivered',
          'cancelled': 'Cancelled',
        }
        return statusMap[status.toLowerCase()] || status
      }

      return {
        customer: customerName,
        orderId: order.orderId || `DD-${order.id}`, // Use orderId if exists, otherwise format
        orderStatus,
        date: orderDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        time: orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        fulfillmentStatus: formatFulfillmentStatus(fulfillmentStatus),
        fulfillmentType: order.deliveryOption?.type === 'pickup' ? 'Customer pickup' : 'DashDoor delivery',
        channel: 'DashDoor',
        subtotal: (() => {
          // Handle subtotal - could be in cents (from DB) or dollars (from localStorage)
          let subtotalValue = order.subtotal || order.total || 0
          if (typeof subtotalValue === 'number' && subtotalValue > 1000) {
            // Likely in cents, convert to dollars
            subtotalValue = subtotalValue / 100
          }
          return `$${subtotalValue.toFixed(2)}`
        })(),
        rawOrderDate: orderDate, // Keep for sorting/filtering
        orderCreatedAt: orderDate,
        minutesElapsed,
        secondsElapsed,
        totalSecondsElapsed,
      }
    }).map(order => {
      // Debug logging for new orders
      if (order.minutesElapsed !== undefined && order.minutesElapsed < 5) {
        console.log(`🆕 New order found: ${order.orderId}, Status: ${order.orderStatus}, Fulfillment: ${order.fulfillmentStatus}, Minutes: ${order.minutesElapsed}`)
      }
      return order
    })
  }, [apiOrders, currentTime, numericStoreId])

  // Sync search value with store
  useEffect(() => {
    setSearchQuery(searchValue)
  }, [searchValue, setSearchQuery])

  // Update current time every second to trigger order status recalculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setLastUpdated((prev) => (prev >= 60 ? 1 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLastUpdated(0)
    setCurrentTime(new Date())
    // Force refetch orders
    window.location.reload()
  }

  // Auto-switch to Active tab when new orders arrive
  useEffect(() => {
    const activeOrders = orders.filter(order => {
      const minutesSinceOrder = order.rawOrderDate ? Math.floor((currentTime.getTime() - order.rawOrderDate.getTime()) / (1000 * 60)) : 0
      return order.orderStatus === "Active" && minutesSinceOrder < 30
    })
    
    // If we have active orders and we're not on Active tab, switch to it
    if (activeOrders.length > 0 && activeTab !== "Active") {
      // Only auto-switch if user hasn't manually selected a tab recently (within last 10 seconds)
      const lastTabChange = sessionStorage.getItem('lastTabChange')
      const now = Date.now()
      if (!lastTabChange || (now - parseInt(lastTabChange)) > 10000) {
        setActiveTab("Active")
      }
    }
  }, [orders, currentTime, activeTab, setActiveTab])

  // Set default tab to Active if there are active orders
  useEffect(() => {
    if (orders.length > 0) {
      const activeOrders = orders.filter(order => {
        const minutesSinceOrder = order.rawOrderDate ? Math.floor((currentTime.getTime() - order.rawOrderDate.getTime()) / (1000 * 60)) : 0
        return order.orderStatus === "Active" && minutesSinceOrder < 30
      })
      
      console.log(`🔍 Found ${activeOrders.length} active orders out of ${orders.length} total`)
      
      if (activeOrders.length > 0) {
        const lastTabChange = sessionStorage.getItem('lastTabChange')
        const now = Date.now()
        // Auto-switch to Active tab if:
        // 1. User hasn't manually changed tabs in last 10 seconds, OR
        // 2. Currently on History tab (default) and no manual change recorded
        if (!lastTabChange || (now - parseInt(lastTabChange)) > 10000 || activeTab === "History") {
          if (activeTab !== "Active") {
            console.log(`🔄 Auto-switching to Active tab (${activeOrders.length} active orders)`)
            setActiveTab("Active")
          }
        }
      }
    }
  }, [orders, currentTime, activeTab, setActiveTab])

  // Filter orders based on active tab and search
  const filteredOrders = useMemo(() => {
    const now = currentTime
    
    return orders.filter(order => {
      // Tab filtering logic:
      // - "Active": Show orders with status 'Active' (pending, confirmed, preparing, ready)
      // - "Scheduled": Show orders with status 'Scheduled' (picked_up, on_the_way)
      // - "History": Show all past/completed orders (Completed, Cancelled, past orders)
      let matchesTab = false
      
      if (activeTab === "History") {
        // History shows:
        // - Completed orders
        // - Cancelled orders
        // - Orders older than 30 minutes
        const minutesSinceOrder = order.rawOrderDate ? Math.floor((now.getTime() - order.rawOrderDate.getTime()) / (1000 * 60)) : 0
        const isPastOrder = minutesSinceOrder >= 30
        matchesTab = order.orderStatus === "Completed" || 
                     order.orderStatus === "Cancelled - Not Paid" ||
                     isPastOrder
      } else if (activeTab === "Active") {
        // Active shows current orders with status Active (less than 30 minutes old)
        const minutesSinceOrder = order.rawOrderDate ? Math.floor((now.getTime() - order.rawOrderDate.getTime()) / (1000 * 60)) : 0
        matchesTab = order.orderStatus === "Active" && minutesSinceOrder < 30
      } else if (activeTab === "Scheduled") {
        // Scheduled shows orders with status Scheduled (picked_up, on_the_way)
        const minutesSinceOrder = order.rawOrderDate ? Math.floor((now.getTime() - order.rawOrderDate.getTime()) / (1000 * 60)) : 0
        matchesTab = order.orderStatus === "Scheduled" && minutesSinceOrder < 30
      }

      // Search filtering
      const matchesSearch = searchValue === "" ||
        order.customer.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchValue.toLowerCase())
      
      return matchesTab && matchesSearch
    })
  }, [orders, activeTab, searchValue, currentTime])

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
          onClick={() => {
            setActiveTab("Active")
            sessionStorage.setItem('lastTabChange', Date.now().toString())
          }}
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === "Active"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Active
          {orders.filter(order => {
            const isPastOrder = order.rawOrderDate && order.rawOrderDate < currentTime
            return order.orderStatus === "Active" && !isPastOrder
          }).length > 0 && activeTab !== "Active" && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
          )}
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
                    <td className="px-4 py-3">
                      {(() => {
                        const statusColors = getFulfillmentStatusColor(order.fulfillmentStatus)
                        const progressPercent = order.totalSecondsElapsed !== undefined 
                          ? Math.min((order.totalSecondsElapsed / (30 * 60)) * 100, 100)
                          : 0
                        
                        return (
                          <div className="flex flex-col gap-2">
                            {/* Status badge with color */}
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                              {order.fulfillmentStatus || "-"}
                            </span>
                            
                            {/* Progress bar with seconds */}
                            {order.totalSecondsElapsed !== undefined && order.orderStatus === "Active" && (
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${
                                      progressPercent >= 75 ? 'bg-orange-500' : 
                                      progressPercent >= 50 ? 'bg-yellow-500' : 
                                      'bg-blue-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 font-medium min-w-[70px]">
                                  {order.minutesElapsed !== undefined && order.secondsElapsed !== undefined
                                    ? `${order.minutesElapsed}m ${order.secondsElapsed}s / 30m`
                                    : `${order.minutesElapsed || 0}m / 30m`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </td>
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

