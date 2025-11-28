'use client'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { BarChart2, ChevronDown, Table2, Info } from "lucide-react"
import SalesOverTimeChart from "@/components/merchant/SalesOverTimeChart"
import ByDayOfWeekChart from "@/components/merchant/ByDayOfWeekChart"
import ByHourOfDayChart from "@/components/merchant/ByHourOfDayChart"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"
import { useOrdersStore } from "@/store/orders-store"

/**
 * Route: /merchant/store/[id]/insights/sales
 * 
 * Sales insights page for a specific store
 */
export default function SalesPage() {
  const params = useParams()
  const router = useRouter()
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore()
  const { data: restaurants, isLoading } = useAllRestaurants()
  const [storeSet, setStoreSet] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<"last7days" | "7daysPrior" | "custom">("last7days")
  const [activeTabSales, setActiveTabSales] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [activeTabDay, setActiveTabDay] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [activeTabHour, setActiveTabHour] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")
  const [salesData, setSalesData] = useState<any>(null)
  const [priorSalesData, setPriorSalesData] = useState<any>(null)
  const [isLoadingSales, setIsLoadingSales] = useState(true)

  const storeIdParam = params.id as string

  // Track mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet || !mounted) return

    let restaurant = restaurants.find(r => r.id === storeIdParam)
    if (!restaurant) {
      restaurant = restaurants.find(r => 
        r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
        r.name === storeIdParam
      )
    }

    if (restaurant) {
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id)
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true')
      }
      setStoreSet(true)
    } else {
      if (contextStoreId !== '1') {
        setCurrentStoreId('1')
      }
      setStoreSet(true)
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet, mounted])

  // Get orders from localStorage
  const { orders: allOrders = [] } = useOrdersStore()
  
  // Calculate sales data from localStorage orders
  useEffect(() => {
    if (!mounted || !storeIdParam) return

    setIsLoadingSales(true)
    try {
      // Filter orders for this store
      const storeOrders = allOrders.filter((order: any) => {
        const orderStoreId = order.storeId || order.restaurantId;
        return String(orderStoreId) === String(storeIdParam);
      })

      // Calculate date ranges
      const today = new Date()
      const last7DaysEnd = new Date(today)
      last7DaysEnd.setHours(23, 59, 59, 999)
      const last7DaysStart = new Date(today)
      last7DaysStart.setDate(today.getDate() - 6)
      last7DaysStart.setHours(0, 0, 0, 0)

      const prior7DaysEnd = new Date(last7DaysStart)
      prior7DaysEnd.setDate(prior7DaysEnd.getDate() - 1)
      prior7DaysEnd.setHours(23, 59, 59, 999)
      const prior7DaysStart = new Date(prior7DaysEnd)
      prior7DaysStart.setDate(prior7DaysStart.getDate() - 6)
      prior7DaysStart.setHours(0, 0, 0, 0)

      // Helper to check if order is in date range
      const isInDateRange = (orderDate: string | Date, start: Date, end: Date) => {
        const date = new Date(orderDate)
        return date >= start && date <= end
      }

      // Filter orders by date range
      const currentPeriodOrders = storeOrders.filter((order: any) => {
        const orderDate = order.orderDate || order.orderCreatedAt
        if (!orderDate) return false
        return isInDateRange(orderDate, last7DaysStart, last7DaysEnd)
      })

      const priorPeriodOrders = storeOrders.filter((order: any) => {
        const orderDate = order.orderDate || order.orderCreatedAt
        if (!orderDate) return false
        return isInDateRange(orderDate, prior7DaysStart, prior7DaysEnd)
      })

      // Calculate sales metrics for current period
      const calculateSalesData = (orders: any[]) => {
        const completedOrders = orders.filter((o: any) => {
          const status = o.status?.toLowerCase() || ''
          return status === 'completed' || status === 'delivered' || status === 'confirmed'
        })

        const grossSales = completedOrders.reduce((sum: number, order: any) => {
          const total = order.total || order.subtotal || 0
          // Handle both cents and dollars
          return sum + (total > 1000 ? total / 100 : total)
        }, 0)

        const totalOrders = completedOrders.length
        const averageTicketSize = totalOrders > 0 ? grossSales / totalOrders : 0

        // Group by date
        const salesByDate: Record<string, { sales: number; orders: number }> = {}
        completedOrders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate || order.orderCreatedAt)
          const date = orderDate.toISOString().split('T')[0]
          if (!salesByDate[date]) {
            salesByDate[date] = { sales: 0, orders: 0 }
          }
          const total = order.total || order.subtotal || 0
          salesByDate[date].sales += total > 1000 ? total / 100 : total
          salesByDate[date].orders += 1
        })

        // Group by day of week
        const salesByDayOfWeek: Record<string, { sales: number; orders: number }> = {
          'Sun': { sales: 0, orders: 0 }, 'Mon': { sales: 0, orders: 0 }, 'Tue': { sales: 0, orders: 0 },
          'Wed': { sales: 0, orders: 0 }, 'Thu': { sales: 0, orders: 0 }, 'Fri': { sales: 0, orders: 0 },
          'Sat': { sales: 0, orders: 0 },
        }
        completedOrders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate || order.orderCreatedAt)
          const dayOfWeek = orderDate.toLocaleDateString('en-US', { weekday: 'short' })
          const total = order.total || order.subtotal || 0
          salesByDayOfWeek[dayOfWeek].sales += total > 1000 ? total / 100 : total
          salesByDayOfWeek[dayOfWeek].orders += 1
        })

        // Group by hour
        const salesByHour: Record<number, { sales: number; orders: number }> = {}
        for (let i = 0; i < 24; i++) {
          salesByHour[i] = { sales: 0, orders: 0 }
        }
        completedOrders.forEach((order: any) => {
          const orderDate = new Date(order.orderDate || order.orderCreatedAt)
          const hour = orderDate.getHours()
          const total = order.total || order.subtotal || 0
          salesByHour[hour].sales += total > 1000 ? total / 100 : total
          salesByHour[hour].orders += 1
        })

        return {
          grossSales,
          totalOrders,
          averageTicketSize,
          salesByDate,
          salesByDayOfWeek,
          salesByHour,
        }
      }

      setSalesData(calculateSalesData(currentPeriodOrders))
      setPriorSalesData(calculateSalesData(priorPeriodOrders))
    } catch (error) {
      console.error('Error calculating sales data:', error)
    } finally {
      setIsLoadingSales(false)
    }
  }, [mounted, storeIdParam, allOrders])

  // Show loading state while finding store or not mounted
  if (isLoading || !mounted || isLoadingSales) {
    return (
      <MerchantLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </MerchantLayout>
    )
  }

  // Calculate metrics from real data
  const grossSales = salesData?.grossSales || 0
  const totalOrders = salesData?.totalOrders || 0
  const averageTicketSize = salesData?.averageTicketSize || 0

  const priorGrossSales = priorSalesData?.grossSales || 0
  const priorTotalOrders = priorSalesData?.totalOrders || 0
  const priorAverageTicketSize = priorSalesData?.averageTicketSize || 0

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, prior: number) => {
    if (prior === 0) return current > 0 ? 100 : 0
    return ((current - prior) / prior) * 100
  }

  const grossSalesChange = calculatePercentageChange(grossSales, priorGrossSales)
  const totalOrdersChange = calculatePercentageChange(totalOrders, priorTotalOrders)
  const averageTicketSizeChange = calculatePercentageChange(averageTicketSize, priorAverageTicketSize)

  // Generate date range for last 7 days
  const generateDateRange = (days: number) => {
    const dates: string[] = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const last7DaysDates = generateDateRange(7)
  const prior7DaysDates = generateDateRange(7).map(date => {
    const d = new Date(date)
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })

  // Transform sales by date into chart format
  const getChartData = (dates: string[], data: any, type: "Sales" | "Total orders" | "Average ticket value") => {
    return dates.map(date => {
      const dayData = data?.salesByDate?.[date] || { sales: 0, orders: 0 }
      let value = 0
      if (type === "Sales") {
        value = dayData.sales || 0
      } else if (type === "Total orders") {
        value = dayData.orders || 0
      } else {
        value = dayData.orders > 0 ? dayData.sales / dayData.orders : 0
      }
      return { date, value }
    })
  }

  const chartData = getChartData(last7DaysDates, salesData, activeTabSales)
  const priorChartData = getChartData(prior7DaysDates, priorSalesData, activeTabSales)

  // Transform day of week data
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const getDayOfWeekData = (data: any, type: "Sales" | "Total orders" | "Average ticket value") => {
    return dayOrder.map(day => {
      const dayData = data?.salesByDayOfWeek?.[day] || { sales: 0, orders: 0 }
      let value = 0
      if (type === "Sales") {
        value = dayData.sales || 0
      } else if (type === "Total orders") {
        value = dayData.orders || 0
      } else {
        value = dayData.orders > 0 ? dayData.sales / dayData.orders : 0
      }
      return { day, value }
    })
  }

  const dayOfWeekData = getDayOfWeekData(salesData, activeTabDay)
  const priorDayOfWeekData = getDayOfWeekData(priorSalesData, activeTabDay)

  // Transform hour of day data
  const getHourOfDayData = (data: any, type: "Sales" | "Total orders" | "Average ticket value") => {
    return Array.from({ length: 24 }, (_, i) => {
      const hourData = data?.salesByHour?.[i] || { sales: 0, orders: 0 }
      let value = 0
      if (type === "Sales") {
        value = hourData.sales || 0
      } else if (type === "Total orders") {
        value = hourData.orders || 0
      } else {
        value = hourData.orders > 0 ? hourData.sales / hourData.orders : 0
      }
      return {
        hour: i === 0 ? "12 am" : i < 12 ? `${i} am` : i === 12 ? "12 pm" : `${i - 12} pm`,
        value,
      }
    })
  }

  const hourOfDayData = getHourOfDayData(salesData, activeTabHour)
  const priorHourOfDayData = getHourOfDayData(priorSalesData, activeTabHour)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDateRangeText = () => {
    if (dateRange === "last7days") {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)
      const priorEndDate = new Date(startDate)
      priorEndDate.setDate(priorEndDate.getDate() - 1)
      const priorStartDate = new Date(priorEndDate)
      priorStartDate.setDate(priorStartDate.getDate() - 6)
      
      const formatDateRange = (start: Date, end: Date) => {
        const startStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        const endStr = end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        return `${startStr} - ${endStr}`
      }
      
      return `Last 7 days (${formatDateRange(startDate, today)}) vs. 7 days prior (${formatDateRange(priorStartDate, priorEndDate)})`
    } else if (dateRange === "7daysPrior") {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 13)
      const endDate = new Date(today)
      endDate.setDate(today.getDate() - 7)
      return `7 days prior (${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })})`
    }
    return "Custom range"
  }

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <Info className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Last updated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Gross Sales */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Gross sales</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(grossSales)}</p>
            <div className={`flex items-center gap-1 text-sm ${grossSalesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{grossSalesChange >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(grossSalesChange).toFixed(1)}% vs. 7 days prior</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total orders</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{totalOrders}</p>
            <div className={`flex items-center gap-1 text-sm ${totalOrdersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{totalOrdersChange >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(totalOrdersChange).toFixed(1)}% vs. 7 days prior</span>
            </div>
          </div>

          {/* Average Ticket Size */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Average ticket size</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(averageTicketSize)}</p>
            <div className={`flex items-center gap-1 text-sm ${averageTicketSizeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{averageTicketSizeChange >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(averageTicketSizeChange).toFixed(1)}% vs. 7 days prior</span>
            </div>
          </div>
        </div>

        {/* Sales over time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales over time</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("chart")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "chart"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <BarChart2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Table2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTabSales("Sales")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabSales === "Sales"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTabSales("Total orders")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabSales === "Total orders"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Total orders
            </button>
            <button
              onClick={() => setActiveTabSales("Average ticket value")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabSales === "Average ticket value"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Average ticket value
            </button>
          </div>

          {/* Date Range Description */}
          <p className="text-sm text-gray-600 mb-6">{getDateRangeText()}</p>

          {/* Chart or Table */}
          {viewMode === "chart" ? (
            <div>
              <SalesOverTimeChart data={chartData} priorData={priorChartData} type={activeTabSales} />
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">
                    Last 7 days {formatDate(last7DaysDates[0])} - {formatDate(last7DaysDates[6])}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">
                    7 days prior {formatDate(prior7DaysDates[0])} - {formatDate(prior7DaysDates[6])}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">
                      {activeTabSales === "Sales" ? "Sales" : activeTabSales === "Total orders" ? "Orders" : "Avg Ticket"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(item.date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {activeTabSales === "Sales" 
                          ? formatCurrency(item.value)
                          : activeTabSales === "Total orders"
                          ? item.value
                          : formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* By day of week */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">By day of week</h2>
          <p className="text-sm text-gray-600 mb-4">
            Last 7 days ({formatDate(last7DaysDates[0])} - {formatDate(last7DaysDates[6])}) vs. 7 days prior ({formatDate(prior7DaysDates[0])} - {formatDate(prior7DaysDates[6])})
          </p>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTabDay("Sales")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabDay === "Sales"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTabDay("Total orders")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabDay === "Total orders"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Total orders
            </button>
            <button
              onClick={() => setActiveTabDay("Average ticket value")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTabDay === "Average ticket value"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Average ticket value
            </button>
          </div>

          <ByDayOfWeekChart data={dayOfWeekData} priorData={priorDayOfWeekData} type={activeTabDay} />
        </div>

        {/* By hour of day */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">By hour of day</h2>
          <p className="text-sm text-gray-600 mb-4">
            Last 7 days ({formatDate(last7DaysDates[0])} - {formatDate(last7DaysDates[6])}) vs. 7 days prior ({formatDate(prior7DaysDates[0])} - {formatDate(prior7DaysDates[6])})
          </p>

          <ByHourOfDayChart data={hourOfDayData} priorData={priorHourOfDayData} type={activeTabHour} />
        </div>

        {/* Sales breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales breakdown</h2>
            <Info className="h-4 w-4 text-gray-400" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-gray-900"
            >
              Fulfillment methods
            </button>
          </div>

          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">No data available for this period</p>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}
