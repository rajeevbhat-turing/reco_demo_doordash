'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ArrowRight, Lightbulb, Megaphone, TrendingUp, ChevronRight, Star } from "lucide-react"
import SalesChart from "@/components/merchant/SalesChart"
import { useStoreApprovedReviews } from "@/lib/hooks/use-reviews"
import { useCurrentStore } from '@/lib/hooks/useCurrentStore'
import { useMerchantHomeStore } from "@/store/merchant-home-store"
import { useMerchantMetrics } from "@/lib/hooks/use-merchant-metrics"
import { useMerchantOperations } from "@/lib/hooks/use-merchant-operations"
import { useMerchantCustomers } from "@/lib/hooks/use-merchant-customers"
import { useOrdersStore } from "@/store/orders-store"
import { useAllRestaurants } from '@/lib/hooks/use-restaurants'
import { useUserStore } from '@/store/user-store'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}

function InsightCard({ title, body, cta, category }: { title: string; body: string; cta: string; category: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">{category}</div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-gray-600 mb-3">{body}</div>
        <button className="inline-flex items-center rounded-full bg-gray-900 text-white text-xs px-3 py-1.5">{cta}</button>
      </div>
      <div className="text-gray-300">
        <Lightbulb className="h-12 w-12" />
      </div>
    </div>
  )
}

function OperationsReviewCard() {
  const [mounted, setMounted] = useState(false)
  const { currentStoreId } = useCurrentStore()
  const { data: restaurants } = useAllRestaurants()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the current restaurant - restaurant.id is already numeric ID as string (e.g., "24")
  const currentRestaurant = useMemo(() => {
    if (!restaurants || !currentStoreId) return null
    // Try to find by ID first (numeric ID as string)
    let restaurant = restaurants.find(r => r.id === currentStoreId)
    // If not found, might be a slug from merchant-store-data, try to find by name
    if (!restaurant) {
      restaurant = restaurants.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '-') === currentStoreId.toLowerCase() ||
        r.name === currentStoreId
      )
    }
    return restaurant
  }, [restaurants, currentStoreId])

  // Use restaurant.id which is the numeric database ID as string (e.g., "24")
  // This matches what the reviews API expects (store_id INTEGER in database)
  const numericStoreId = currentRestaurant?.id || currentStoreId || ''

  // Fetch approved reviews for the current store using numeric ID
  const storeReviews = useStoreApprovedReviews(numericStoreId)
  
  // Get all reviews from the current store
  const allReviews = useMemo(() => {
    return storeReviews.data || []
  }, [storeReviews.data])

  // Get recent reviews that need responses (within 7 days, or show recent ones if none are that recent)
  const recentReviews = useMemo(() => {
    const now = new Date()
    
    // First try to get reviews within 7 days
    const reviewsWithin7Days = allReviews
      .filter(review => {
        const reviewDate = new Date(review.timestamp)
        const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceReview <= 7 && review.rating >= 4
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
    
    // If we have reviews within 7 days, use those
    if (reviewsWithin7Days.length > 0) {
      return reviewsWithin7Days
    }
    
    // Otherwise, show the 3 most recent 4+ star reviews (even if older)
    return allReviews
      .filter(review => review.rating >= 4)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
  }, [allReviews])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  const getDaysToRespond = (timestamp: string) => {
    const now = new Date()
    const reviewDate = new Date(timestamp)
    const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysLeft = 7 - daysSinceReview
    
    // If review is older than 7 days, show 0 days left (expired)
    if (daysLeft <= 0) {
      return 0
    }
    
    return daysLeft
  }

  // Prevent hydration mismatch - only render after mount
  if (!mounted || recentReviews.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Operations</div>
        <div className="font-semibold text-base">Respond to customer reviews to increase visits before it's too late</div>
      </div>
      <div className="space-y-3">
        {recentReviews.map((review) => {
          const daysLeft = getDaysToRespond(review.timestamp)
          return (
            <div
              key={review.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-1">{review.userName}</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.timestamp)} {daysLeft > 0 ? `• ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to respond` : '• Response expired'}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Route: /merchant/store/[id]
 * 
 * Merchant home page for a specific store - renders the dashboard
 * URL stays as /merchant/store/[id] (no redirect)
 */
export default function MerchantStorePage() {
  const params = useParams()
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore()
  const { data: restaurants, isLoading } = useAllRestaurants()
  const { metrics: storedMetrics, setMetrics } = useMerchantHomeStore()
  const [activeFilter, setActiveFilter] = useState("All")
  const [storeSet, setStoreSet] = useState(false)
  const [salesPeriod, setSalesPeriod] = useState<"This month" | "Last month" | "This year">("This month")
  
  // Get current user for displaying name
  const currentUser = useUserStore(state => state.currentUser)
  
  // Format user name: FirstName L. (first name + first letter of last name)
  const userDisplayName = useMemo(() => {
    if (!currentUser?.name) return 'User'
    const nameParts = currentUser.name.trim().split(/\s+/)
    if (nameParts.length === 1) return nameParts[0]
    const firstName = nameParts[0]
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }, [currentUser?.name])

  const storeIdParam = params.id as string

  // Set the store ID when component mounts or storeIdParam changes
  // This must happen synchronously to ensure the correct store is displayed
  useEffect(() => {
    if (isLoading || !restaurants || storeSet) return

    // Try to find restaurant by numeric ID first (storeIdParam is string, restaurant.id is also string)
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
        // Set the current store ID (numeric ID as string, e.g., "56")
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

  // Find the restaurant directly from URL param - this is the source of truth
  const currentRestaurant = useMemo(() => {
    if (!restaurants || isLoading) return null
    
    // Try to find restaurant by numeric ID first (storeIdParam is string, restaurant.id is also string)
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

  // Get orders from localStorage instead of API
  const { orders: allOrders = [] } = useOrdersStore()
  
  // Filter orders for this store
  const orders = useMemo(() => {
    if (!numericStoreId) return [];
    return allOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId;
      return String(orderStoreId) === String(numericStoreId);
    });
  }, [allOrders, numericStoreId])

  // Calculate "Today's overview" metrics from today's orders
  const todayMetrics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
      }
    }

    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    // Filter orders for today
    const todayOrders = orders.filter((order: any) => {
      const orderDate = order.orderDate ? new Date(order.orderDate) : null
      if (!orderDate) return false
      return orderDate >= todayStart && orderDate <= todayEnd
    })

    // Calculate today's metrics
    const totalSales = todayOrders.reduce((sum: number, order: any) => {
      const total = order.total || order.subtotal || 0
      // Handle both cents and dollars
      return sum + (total > 1000 ? total / 100 : total)
    }, 0)

    const totalOrders = todayOrders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
    }
  }, [orders])

  // Use today's metrics for display
  const metrics = todayMetrics

  // Calculate sales data for the chart based on selected period
  const salesData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return Array(14).fill(0) // Return array of zeros if no orders
    }

    const now = new Date()
    let startDate: Date
    let daysInPeriod: number

    switch (salesPeriod) {
      case "This month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        daysInPeriod = now.getDate()
        break
      case "Last month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        startDate = lastMonth
        daysInPeriod = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
        break
      case "This year":
        startDate = new Date(now.getFullYear(), 0, 1)
        daysInPeriod = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        daysInPeriod = now.getDate()
    }

    // Group orders by date and calculate daily sales
    const dailySales = new Map<string, number>()
    
    orders.forEach((order: any) => {
      const orderDate = new Date(order.orderDate)
      // For "Last month", filter orders within that month
      if (salesPeriod === "Last month") {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        if (orderDate >= lastMonthStart && orderDate <= lastMonthEnd) {
          const dateKey = orderDate.toISOString().split('T')[0]
          dailySales.set(dateKey, (dailySales.get(dateKey) || 0) + (order.total || 0))
        }
      } else if (orderDate >= startDate && orderDate <= now) {
        const dateKey = orderDate.toISOString().split('T')[0]
        dailySales.set(dateKey, (dailySales.get(dateKey) || 0) + (order.total || 0))
      }
    })

    // Create array of sales data (14 data points)
    const dataPoints = 14
    const data: number[] = []
    
    // For "This year", use monthly aggregation
    if (salesPeriod === "This year") {
      const monthlySales = new Map<number, number>()
      dailySales.forEach((sales, dateKey) => {
        const date = new Date(dateKey)
        const month = date.getMonth()
        monthlySales.set(month, (monthlySales.get(month) || 0) + sales)
      })
      
      // Fill 12 months of data
      for (let i = 0; i < 12; i++) {
        data.push(monthlySales.get(i) || 0)
      }
      // Pad to 14 data points
      while (data.length < dataPoints) {
        data.push(0)
      }
    } else {
      // For monthly periods, use daily aggregation
      const interval = Math.max(1, Math.floor(daysInPeriod / dataPoints))
      
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + (i * interval))
        const dateKey = date.toISOString().split('T')[0]
        data.push(dailySales.get(dateKey) || 0)
      }
    }

    return data
  }, [orders, salesPeriod])

  // Calculate sales metrics for the selected period
  const periodMetrics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { totalSales: 0, totalOrders: 0, avgTicketSize: 0 }
    }

    const now = new Date()
    let startDate: Date

    switch (salesPeriod) {
      case "This month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "Last month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        const filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.orderDate)
          return orderDate >= startDate && orderDate <= endDate
        })
        const totalSales = filteredOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
        const totalOrders = filteredOrders.length
        return {
          totalSales,
          totalOrders,
          avgTicketSize: totalOrders > 0 ? totalSales / totalOrders : 0
        }
      case "This year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const filteredOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= startDate && orderDate <= now
    })

    const totalSales = filteredOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    const totalOrders = filteredOrders.length
    return {
      totalSales,
      totalOrders,
      avgTicketSize: totalOrders > 0 ? totalSales / totalOrders : 0
    }
  }, [orders, salesPeriod])

  // Get operations metrics
  const operationsMetrics = useMerchantOperations(numericStoreId)

  // Get customer segments
  const customerSegments = useMerchantCustomers(numericStoreId)
  
  // Filter logic
  const showGrowth = activeFilter === "All" || activeFilter === "Growth"
  const showOperations = activeFilter === "All" || activeFilter === "Operations"
  const showTips = activeFilter === "All" || activeFilter === "Tips"
  const showAnnouncements = activeFilter === "All" || activeFilter === "Announcements"

  // Show loading state while finding store
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  return (
    <MerchantLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-2 text-sm text-gray-600">Welcome back, {userDisplayName}</div>
          <h1 className="text-2xl font-extrabold mb-4">Today's overview</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Gross sales" value={`$${metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <Stat label="Total orders" value={metrics.totalOrders.toString()} />
            <Stat label="Average ticket size" value={`$${metrics.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          </div>

          {/* Insights filter tabs */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Insights and actions</h2>
            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={() => setActiveFilter("All")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "All" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter("Growth")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Growth" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Growth
              </button>
              <button 
                onClick={() => setActiveFilter("Operations")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Operations" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Operations
              </button>
              <button 
                onClick={() => setActiveFilter("Tips")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Tips" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Tips
              </button>
              <button 
                onClick={() => setActiveFilter("Announcements")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Announcements" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Announcements
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {showTips && (
              <InsightCard 
                title="Manage your business, right from your phone" 
                body="Get the Business Manager app to track your orders, resolve issues, get support and more." 
                cta="Download the app"
                category="Tips"
              />
            )}

            {showAnnouncements && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Announcements</div>
                  <div className="font-semibold mb-1">New! See how DashDoor can help grow your business</div>
                  <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View solutions center</button>
                </div>
                <div className="text-gray-300"><Megaphone className="h-12 w-12" /></div>
              </div>
            )}

            {showGrowth && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Growth</div>
                  <div className="font-semibold mb-1">You missed Most Loved for April</div>
                  <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View performance</button>
                </div>
                <div className="text-gray-300"><TrendingUp className="h-12 w-12" /></div>
              </div>
            )}

            {showOperations && <OperationsReviewCard />}
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Gross sales</div>
              <select 
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value as "This month" | "Last month" | "This year")}
                className="text-xs text-gray-500 border-0 bg-transparent cursor-pointer"
              >
                <option>This month</option>
                <option>Last month</option>
                <option>This year</option>
              </select>
            </div>
            <div className="text-2xl font-bold mb-2">
              ${periodMetrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mb-3">
              <SalesChart data={salesData} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <div><div className="text-gray-500">Total orders</div><div className="font-medium">{periodMetrics.totalOrders}</div></div>
              <div><div className="text-gray-500">Avg ticket size</div><div className="font-medium">${periodMetrics.avgTicketSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div></div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View sales insights</button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
            <div className="font-semibold mb-2">Operations</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Avoidable cancellations rate</span><span>{operationsMetrics.avoidableCancellationsRate.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Average wait</span><span>{operationsMetrics.averageWait} mins</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Missing & incorrect rate</span><span>{operationsMetrics.missingIncorrectRate.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Downtime</span><span>{operationsMetrics.downtime.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Ratings</span><span>{operationsMetrics.ratings > 0 ? `${operationsMetrics.ratings.toFixed(1)}/5` : 'N/A'}</span></div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View operations insights</button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="font-semibold mb-2">Customers</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">New</span><span>{customerSegments.new}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Occasional</span><span>{customerSegments.occasional}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Returning</span><span>{customerSegments.returning}</span></div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View customers insights</button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}
