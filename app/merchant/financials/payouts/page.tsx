'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Info, X, DollarSign } from "lucide-react"

export default function PayoutsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 30 days")
  const [showBanner, setShowBanner] = useState(true)

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts</h1>
          <p className="text-sm text-gray-600">
            Here is where you will find a summary of your Transactions and Payouts.{" "}
            <a href="#" className="text-blue-600 hover:underline">Learn more</a>
          </p>
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>

        {/* Informational Banner */}
        {showBanner && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3 relative">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Introducing a new metric - marketing spend.</span> To help you better track and understand your marketing efforts, we're unveiling a new metric - marketing spend. This number represents the total you paid to <strong>DashDoor</strong> to run marketing after marketing credits and third-party contributions have been deducted. You'll also be able to download reports.
              </p>
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

        {/* Empty State */}
        <div className="bg-white border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
              <DollarSign className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No financial records were found for the selected time range or store.
          </h2>
        </div>
      </div>
    </MerchantLayout>
  )
}

