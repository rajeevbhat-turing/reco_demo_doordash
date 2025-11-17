'use client'
import { useState, useEffect } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, RefreshCw, Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

function FilterBar({ searchValue, onSearchChange }: { searchValue: string; onSearchChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <select className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700">
          <option>All Channels</option>
          <option>DashDoor</option>
          <option>Pickup</option>
        </select>
        <select className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700">
          <option>Status</option>
          <option>Delivered</option>
          <option>Picked Up</option>
          <option>Scheduled Delivery</option>
          <option>Cancelled</option>
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

export default function MerchantOrdersPage() {
  const [searchValue, setSearchValue] = useState("")
  const [lastUpdated, setLastUpdated] = useState(14)

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((prev) => (prev >= 60 ? 1 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLastUpdated(0)
  }

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
            <p className="text-sm text-gray-600">
              Track all your orders from every channel in real time. For even more order details, go to{" "}
              <a href="#" className="text-blue-600 hover:underline">Orders Breakdown</a>.
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
        <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Active
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          Scheduled
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          History
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-4">
        <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} />
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Order ID</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Status</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Date</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Time</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Customer</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Dasher</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Channel</th>
              <th className="text-right font-medium px-4 py-3 text-gray-700">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">BDC96DA6</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Scheduled Delivery
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">4/4/2023</td>
              <td className="px-4 py-3">
                <div className="text-gray-900">12:20 PM</div>
                <div className="text-xs text-gray-500">Est. Pickup</div>
              </td>
              <td className="px-4 py-3 text-gray-600">Hannah B</td>
              <td className="px-4 py-3 text-gray-600">Nuredin</td>
              <td className="px-4 py-3 text-gray-600">DoorDash</td>
              <td className="px-4 py-3 text-right font-medium">$26.47</td>
            </tr>
          </tbody>
        </table>
      </div>

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
          <span>Showing 1-1 of 1</span>
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


