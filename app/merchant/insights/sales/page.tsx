'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { BarChart2, ChevronDown, Table2, Info } from "lucide-react"
import SalesOverTimeChart from "@/components/merchant/SalesOverTimeChart"
import ByDayOfWeekChart from "@/components/merchant/ByDayOfWeekChart"
import ByHourOfDayChart from "@/components/merchant/ByHourOfDayChart"

export default function SalesPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<"last7days" | "7daysPrior" | "custom">("last7days")
  const [activeTabSales, setActiveTabSales] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [activeTabDay, setActiveTabDay] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [activeTabHour, setActiveTabHour] = useState<"Sales" | "Total orders" | "Average ticket value">("Sales")
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")

  // Mock data - in production, this would come from API
  const grossSales = 0.00
  const totalOrders = 0
  const averageTicketSize = 0.00

  // Mock chart data - Last 7 days
  const chartData = [
    { date: "2025-11-19", value: 0 },
    { date: "2025-11-20", value: 0 },
    { date: "2025-11-21", value: 0 },
    { date: "2025-11-22", value: 0 },
    { date: "2025-11-23", value: 0 },
    { date: "2025-11-24", value: 0 },
    { date: "2025-11-25", value: 0 },
  ]

  // Prior period data
  const priorChartData = [
    { date: "2025-11-12", value: 0 },
    { date: "2025-11-13", value: 0 },
    { date: "2025-11-14", value: 0 },
    { date: "2025-11-15", value: 0 },
    { date: "2025-11-16", value: 0 },
    { date: "2025-11-17", value: 0 },
    { date: "2025-11-18", value: 0 },
  ]

  // By day of week data
  const dayOfWeekData = [
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
  ]

  const priorDayOfWeekData = [
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
  ]

  // By hour of day data (24 hours) - formatted for display
  const hourOfDayData = Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? "12 am" : i < 12 ? `${i} am` : i === 12 ? "12 pm" : `${i - 12} pm`,
    value: 0,
  }))

  const priorHourOfDayData = Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? "12 am" : i < 12 ? `${i} am` : i === 12 ? "12 pm" : `${i - 12} pm`,
    value: 0,
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDateRangeText = () => {
    if (dateRange === "last7days") {
      return "Last 7 days (Wed, Nov 19 - Tue, Nov 25, 2025) vs. 7 days prior (Wed, Nov 12 - Tue, Nov 18, 2025)"
    } else if (dateRange === "7daysPrior") {
      return "7 days prior (Wed, Nov 12 - Tue, Nov 18, 2025)"
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
            Last updated on Nov 25, 2025, 1:45 AM GMT+3
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Gross Sales */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Gross sales</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(grossSales)}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <span>▲</span>
              <span>--% vs. 7 days prior</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total orders</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{totalOrders}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <span>▲</span>
              <span>--% vs. 7 days prior</span>
            </div>
          </div>

          {/* Average Ticket Size */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Average ticket size</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(averageTicketSize)}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <span>▲</span>
              <span>--% vs. 7 days prior</span>
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
                    Last 7 days Wed, Nov 19 - Tue, Nov 25, 2025
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">
                    7 days prior Wed, Nov 12 - Tue, Nov 18, 2025
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
            Last 7 days (Nov 19 - Nov 25, 2025) vs. 7 days prior (Nov 12 - Nov 18, 2025)
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
            Last 7 days (Nov 19 - Nov 25, 2025) vs. 7 days prior (Nov 12 - Nov 18, 2025)
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
