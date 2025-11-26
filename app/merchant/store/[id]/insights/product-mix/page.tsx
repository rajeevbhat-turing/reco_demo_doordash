'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ProductMixPage() {
  const [dateRange, setDateRange] = useState<"last7days" | "7daysPrior">("last7days")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - empty for now
  const items: any[] = []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product mix</h1>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setDateRange("last7days")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
              dateRange === "last7days"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Last 7 days
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => setDateRange("7daysPrior")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
              dateRange === "7daysPrior"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            7 days prior
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for an item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {items.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center">
              {/* Empty State Illustration */}
              <div className="mb-4 w-48 h-48 flex items-center justify-center">
                <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Simplified illustration - orange hand holding purple circle */}
                  <circle cx="96" cy="96" r="40" fill="#9333EA" opacity="0.3" />
                  <circle cx="96" cy="96" r="30" fill="#9333EA" />
                  <circle cx="90" cy="92" r="4" fill="white" />
                  <circle cx="102" cy="92" r="4" fill="white" />
                  <ellipse cx="96" cy="100" rx="8" ry="4" fill="white" />
                  {/* Hand shape */}
                  <path d="M60 120 Q50 110 50 130 Q50 150 60 150 Q70 150 75 140 L80 130 Q85 120 80 110 Q75 100 70 105 L65 110 Q60 115 60 120 Z" fill="#F97316" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adjust your filters or clear your search and try again.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Items</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Total sold</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Change</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Gross sales</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Change</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Item errors</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Error charges</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Customer discounts</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{item.totalSold}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={item.change >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.change >= 0 ? "+" : ""}{item.change}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.grossSales)}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={item.salesChange >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.salesChange >= 0 ? "+" : ""}{item.salesChange}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{item.itemErrors}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.errorCharges)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.customerDiscounts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MerchantLayout>
  )
}
