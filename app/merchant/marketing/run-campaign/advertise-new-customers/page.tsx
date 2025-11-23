'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Pencil } from "lucide-react"

export default function AdvertiseNewCustomersPage() {
  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertise to new customers</h1>
              <p className="text-sm text-gray-600">
                You could be featured prominently on the DashDoor app and seen by more customers. You only pay for ads when you receive an order.
              </p>
            </div>

            {/* Stores */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Stores</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">Frosty Bear test NCP</div>
                <div className="text-sm text-gray-700">Mama Carpino's Italian, Caviar Test Store</div>
              </div>
            </div>

            {/* Ad placement */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Ad placement</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">Featured on homepage and search results</div>
            </div>

            {/* Target audience */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Target audience</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">New customers only</div>
            </div>

            {/* Campaign length */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Campaign length</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">Starts on 04/23/2025, runs for 30 days</div>
            </div>

            {/* Average weekly budget */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Average weekly budget</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">$500 per week</div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Preview</h3>
              <p className="text-xs text-gray-500 mb-4">For illustrative purposes only. Subject to change.</p>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                <div className="w-32 h-56 bg-white rounded-lg p-3 flex flex-col gap-2">
                  <div className="text-xs font-semibold mb-1">Featured</div>
                  <div className="w-full h-20 bg-gray-200 rounded"></div>
                  <div className="text-xs text-gray-600">Frosty Bear</div>
                </div>
              </div>
            </div>

            {/* Sales and cost estimate */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Sales and cost estimate</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. weekly sales</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. return on ad spend</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. weekly cost</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-600">
                  We currently don't have historical estimates for this ad campaign. To see an estimate, try adjusting your budget or target audience.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Cost per order</div>
                  <div className="text-lg font-semibold text-gray-900">$2.50 - $5.00</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-gray-700">
                  You only pay when your ad leads to an order. No orders, no cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

