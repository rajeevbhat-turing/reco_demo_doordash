'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ChevronDown } from "lucide-react"

export default function CustomerInsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("This month")
  const [selectedCustomerType, setSelectedCustomerType] = useState("All")

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Date Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              {selectedPeriod}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Overview</h2>
              <p className="text-sm text-gray-600">Apr 1-15, 2025 compared to Mar 4-18, 2025</p>
            </div>
            <p className="text-sm text-gray-500">Last updated on Apr 15, 2025</p>
          </div>

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total Customers */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#ef4444"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${0 * 351.86} 351.86`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">Total customers</div>
              <div className="text-sm text-gray-500">--%</div>
            </div>

            {/* New Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">New</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">--%</div>
              <div className="text-sm text-gray-500">0 DashPass customers</div>
            </div>

            {/* Occasional Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Occasional</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">--%</div>
              <div className="text-sm text-gray-500">0 DashPass customers</div>
            </div>

            {/* Frequent Customers */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Frequent</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">--%</div>
              <div className="text-sm text-gray-500">0 DashPass customers</div>
            </div>
          </div>

          {/* DashPass Description */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              DashPass is a loyalty subscription service for customers. DashPass customers frequently place high-value orders.
            </p>
          </div>
        </div>

        {/* Customer Locations Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Customer locations</h2>
            <p className="text-sm text-gray-600 mb-4">Top delivery destinations</p>
            
            {/* Customer Type Filters */}
            <div className="flex items-center gap-2 mb-4">
              {["All", "New", "Occasional", "Frequent"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedCustomerType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCustomerType === type
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This map shows customer locations when at least 2 customers place orders from the same zip code.
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Map View</p>
              <p className="text-sm">Customer locations map will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

